/**
 * Dlicom Nexus - Builtin Connector Definitions
 * Catalog of Dlicom ecosystem native services and standard protocol adapters.
 */

import type { ConnectorDefinition } from '../../types';

export const BUILTIN_CONNECTORS: ConnectorDefinition[] = [
  {
    id: 'dlicom-ai-engine',
    name: 'Dlicom AI Inference Router',
    version: '2.4.0',
    category: 'ai_model',
    description: 'High-performance AI model routing, dynamic prompting, context injection, and agent tool execution.',
    icon: 'Cpu',
    author: 'Dlicom Core Team',
    isDlicomNative: true,
    tags: ['dlicom', 'ai', 'llm', 'agents', 'inference'],
    auth: {
      type: 'dlicom_vault',
      fields: [
        {
          key: 'vaultSecretKey',
          label: 'Vault Model Token Key',
          type: 'secret',
          required: true,
          description: 'Secret reference from Dlicom Vault'
        }
      ]
    },
    triggers: [],
    actions: [
      {
        id: 'generate-completion',
        name: 'Generate Inference / Reason',
        description: 'Sends contextual payload to Dlicom AI Engine for multi-step reasoning.',
        inputs: [
          { id: 'prompt', name: 'Prompt / Instruction', type: 'string', required: true },
          { id: 'context', name: 'Context Data', type: 'object' }
        ],
        outputs: [
          { id: 'result', name: 'Generated Output', type: 'object' },
          { id: 'usage', name: 'Token Usage', type: 'object' }
        ],
        configFields: [
          {
            key: 'model',
            label: 'Model Identifier',
            type: 'select',
            options: [
              { label: 'Dlicom UltraReason 4.5', value: 'dlicom-ultra-4.5' },
              { label: 'Dlicom FastRoute 3', value: 'dlicom-fast-3' },
              { label: 'Dlicom CodeGen Pro', value: 'dlicom-codegen-pro' }
            ],
            defaultValue: 'dlicom-ultra-4.5'
          },
          {
            key: 'temperature',
            label: 'Temperature',
            type: 'number',
            defaultValue: 0.2
          }
        ]
      }
    ]
  },
  {
    id: 'dlicom-data-mesh',
    name: 'Dlicom Data Mesh',
    version: '3.1.0',
    category: 'database',
    description: 'Unified distributed data virtualization, real-time query fabric, and entity cache across Dlicom nodes.',
    icon: 'Database',
    author: 'Dlicom Core Team',
    isDlicomNative: true,
    tags: ['dlicom', 'data', 'mesh', 'query', 'entities'],
    triggers: [
      {
        id: 'entity-mutation',
        name: 'Entity Mutation Event',
        description: 'Triggers whenever an entity state updates in the Data Mesh.',
        mode: 'stream',
        outputs: [
          { id: 'entity', name: 'Entity Data', type: 'object' },
          { id: 'mutationType', name: 'Mutation Type', type: 'string' }
        ],
        configFields: [
          { key: 'collection', label: 'Collection / Schema', type: 'text', required: true }
        ]
      }
    ],
    actions: [
      {
        id: 'query-mesh',
        name: 'Query Data Mesh',
        description: 'Executes federated query with automatic caching and schema translation.',
        inputs: [
          { id: 'queryParameters', name: 'Query Parameters', type: 'object' }
        ],
        outputs: [
          { id: 'records', name: 'Dataset Records', type: 'array' },
          { id: 'count', name: 'Record Count', type: 'number' }
        ],
        configFields: [
          { key: 'targetEntity', label: 'Target Entity Domain', type: 'text', required: true },
          { key: 'limit', label: 'Max Records', type: 'number', defaultValue: 100 }
        ]
      }
    ]
  },
  {
    id: 'dlicom-event-bus',
    name: 'Dlicom Event Bus',
    version: '2.0.0',
    category: 'streaming',
    description: 'Low-latency distributed event streaming, topic partitioning, and message broadcast.',
    icon: 'Radio',
    author: 'Dlicom Core Team',
    isDlicomNative: true,
    tags: ['dlicom', 'events', 'pubsub', 'stream'],
    triggers: [
      {
        id: 'topic-subscription',
        name: 'Topic Subscription',
        description: 'Fires when messages arrive on a subscribed topic partition.',
        mode: 'stream',
        outputs: [
          { id: 'message', name: 'Message Body', type: 'object' },
          { id: 'topic', name: 'Topic Name', type: 'string' },
          { id: 'timestamp', name: 'Timestamp', type: 'string' }
        ],
        configFields: [
          { key: 'topic', label: 'Topic Name', type: 'text', required: true },
          { key: 'consumerGroup', label: 'Consumer Group ID', type: 'text', defaultValue: 'nexus-worker-group' }
        ]
      }
    ],
    actions: [
      {
        id: 'publish-message',
        name: 'Publish to Topic',
        description: 'Emits a structured payload to a specific event topic.',
        inputs: [
          { id: 'payload', name: 'Event Payload', type: 'object', required: true }
        ],
        outputs: [
          { id: 'eventId', name: 'Event ID', type: 'string' },
          { id: 'partition', name: 'Partition', type: 'number' }
        ],
        configFields: [
          { key: 'topic', label: 'Target Topic', type: 'text', required: true }
        ]
      }
    ]
  },
  {
    id: 'http-webhook-gateway',
    name: 'HTTP / Webhook Gateway',
    version: '1.8.0',
    category: 'protocols',
    description: 'Secure HTTP endpoints, REST API request dispatcher, and inbound webhook listener.',
    icon: 'Globe',
    author: 'Dlicom Platform',
    isDlicomNative: false,
    tags: ['rest', 'http', 'webhook', 'api', 'gateway'],
    triggers: [
      {
        id: 'inbound-webhook',
        name: 'Inbound Webhook Listener',
        description: 'Receives external HTTP POST/PUT webhook triggers.',
        mode: 'push',
        outputs: [
          { id: 'body', name: 'Request Body', type: 'object' },
          { id: 'headers', name: 'Request Headers', type: 'object' },
          { id: 'query', name: 'Query Params', type: 'object' }
        ],
        configFields: [
          { key: 'path', label: 'Webhook Path', type: 'text', defaultValue: '/webhooks/inbound' },
          { key: 'requireAuthHeader', label: 'Require Signature / Token', type: 'boolean', defaultValue: true }
        ]
      }
    ],
    actions: [
      {
        id: 'http-request',
        name: 'Dispatch HTTP Request',
        description: 'Performs outbound HTTP REST request with customizable retry and auth.',
        inputs: [
          { id: 'body', name: 'Request Body', type: 'object' },
          { id: 'params', name: 'URL Parameters', type: 'object' }
        ],
        outputs: [
          { id: 'responseBody', name: 'Response Data', type: 'any' },
          { id: 'statusCode', name: 'Status Code', type: 'number' }
        ],
        configFields: [
          {
            key: 'method',
            label: 'HTTP Method',
            type: 'select',
            options: [
              { label: 'GET', value: 'GET' },
              { label: 'POST', value: 'POST' },
              { label: 'PUT', value: 'PUT' },
              { label: 'DELETE', value: 'DELETE' }
            ],
            defaultValue: 'POST'
          },
          { key: 'url', label: 'Target URL', type: 'text', required: true }
        ]
      }
    ]
  },
  {
    id: 'schema-transformer',
    name: 'Payload & Schema Transformer',
    version: '2.1.0',
    category: 'utilities',
    description: 'Declarative JSON payload mapping, filtering, calculations, and format conversions.',
    icon: 'Binary',
    author: 'Dlicom Platform',
    isDlicomNative: true,
    tags: ['transform', 'json', 'mapper', 'filter', 'utilities'],
    triggers: [],
    actions: [
      {
        id: 'map-transform',
        name: 'Transform Schema',
        description: 'Applies mapping expression to incoming payload data.',
        inputs: [
          { id: 'input', name: 'Raw Input Data', type: 'any', required: true }
        ],
        outputs: [
          { id: 'output', name: 'Transformed Data', type: 'object' }
        ],
        configFields: [
          { key: 'expression', label: 'Transformation Expression / Mapping Rule', type: 'code', defaultValue: '{\n  "timestamp": Date.now(),\n  "data": payload\n}' }
        ]
      }
    ]
  }
];
