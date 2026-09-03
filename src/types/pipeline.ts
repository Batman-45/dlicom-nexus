/**
 * Dlicom Nexus - Pipeline Domain Types
 * Core definitions for graph nodes, ports, edges, and pipeline configurations.
 */

export type NodeCategory = 
  | 'trigger'
  | 'transform'
  | 'connector'
  | 'logic'
  | 'ai'
  | 'sink';

export type DataType = 
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'stream'
  | 'binary'
  | 'any';

export interface PortDefinition {
  id: string;
  name: string;
  type: DataType;
  description?: string;
  required?: boolean;
  defaultValue?: unknown;
}

export interface NodeConfigField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'code' | 'json' | 'secret';
  description?: string;
  options?: Array<{ label: string; value: string | number }>;
  defaultValue?: unknown;
  required?: boolean;
}

export interface NexusNodeData {
  label: string;
  category: NodeCategory;
  type: string; // e.g. 'webhook-trigger', 'schema-transformer', 'dlicom-ai-agent'
  description?: string;
  icon?: string;
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  config: Record<string, unknown>;
  configSchema?: NodeConfigField[];
  status?: 'idle' | 'running' | 'success' | 'error' | 'skipped';
  lastExecutionDuration?: number;
  lastExecutionError?: string;
}

export interface NexusNode {
  id: string;
  type: string; // React flow node type identifier e.g. 'nexusNode'
  position: { x: number; y: number };
  data: NexusNodeData;
}

export interface NexusEdgeData {
  sourceHandle?: string;
  targetHandle?: string;
  conditionExpression?: string; // Optional expression for conditional routing
  transformedPayload?: unknown;
}

export interface NexusEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  animated?: boolean;
  data?: NexusEdgeData;
}

export type Environment = 'development' | 'staging' | 'production';

export interface PipelineRetryPolicy {
  maxRetries: number;
  backoffFactor: number;
  initialIntervalMs: number;
  maxIntervalMs: number;
}

export interface PipelineVariables {
  [key: string]: {
    type: DataType;
    value: unknown;
    isSecret?: boolean;
    description?: string;
  };
}

export interface PipelineManifest {
  id: string;
  name: string;
  description: string;
  version: string;
  environment: Environment;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  author: string;
  nodes: NexusNode[];
  edges: NexusEdge[];
  variables: PipelineVariables;
  retryPolicy: PipelineRetryPolicy;
  concurrencyLimit: number;
  timeoutSeconds: number;
  active: boolean;
}
