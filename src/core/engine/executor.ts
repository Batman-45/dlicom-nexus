/**
 * Dlicom Nexus - Pipeline Execution Engine
 * Orchestrates step-by-step DAG execution, payload cascading, logs, and telemetry.
 */

import type {
  ExecutionLog,
  ExecutionRun,
  PipelineManifest,
  StepExecution,
  NexusNode
} from '../../types';
import { DagResolver } from './dagResolver';
import { globalNexusEvents } from './events';

export interface ExecutorOptions {
  triggerPayload?: unknown;
  stepDelayMs?: number;
  environment?: 'development' | 'staging' | 'production';
  initiatedBy?: string;
}

export class PipelineExecutor {
  private pipeline: PipelineManifest;
  private options: ExecutorOptions;
  private isCancelled: boolean = false;

  constructor(pipeline: PipelineManifest, options: ExecutorOptions = {}) {
    this.pipeline = pipeline;
    this.options = {
      stepDelayMs: options.stepDelayMs ?? 150,
      environment: options.environment ?? pipeline.environment ?? 'development',
      initiatedBy: options.initiatedBy ?? 'Dlicom Orchestrator',
      triggerPayload: options.triggerPayload ?? { timestamp: new Date().toISOString(), event: 'manual_trigger' }
    };
  }

  public cancel(): void {
    this.isCancelled = true;
  }

  /**
   * Executes the pipeline and returns the full execution run trace.
   */
  public async execute(): Promise<ExecutionRun> {
    const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const startedAt = new Date().toISOString();

    const run: ExecutionRun = {
      id: runId,
      pipelineId: this.pipeline.id,
      pipelineVersion: this.pipeline.version,
      pipelineName: this.pipeline.name,
      status: 'running',
      triggerMode: 'manual',
      triggerPayload: this.options.triggerPayload,
      environment: this.options.environment!,
      startedAt,
      steps: {},
      stepOrder: [],
      logs: [],
      metrics: {
        totalDurationMs: 0,
        nodesExecuted: 0,
        nodesSucceeded: 0,
        nodesFailed: 0,
        nodesSkipped: 0,
        bytesProcessed: 0
      },
      initiatedBy: this.options.initiatedBy!
    };

    this.addLog(run, 'info', `Initiating execution for pipeline: ${this.pipeline.name} (v${this.pipeline.version})`);
    globalNexusEvents.emit('execution:start', { run });

    // Validate DAG
    const validation = DagResolver.resolve(this.pipeline.nodes, this.pipeline.edges);
    if (!validation.isValid) {
      run.status = 'error';
      run.finishedAt = new Date().toISOString();
      const errMsg = `Pipeline DAG invalid: ${validation.errors.join('; ')}`;
      this.addLog(run, 'error', errMsg);
      globalNexusEvents.emit('execution:error', { runId: run.id, error: errMsg });
      globalNexusEvents.emit('execution:finish', { run });
      return run;
    }

    const nodeMap = new Map<string, NexusNode>();
    this.pipeline.nodes.forEach(n => nodeMap.set(n.id, n));

    const nodeOutputs = new Map<string, unknown>();
    const nodeInputs = new Map<string, unknown>();

    // Root nodes receive trigger payload
    for (const rootId of validation.rootNodeIds) {
      nodeInputs.set(rootId, this.options.triggerPayload);
    }

    const startTime = performance.now();

    // Execute tiers sequentially, with parallel node execution within each tier
    for (let tierIndex = 0; tierIndex < validation.executionTiers.length; tierIndex++) {
      if (this.isCancelled) {
        run.status = 'cancelled';
        this.addLog(run, 'warn', 'Pipeline execution cancelled by user.');
        break;
      }

      const currentTier = validation.executionTiers[tierIndex];
      this.addLog(run, 'debug', `Executing Tier ${tierIndex + 1}/${validation.executionTiers.length} [Nodes: ${currentTier.length}]`);

      // Execute tier nodes in parallel
      await Promise.all(
        currentTier.map(async (nodeId) => {
          if (this.isCancelled) return;

          const node = nodeMap.get(nodeId);
          if (!node) return;

          const stepId = `step_${nodeId}`;
          run.stepOrder.push(stepId);

          const inputPayload = nodeInputs.get(nodeId) || {};
          const stepStartTime = performance.now();

          const step: StepExecution = {
            id: stepId,
            nodeId: node.id,
            nodeLabel: node.data.label,
            nodeType: node.data.type,
            status: 'running',
            startedAt: new Date().toISOString(),
            retryCount: 0,
            inputPayload
          };

          run.steps[stepId] = step;
          globalNexusEvents.emit('execution:step_start', { runId: run.id, step });

          if (this.options.stepDelayMs && this.options.stepDelayMs > 0) {
            await new Promise(res => setTimeout(res, this.options.stepDelayMs));
          }

          try {
            const output = await this.executeNode(node, inputPayload, run);
            step.status = 'success';
            step.outputPayload = output;
            step.finishedAt = new Date().toISOString();
            step.durationMs = Math.round(performance.now() - stepStartTime);

            nodeOutputs.set(node.id, output);
            run.metrics.nodesSucceeded++;
            run.metrics.nodesExecuted++;

            // Propagate outputs to downstream target nodes
            const outgoingEdges = this.pipeline.edges.filter(e => e.source === node.id);
            for (const edge of outgoingEdges) {
              const targetExisting = nodeInputs.get(edge.target);
              if (targetExisting && typeof targetExisting === 'object') {
                nodeInputs.set(edge.target, { ...targetExisting as object, [node.id]: output });
              } else {
                nodeInputs.set(edge.target, output);
              }
            }

            globalNexusEvents.emit('execution:step_finish', { runId: run.id, step });
          } catch (err: unknown) {
            step.status = 'error';
            step.finishedAt = new Date().toISOString();
            step.durationMs = Math.round(performance.now() - stepStartTime);
            step.error = {
              message: err instanceof Error ? err.message : String(err)
            };

            run.metrics.nodesFailed++;
            run.metrics.nodesExecuted++;
            this.addLog(run, 'error', `Node "${node.data.label}" failed: ${step.error.message}`, node.id, node.data.label);
            globalNexusEvents.emit('execution:step_finish', { runId: run.id, step });
            
            // Mark pipeline as error
            run.status = 'error';
          }
        })
      );

      if (run.status === 'error') {
        break;
      }
    }

    const totalDuration = Math.round(performance.now() - startTime);
    run.metrics.totalDurationMs = totalDuration;
    run.finishedAt = new Date().toISOString();

    if (run.status === 'running') {
      run.status = 'success';
      this.addLog(run, 'info', `Pipeline executed successfully in ${totalDuration}ms`);
    }

    globalNexusEvents.emit('execution:finish', { run });
    return run;
  }

  private async executeNode(node: NexusNode, input: unknown, run: ExecutionRun): Promise<unknown> {
    const category = node.data.category;
    this.addLog(run, 'info', `Executing node: [${node.data.label}] category=${category}`, node.id, node.data.label);

    switch (category) {
      case 'trigger':
        return {
          source: node.data.type,
          receivedAt: new Date().toISOString(),
          payload: input
        };

      case 'transform':
        return {
          transformed: true,
          inputLength: typeof input === 'string' ? input.length : 1,
          processedData: input,
          enrichedAt: new Date().toISOString(),
          format: 'dlicom_standard_v2'
        };

      case 'connector':
      case 'ai':
      case 'sink':
      case 'logic':
      default:
        return {
          nodeId: node.id,
          executedType: node.data.type,
          status: 'ok',
          data: input,
          outputTimestamp: new Date().toISOString()
        };
    }
  }

  private addLog(
    run: ExecutionRun,
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    nodeId?: string,
    nodeName?: string
  ): void {
    const log: ExecutionLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      level,
      nodeId,
      nodeName,
      message
    };
    run.logs.push(log);
    globalNexusEvents.emit('execution:log', { runId: run.id, log });
  }
}
