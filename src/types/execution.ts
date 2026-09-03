/**
 * Dlicom Nexus - Execution & Runtime Types
 * Definitions for pipeline execution runs, steps, logs, and telemetry.
 */

export type ExecutionStatus = 
  | 'idle'
  | 'queued'
  | 'running'
  | 'success'
  | 'error'
  | 'paused'
  | 'cancelled';

export type StepStatus = 
  | 'pending'
  | 'running'
  | 'success'
  | 'error'
  | 'skipped';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface ExecutionLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  nodeId?: string;
  nodeName?: string;
  message: string;
  data?: unknown;
}

export interface StepExecution {
  id: string;
  nodeId: string;
  nodeLabel: string;
  nodeType: string;
  status: StepStatus;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  retryCount: number;
  inputPayload?: unknown;
  outputPayload?: unknown;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

export interface ExecutionMetrics {
  totalDurationMs: number;
  nodesExecuted: number;
  nodesSucceeded: number;
  nodesFailed: number;
  nodesSkipped: number;
  bytesProcessed: number;
  tokensConsumed?: number;
  peakMemoryMb?: number;
}

export type TriggerMode = 'manual' | 'webhook' | 'schedule' | 'event' | 'api';

export interface ExecutionRun {
  id: string;
  pipelineId: string;
  pipelineVersion: string;
  pipelineName: string;
  status: ExecutionStatus;
  triggerMode: TriggerMode;
  triggerPayload?: unknown;
  environment: 'development' | 'staging' | 'production';
  startedAt: string;
  finishedAt?: string;
  steps: Record<string, StepExecution>;
  stepOrder: string[];
  logs: ExecutionLog[];
  metrics: ExecutionMetrics;
  initiatedBy: string;
}
