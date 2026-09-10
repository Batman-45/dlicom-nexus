/**
 * Dlicom Nexus - Pipeline Execution Engine
 * Orchestrates step-by-step DAG execution, payload cascading, logs, and telemetry.
 * Implements client-side transforms, simulated latency, and live proxy support.
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
import { globalExecutionStore } from '../store/executionStore';
import { globalPipelineStore } from '../store/pipelineStore';
import { evaluateSafeExpression, interpolateTemplateString } from './safeEvaluator';

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
      triggerPayload: options.triggerPayload ?? {
        timestamp: new Date().toISOString(),
        event: 'manual_trigger',
        network: 'ethereum_mainnet',
        rawAmount: '50000000000000000000',
        volumeUSD: 75000,
        slippagePct: 1.85,
        txHash: '0x3a9f84b109e25d21a83b169994c92b8d601bce41a87e594d5091b65e7194f830'
      }
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

    // Register active run in globalExecutionStore
    globalExecutionStore.recordRun(run);
    this.addLog(run, 'info', `Initiating execution for pipeline: "${this.pipeline.name}" (v${this.pipeline.version})`);
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
      globalExecutionStore.recordRun(run);
      return run;
    }

    const nodeMap = new Map<string, NexusNode>();
    this.pipeline.nodes.forEach(n => {
      nodeMap.set(n.id, n);
      // Reset visual node status in store to idle
      globalPipelineStore.updateNode(n.id, { status: 'idle' });
    });

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
      this.addLog(run, 'debug', `Executing Tier ${tierIndex + 1}/${validation.executionTiers.length} [Nodes: ${currentTier.join(', ')}]`);

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
          globalPipelineStore.updateNode(node.id, { status: 'running' });
          globalNexusEvents.emit('execution:step_start', { runId: run.id, step });

          if (this.options.stepDelayMs && this.options.stepDelayMs > 0) {
            await new Promise(res => setTimeout(res, this.options.stepDelayMs));
          }

          try {
            const output = await this.executeNode(node, inputPayload, run);
            const stepDuration = Math.round(performance.now() - stepStartTime);
            step.status = 'success';
            step.outputPayload = output;
            step.finishedAt = new Date().toISOString();
            step.durationMs = stepDuration;

            nodeOutputs.set(node.id, output);
            run.metrics.nodesSucceeded++;
            run.metrics.nodesExecuted++;

            globalPipelineStore.updateNode(node.id, {
              status: 'success',
              lastExecutionDuration: stepDuration
            });

            // Propagate outputs to downstream target nodes
            const outgoingEdges = this.pipeline.edges.filter(e => e.source === node.id);
            for (const edge of outgoingEdges) {
              const targetExisting = nodeInputs.get(edge.target);
              if (targetExisting && typeof targetExisting === 'object') {
                nodeInputs.set(edge.target, { ...(targetExisting as object), [node.id]: output });
              } else {
                nodeInputs.set(edge.target, output);
              }
            }

            globalNexusEvents.emit('execution:step_finish', { runId: run.id, step });
          } catch (err: unknown) {
            const stepDuration = Math.round(performance.now() - stepStartTime);
            step.status = 'error';
            step.finishedAt = new Date().toISOString();
            step.durationMs = stepDuration;
            step.error = {
              message: err instanceof Error ? err.message : String(err)
            };

            run.metrics.nodesFailed++;
            run.metrics.nodesExecuted++;
            this.addLog(run, 'error', `Node "${node.data.label}" failed: ${step.error.message}`, node.id, node.data.label);
            
            globalPipelineStore.updateNode(node.id, {
              status: 'error',
              lastExecutionDuration: stepDuration,
              lastExecutionError: step.error.message
            });

            globalNexusEvents.emit('execution:step_finish', { runId: run.id, step });
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
    } else if (run.status === 'error') {
      this.addLog(run, 'error', `Pipeline execution terminated with failure in ${totalDuration}ms`);
      globalNexusEvents.emit('execution:error', { runId: run.id, error: 'Pipeline execution failed' });
    }

    globalExecutionStore.recordRun(run);
    globalNexusEvents.emit('execution:finish', { run });
    return run;
  }

  private async executeNode(node: NexusNode, input: unknown, run: ExecutionRun): Promise<unknown> {
    const category = node.data.category;
    const type = node.data.type;
    this.addLog(run, 'info', `Processing node: [${node.data.label}] category=${category} type=${type}`, node.id, node.data.label);

    // Simulated failure injection for failure-path testing
    if (node.data.config?.simulateFailure === true) {
      throw new Error(`Simulated node failure: [${node.data.label}] encountered an unrecoverable RPC exception.`);
    }

    const inputObj = (typeof input === 'object' && input !== null) ? (input as Record<string, unknown>) : { value: input };

    switch (category) {
      case 'trigger': {
        this.addLog(run, 'debug', `Trigger [${node.data.label}] activated with inbound payload`, node.id);
        if (type === 'dlicom-social-signal') {
          return {
            ...inputObj,
            source: 'dlicom-social-signal',
            username: node.data.config?.username || inputObj.username || 'vitalikbuterin',
            displayName: node.data.config?.displayName || inputObj.displayName || 'Vitalik Buterin',
            archetype: node.data.config?.archetype || inputObj.archetype || 'RESEARCH_QUANT',
            familyId: node.data.config?.familyId || inputObj.familyId || 'RESEARCH_FELLOWSHIP',
            variantId: node.data.config?.variantId || inputObj.variantId || 'research_quant_v1',
            interactionScore: Number(node.data.config?.interactionScore || inputObj.interactionScore || 92),
            traits: node.data.config?.traits || inputObj.traits || { outfit: 'Scholar Robes', equipment: 'Proof Terminal' },
            timestamp: new Date().toISOString()
          };
        }
        return {
          ...inputObj,
          source: type,
          receivedAt: new Date().toISOString(),
          network: inputObj.network || 'ethereum_mainnet',
          blockNumber: 19845210 + Math.floor(Math.random() * 100),
          txHash: inputObj.txHash || `0x${Math.random().toString(16).substring(2, 10)}...`,
          payload: input
        };
      }

      case 'transform': {
        this.addLog(run, 'debug', `Transform [${node.data.label}] executing client-side rule`, node.id);

        // Custom deterministic expression evaluation
        if (node.data.config?.expression && typeof node.data.config.expression === 'string') {
          const expr = (node.data.config.expression as string).trim();
          let evaluated: unknown;
          if (expr.startsWith('{') && expr.endsWith('}')) {
            try {
              evaluated = JSON.parse(expr);
            } catch {
              evaluated = {
                transformed: true,
                expression: expr,
                data: inputObj
              };
            }
          } else {
            evaluated = evaluateSafeExpression(expr, inputObj);
          }
          return {
            ...inputObj,
            transformed: true,
            expression: expr,
            result: evaluated,
            evaluatedAt: new Date().toISOString()
          };
        }

        // Client-side schema transform / filtering
        if (type === 'data-filter') {
          if (node.data.config?.filterExpression && typeof node.data.config.filterExpression === 'string') {
            const passed = Boolean(evaluateSafeExpression(node.data.config.filterExpression, inputObj));
            return {
              ...inputObj,
              passed,
              filterCriterion: node.data.config.filterExpression,
              timestamp: new Date().toISOString()
            };
          }

          const innerPayload = (typeof inputObj.payload === 'object' && inputObj.payload !== null)
            ? (inputObj.payload as Record<string, unknown>)
            : inputObj;
          const volumeUSD = Number(inputObj.volumeUSD || innerPayload.volumeUSD || inputObj.value || 75000);
          const isWhale = volumeUSD >= 50000;
          return {
            ...inputObj,
            passed: isWhale,
            filterCriterion: 'volumeUSD >= 50000',
            volumeUSD,
            timestamp: new Date().toISOString(),
            matchedRecords: isWhale ? [input] : []
          };
        }

        return {
          transformed: true,
          canonicalId: `dlicom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          enrichedAt: new Date().toISOString(),
          format: 'dlicom_standard_v2',
          data: input
        };
      }

      case 'ai': {
        this.addLog(run, 'debug', `AI Inference Engine [${node.data.label}] evaluating reasoning model`, node.id);
        // Realistic simulation of AI inference step
        await new Promise(r => setTimeout(r, 20));
        return {
          ...inputObj,
          model: (node.data.config?.model as string) || 'dlicom-fast-3',
          confidenceScore: 0.982,
          intent: 'liquidity_whale_movement',
          riskLevel: 'HIGH_VOLATILITY',
          reasoningSummary: 'Mempool volume delta exceeded 99th percentile across primary pools with 1.85% predicted slippage.',
          tokensUsed: 142,
          analyzedAt: new Date().toISOString()
        };
      }

      case 'sink': {
        this.addLog(run, 'info', `Sink [${node.data.label}] dispatching message packet`, node.id);
        const rawUrl = (node.data.config?.url as string) || (node.data.config?.channelWebhook as string) || '';
        const resolvedUrl = rawUrl ? interpolateTemplateString(rawUrl, inputObj) : undefined;
        const rawChannel = (node.data.config?.channel as string) || '';
        const resolvedChannel = rawChannel ? interpolateTemplateString(rawChannel, inputObj) : undefined;

        return {
          delivered: true,
          protocol: type,
          channel: resolvedChannel || resolvedUrl || 'dlicom-dispatch',
          url: resolvedUrl,
          statusCode: 200,
          deliveredAt: new Date().toISOString(),
          receiptId: `rcpt_${Math.random().toString(36).substring(2, 10)}`
        };
      }

      case 'connector':
      case 'logic':
      default: {
        let resolvedConfig = node.data.config;
        if (node.data.config?.url && typeof node.data.config.url === 'string') {
          resolvedConfig = {
            ...node.data.config,
            resolvedUrl: interpolateTemplateString(node.data.config.url, inputObj)
          };
        }

        return {
          nodeId: node.id,
          executedType: type,
          status: 'ok',
          config: resolvedConfig,
          data: input,
          outputTimestamp: new Date().toISOString()
        };
      }
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
