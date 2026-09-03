/**
 * Dlicom Nexus - Default Pipeline Templates & Blueprints
 * Real-world orchestration workflows demonstrating Dlicom ecosystem capabilities.
 */

import type { PipelineManifest } from '../../types';

export const SAMPLE_PIPELINES: PipelineManifest[] = [
  {
    id: 'pipeline_realtime_event_mesh',
    name: 'Real-time Event Ingestion & Enrichment Mesh',
    description: 'Receives external webhook telemetry, executes Dlicom Data Mesh lookups, applies schema transformation, and publishes to the Dlicom Event Bus.',
    version: '1.2.0',
    environment: 'production',
    tags: ['telemetry', 'events', 'data-mesh', 'streaming'],
    createdAt: '2026-08-15T10:00:00.000Z',
    updatedAt: '2026-08-30T14:22:00.000Z',
    author: 'Dlicom Platform Architect',
    concurrencyLimit: 50,
    timeoutSeconds: 30,
    active: true,
    retryPolicy: {
      maxRetries: 3,
      backoffFactor: 2,
      initialIntervalMs: 200,
      maxIntervalMs: 5000
    },
    variables: {
      ENVIRONMENT: { type: 'string', value: 'production' },
      MAX_BATCH_SIZE: { type: 'number', value: 100 }
    },
    nodes: [
      {
        id: 'node-webhook-1',
        type: 'nexusNode',
        position: { x: 80, y: 180 },
        data: {
          label: 'Inbound Ingest Hook',
          category: 'trigger',
          type: 'webhook-trigger',
          description: 'Receives inbound device & agent telemetry payloads via HTTP POST',
          inputs: [],
          outputs: [{ id: 'out-payload', name: 'Raw Payload', type: 'object' }],
          config: { path: '/v1/telemetry/ingest', requireAuthHeader: true },
          status: 'idle'
        }
      },
      {
        id: 'node-mesh-query-2',
        type: 'nexusNode',
        position: { x: 380, y: 100 },
        data: {
          label: 'Data Mesh Metadata Lookup',
          category: 'connector',
          type: 'dlicom-data-mesh',
          description: 'Enriches raw event with tenant metadata and device health state',
          inputs: [{ id: 'in-payload', name: 'Event Ingest', type: 'object' }],
          outputs: [{ id: 'out-enriched', name: 'Tenant Entity', type: 'object' }],
          config: { targetEntity: 'TenantDevices', limit: 1 },
          status: 'idle'
        }
      },
      {
        id: 'node-ai-eval-3',
        type: 'nexusNode',
        position: { x: 380, y: 280 },
        data: {
          label: 'AI Anomaly Detector',
          category: 'ai',
          type: 'dlicom-ai-engine',
          description: 'Evaluates telemetry payload for anomalies or policy violations',
          inputs: [{ id: 'in-payload', name: 'Payload', type: 'object' }],
          outputs: [{ id: 'out-score', name: 'Anomaly Assessment', type: 'object' }],
          config: { model: 'dlicom-fast-3', temperature: 0.1 },
          status: 'idle'
        }
      },
      {
        id: 'node-transform-4',
        type: 'nexusNode',
        position: { x: 680, y: 180 },
        data: {
          label: 'Unified Event Normalizer',
          category: 'transform',
          type: 'schema-transformer',
          description: 'Merges enriched metadata, anomaly score, and event data into canonical format',
          inputs: [
            { id: 'in-meta', name: 'Mesh Data', type: 'object' },
            { id: 'in-score', name: 'AI Score', type: 'object' }
          ],
          outputs: [{ id: 'out-unified', name: 'Canonical Event', type: 'object' }],
          config: { expression: '{\n  "canonicalId": uuid(),\n  "data": payload\n}' },
          status: 'idle'
        }
      },
      {
        id: 'node-eventbus-5',
        type: 'nexusNode',
        position: { x: 980, y: 180 },
        data: {
          label: 'Dlicom Event Bus Broadcast',
          category: 'sink',
          type: 'dlicom-event-bus',
          description: 'Dispatches canonical stream event to high-throughput topic',
          inputs: [{ id: 'in-event', name: 'Canonical Payload', type: 'object' }],
          outputs: [{ id: 'out-ack', name: 'Ack', type: 'object' }],
          config: { topic: 'telemetry.unified.stream' },
          status: 'idle'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node-webhook-1', target: 'node-mesh-query-2', animated: true },
      { id: 'e1-3', source: 'node-webhook-1', target: 'node-ai-eval-3', animated: true },
      { id: 'e2-4', source: 'node-mesh-query-2', target: 'node-transform-4', animated: true },
      { id: 'e3-4', source: 'node-ai-eval-3', target: 'node-transform-4', animated: true },
      { id: 'e4-5', source: 'node-transform-4', target: 'node-eventbus-5', animated: true }
    ]
  },
  {
    id: 'pipeline_agent_routing_hub',
    name: 'Multi-Model AI Agent Orchestrator',
    description: 'Dynamic intent classification and intelligent routing across specialized Dlicom reasoning engines.',
    version: '2.0.1',
    environment: 'development',
    tags: ['ai', 'router', 'orchestrator', 'agents'],
    createdAt: '2026-08-20T08:00:00.000Z',
    updatedAt: '2026-08-31T11:45:00.000Z',
    author: 'AI Systems Architect',
    concurrencyLimit: 20,
    timeoutSeconds: 60,
    active: true,
    retryPolicy: {
      maxRetries: 2,
      backoffFactor: 1.5,
      initialIntervalMs: 300,
      maxIntervalMs: 2000
    },
    variables: {
      MODEL_ROUTING_KEY: { type: 'string', value: 'auto_fast', isSecret: false }
    },
    nodes: [
      {
        id: 'node-prompt-in',
        type: 'nexusNode',
        position: { x: 80, y: 150 },
        data: {
          label: 'User Prompt Gateway',
          category: 'trigger',
          type: 'webhook-trigger',
          description: 'Entry point for agent query requests',
          inputs: [],
          outputs: [{ id: 'out-req', name: 'Request', type: 'object' }],
          config: { path: '/v1/agent/query' },
          status: 'idle'
        }
      },
      {
        id: 'node-intent-router',
        type: 'nexusNode',
        position: { x: 380, y: 150 },
        data: {
          label: 'Intent & Complexity Classifier',
          category: 'ai',
          type: 'dlicom-ai-engine',
          description: 'Determines query domain and complexity tier',
          inputs: [{ id: 'in-query', name: 'User Query', type: 'string' }],
          outputs: [{ id: 'out-intent', name: 'Intent Classification', type: 'object' }],
          config: { model: 'dlicom-fast-3' },
          status: 'idle'
        }
      },
      {
        id: 'node-deep-reasoning',
        type: 'nexusNode',
        position: { x: 680, y: 150 },
        data: {
          label: 'UltraReason 4.5 Core',
          category: 'ai',
          type: 'dlicom-ai-engine',
          description: 'Executes high-depth multi-step reasoning with verifiable step trace',
          inputs: [{ id: 'in-intent', name: 'Classified Query', type: 'object' }],
          outputs: [{ id: 'out-response', name: 'Reasoning Response', type: 'object' }],
          config: { model: 'dlicom-ultra-4.5', temperature: 0.2 },
          status: 'idle'
        }
      },
      {
        id: 'node-http-sink',
        type: 'nexusNode',
        position: { x: 980, y: 150 },
        data: {
          label: 'Client Response Dispatch',
          category: 'sink',
          type: 'http-webhook-gateway',
          description: 'Streams synthesized response back to caller',
          inputs: [{ id: 'in-res', name: 'Final Payload', type: 'object' }],
          outputs: [],
          config: { method: 'POST', url: 'https://api.dlicom.internal/v1/agent/callbacks' },
          status: 'idle'
        }
      }
    ],
    edges: [
      { id: 'e-p-i', source: 'node-prompt-in', target: 'node-intent-router', animated: true },
      { id: 'e-i-d', source: 'node-intent-router', target: 'node-deep-reasoning', animated: true },
      { id: 'e-d-s', source: 'node-deep-reasoning', target: 'node-http-sink', animated: true }
    ]
  }
];
