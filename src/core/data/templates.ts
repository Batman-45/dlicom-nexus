/**
 * Dlicom Nexus - Canonical Pipeline Templates & Blueprints
 * Real-world orchestration workflows demonstrating Dlicom ecosystem capabilities.
 */

import type { PipelineManifest } from '../../types';

export const SAMPLE_PIPELINES: PipelineManifest[] = [
  // 1. Smart Contract Event → Discord Alert
  {
    id: 'pipeline_smart_contract_discord_alert',
    name: 'Smart Contract Event → Discord Alert',
    description: 'Monitors on-chain smart contract events (ERC20, DEX pools, Governance), decodes transaction logs, and dispatches high-priority rich embeds to Discord.',
    version: '1.0.0',
    environment: 'production',
    tags: ['web3', 'ethereum', 'discord', 'smart-contract', 'alerts'],
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-10T12:00:00.000Z',
    author: 'Dlicom Web3 Core',
    concurrencyLimit: 25,
    timeoutSeconds: 30,
    active: true,
    retryPolicy: {
      maxRetries: 3,
      backoffFactor: 2,
      initialIntervalMs: 200,
      maxIntervalMs: 4000
    },
    variables: {
      NETWORK: { type: 'string', value: 'ethereum_mainnet' },
      DISCORD_CHANNEL: { type: 'string', value: '#chain-alerts' }
    },
    nodes: [
      {
        id: 'node-sc-event-1',
        type: 'nexusNode',
        position: { x: 80, y: 180 },
        data: {
          label: 'Contract Event Listener',
          category: 'trigger',
          type: 'smart-contract-event-trigger',
          description: 'Polls and listens for Transfer, Swap, and Deposit contract event topics',
          inputs: [],
          outputs: [{ id: 'out-raw-event', name: 'Raw Event Log', type: 'object' }],
          config: {
            network: 'ethereum_mainnet',
            contractAddress: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
            topics: ['Transfer(address,address,uint256)']
          },
          status: 'idle'
        }
      },
      {
        id: 'node-sc-decoder-2',
        type: 'nexusNode',
        position: { x: 440, y: 180 },
        data: {
          label: 'ABI Event Decoder & Formatter',
          category: 'transform',
          type: 'schema-transformer',
          description: 'Decodes raw hexadecimal parameters into token amounts, addresses, and USD valuation',
          inputs: [{ id: 'in-event', name: 'Raw Event', type: 'object' }],
          outputs: [{ id: 'out-formatted', name: 'Decoded Event', type: 'object' }],
          config: {
            expression: '{\n  "event": payload.event || "Transfer",\n  "amountFormatted": (payload.rawAmount || 1000000000) / 1e18,\n  "from": payload.from || "0x7a25...8fe2",\n  "to": payload.to || "0x9c31...4ba1",\n  "txHash": payload.txHash || "0x4f...91bc"\n}'
          },
          status: 'idle'
        }
      },
      {
        id: 'node-discord-sink-3',
        type: 'nexusNode',
        position: { x: 800, y: 180 },
        data: {
          label: 'Discord Channel Alert Dispatcher',
          category: 'sink',
          type: 'discord-webhook-sink',
          description: 'Constructs Discord webhook message with colorized transaction details',
          inputs: [{ id: 'in-alert', name: 'Decoded Payload', type: 'object' }],
          outputs: [{ id: 'out-ack', name: 'Delivery Ack', type: 'object' }],
          config: {
            channelWebhook: 'https://discord.com/api/webhooks/dlicom/alerts',
            embedColor: '#a855f7'
          },
          status: 'idle'
        }
      }
    ],
    edges: [
      { id: 'e-sc-1-2', source: 'node-sc-event-1', target: 'node-sc-decoder-2', animated: true },
      { id: 'e-sc-2-3', source: 'node-sc-decoder-2', target: 'node-discord-sink-3', animated: true }
    ]
  },

  // 2. DEX Liquidity Sweep → Slack Notification
  {
    id: 'pipeline_dex_liquidity_slack_notification',
    name: 'DEX Liquidity Sweep → Slack Notification',
    description: 'Tracks decentralized exchange liquidity pools, analyzes slippage delta with AI heuristics, filters whale trades, and dispatches incident alerts to Slack.',
    version: '1.1.0',
    environment: 'production',
    tags: ['defi', 'dex', 'uniswap', 'slack', 'slippage'],
    createdAt: '2026-09-02T00:00:00.000Z',
    updatedAt: '2026-09-10T12:00:00.000Z',
    author: 'DeFi Intelligence Team',
    concurrencyLimit: 20,
    timeoutSeconds: 45,
    active: true,
    retryPolicy: {
      maxRetries: 3,
      backoffFactor: 2,
      initialIntervalMs: 250,
      maxIntervalMs: 5000
    },
    variables: {
      MIN_SWEEP_USD: { type: 'number', value: 50000 },
      SLACK_CHANNEL: { type: 'string', value: '#defi-whale-alerts' }
    },
    nodes: [
      {
        id: 'node-dex-monitor-1',
        type: 'nexusNode',
        position: { x: 80, y: 180 },
        data: {
          label: 'DEX Liquidity Pool Monitor',
          category: 'trigger',
          type: 'dex-pool-monitor',
          description: 'Streaming mempool and tick updates across Uniswap V3 & Curve pools',
          inputs: [],
          outputs: [{ id: 'out-tick', name: 'Pool Trade Event', type: 'object' }],
          config: {
            dex: 'Uniswap_V3',
            pool: 'WETH-USDC-0.05%',
            minVolumeUSD: 10000
          },
          status: 'idle'
        }
      },
      {
        id: 'node-ai-slippage-2',
        type: 'nexusNode',
        position: { x: 380, y: 180 },
        data: {
          label: 'Slippage & Arbitrage Analyzer',
          category: 'ai',
          type: 'dlicom-ai-engine',
          description: 'Evaluates price impact, sandwich attack probability, and LP depth disruption',
          inputs: [{ id: 'in-trade', name: 'Trade Details', type: 'object' }],
          outputs: [{ id: 'out-analysis', name: 'Risk Assessment', type: 'object' }],
          config: {
            model: 'dlicom-fast-3',
            evaluationType: 'arbitrage_impact'
          },
          status: 'idle'
        }
      },
      {
        id: 'node-filter-sweep-3',
        type: 'nexusNode',
        position: { x: 680, y: 180 },
        data: {
          label: 'Whale Sweep Threshold Filter',
          category: 'transform',
          type: 'data-filter',
          description: 'Isolates sweeps where volume exceeds $50k or slippage exceeds 1.5%',
          inputs: [{ id: 'in-assessment', name: 'Risk Assessment', type: 'object' }],
          outputs: [{ id: 'out-filtered', name: 'Actionable Alerts', type: 'object' }],
          config: {
            predicate: 'payload.volumeUSD >= 50000 || payload.slippagePct >= 1.5'
          },
          status: 'idle'
        }
      },
      {
        id: 'node-slack-sink-4',
        type: 'nexusNode',
        position: { x: 980, y: 180 },
        data: {
          label: 'Slack #defi-ops Alert Channel',
          category: 'sink',
          type: 'slack-webhook-sink',
          description: 'Posts structured Slack markdown block kit alert to liquidity ops team',
          inputs: [{ id: 'in-alert', name: 'Actionable Alert', type: 'object' }],
          outputs: [{ id: 'out-ack', name: 'Slack Ack', type: 'object' }],
          config: {
            channel: '#defi-whale-alerts',
            mentionRole: '@defi-oncall'
          },
          status: 'idle'
        }
      }
    ],
    edges: [
      { id: 'e-dex-1-2', source: 'node-dex-monitor-1', target: 'node-ai-slippage-2', animated: true },
      { id: 'e-dex-2-3', source: 'node-ai-slippage-2', target: 'node-filter-sweep-3', animated: true },
      { id: 'e-dex-3-4', source: 'node-filter-sweep-3', target: 'node-slack-sink-4', animated: true }
    ]
  },

  // 3. Cross-Chain State Sync
  {
    id: 'pipeline_cross_chain_state_sync',
    name: 'Cross-Chain State Sync',
    description: 'Ingests state root commitments from source L2 rollups, verifies Merkle proofs, and relays synchronization transactions to target chains with audit logging.',
    version: '2.0.0',
    environment: 'staging',
    tags: ['cross-chain', 'rollup', 'state-sync', 'merkle', 'relayer'],
    createdAt: '2026-09-03T00:00:00.000Z',
    updatedAt: '2026-09-10T12:00:00.000Z',
    author: 'Protocol Interop Architect',
    concurrencyLimit: 15,
    timeoutSeconds: 60,
    active: true,
    retryPolicy: {
      maxRetries: 5,
      backoffFactor: 2,
      initialIntervalMs: 500,
      maxIntervalMs: 10000
    },
    variables: {
      SOURCE_CHAIN_ID: { type: 'number', value: 42161 },
      TARGET_CHAIN_ID: { type: 'number', value: 10 }
    },
    nodes: [
      {
        id: 'node-src-chain-1',
        type: 'nexusNode',
        position: { x: 80, y: 180 },
        data: {
          label: 'Source Rollup State Commitment',
          category: 'trigger',
          type: 'cross-chain-trigger',
          description: 'Detects finalized state batch roots on Arbitrum / Optimism',
          inputs: [],
          outputs: [{ id: 'out-commitment', name: 'State Root', type: 'object' }],
          config: {
            sourceChain: 'Arbitrum One',
            syncType: 'batch_state_root'
          },
          status: 'idle'
        }
      },
      {
        id: 'node-proof-verifier-2',
        type: 'nexusNode',
        position: { x: 380, y: 180 },
        data: {
          label: 'Merkle Proof Validator',
          category: 'transform',
          type: 'schema-transformer',
          description: 'Validates cryptographic Merkle branch and inclusion proofs client-side',
          inputs: [{ id: 'in-root', name: 'State Root', type: 'object' }],
          outputs: [{ id: 'out-verified', name: 'Verified Proof', type: 'object' }],
          config: {
            verifyAlgorithm: 'keccak256_merkle',
            requireFinality: true
          },
          status: 'idle'
        }
      },
      {
        id: 'node-target-relayer-3',
        type: 'nexusNode',
        position: { x: 680, y: 180 },
        data: {
          label: 'Target Chain State Relayer',
          category: 'connector',
          type: 'cross-chain-dispatcher',
          description: 'Submits batch sync transaction to target network contract endpoint',
          inputs: [{ id: 'in-verified', name: 'Verified Proof', type: 'object' }],
          outputs: [{ id: 'out-receipt', name: 'Relay Receipt', type: 'object' }],
          config: {
            targetChain: 'Optimism Mainnet',
            gasLimitBuffer: 1.2
          },
          status: 'idle'
        }
      },
      {
        id: 'node-audit-bus-4',
        type: 'nexusNode',
        position: { x: 980, y: 180 },
        data: {
          label: 'State Sync Audit Log',
          category: 'sink',
          type: 'dlicom-event-bus',
          description: 'Publishes immutable verification receipt to Dlicom Mesh audit log',
          inputs: [{ id: 'in-receipt', name: 'Relay Receipt', type: 'object' }],
          outputs: [{ id: 'out-ack', name: 'Ack', type: 'object' }],
          config: {
            topic: 'audit.crosschain.sync'
          },
          status: 'idle'
        }
      }
    ],
    edges: [
      { id: 'e-cc-1-2', source: 'node-src-chain-1', target: 'node-proof-verifier-2', animated: true },
      { id: 'e-cc-2-3', source: 'node-proof-verifier-2', target: 'node-target-relayer-3', animated: true },
      { id: 'e-cc-3-4', source: 'node-target-relayer-3', target: 'node-audit-bus-4', animated: true }
    ]
  },

  // 4. Real-time Event Ingestion & Enrichment Mesh
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
          config: { expression: '{\n  "canonicalId": "dlicom_msg_" + Date.now(),\n  "data": payload\n}' },
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

  // 5. Multi-Model AI Agent Orchestrator
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
