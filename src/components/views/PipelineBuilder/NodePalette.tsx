import React, { useState } from 'react';
import { 
  Zap, 
  Binary, 
  Cpu, 
  Database, 
  Radio, 
  Search, 
  Plus
} from 'lucide-react';
import { globalPipelineStore } from '../../../core/store/pipelineStore';
import type { NexusNode, NodeCategory } from '../../../types';

interface PaletteItem {
  type: string;
  category: NodeCategory;
  label: string;
  description: string;
  inputs: Array<{ id: string; name: string; type: 'string' | 'object' | 'array' | 'number' | 'boolean' | 'any' }>;
  outputs: Array<{ id: string; name: string; type: 'string' | 'object' | 'array' | 'number' | 'boolean' | 'any' }>;
  config: Record<string, unknown>;
}

const PALETTE_TEMPLATES: PaletteItem[] = [
  // Triggers
  {
    type: 'webhook-trigger',
    category: 'trigger',
    label: 'Webhook Trigger',
    description: 'Receives external HTTP POST/PUT webhook triggers',
    inputs: [],
    outputs: [{ id: 'out-body', name: 'Payload', type: 'object' }],
    config: { path: '/v1/webhook/inbound' }
  },
  {
    type: 'cron-trigger',
    category: 'trigger',
    label: 'Cron Scheduler',
    description: 'Triggers pipeline on recurring cron schedule or interval',
    inputs: [],
    outputs: [{ id: 'out-tick', name: 'Timestamp', type: 'string' }],
    config: { cron: '0 * * * *' }
  },

  // AI & Reasoning
  {
    type: 'dlicom-ai-engine',
    category: 'ai',
    label: 'Dlicom AI Inference Router',
    description: 'Executes high-depth multi-model reasoning and dynamic prompt routing',
    inputs: [{ id: 'in-prompt', name: 'Prompt / Context', type: 'string' }],
    outputs: [{ id: 'out-response', name: 'Inference', type: 'object' }],
    config: { model: 'dlicom-ultra-4.5', temperature: 0.2 }
  },
  {
    type: 'dlicom-fast-classifier',
    category: 'ai',
    label: 'Fast Intent Classifier',
    description: 'Low-latency classification model for routing decisions',
    inputs: [{ id: 'in-text', name: 'Text Input', type: 'string' }],
    outputs: [{ id: 'out-intent', name: 'Intent', type: 'object' }],
    config: { model: 'dlicom-fast-3' }
  },

  // Transformers
  {
    type: 'schema-transformer',
    category: 'transform',
    label: 'Schema Transformer',
    description: 'Applies declarative transformation and schema normalization',
    inputs: [{ id: 'in-data', name: 'Input Data', type: 'any' }],
    outputs: [{ id: 'out-data', name: 'Transformed Output', type: 'object' }],
    config: { expression: '{\n  "enriched": true,\n  "data": payload\n}' }
  },
  {
    type: 'data-filter',
    category: 'transform',
    label: 'Payload Filter',
    description: 'Filters incoming stream elements based on predicate expressions',
    inputs: [{ id: 'in-stream', name: 'Records', type: 'array' }],
    outputs: [{ id: 'out-filtered', name: 'Matched Records', type: 'array' }],
    config: { predicate: 'record.status === "active"' }
  },

  // Connectors
  {
    type: 'dlicom-data-mesh',
    category: 'connector',
    label: 'Dlicom Data Mesh Query',
    description: 'Federated real-time query against Dlicom entity fabric',
    inputs: [{ id: 'in-params', name: 'Query Params', type: 'object' }],
    outputs: [{ id: 'out-records', name: 'Entities', type: 'array' }],
    config: { targetEntity: 'TenantDevices', limit: 50 }
  },
  {
    type: 'http-request',
    category: 'connector',
    label: 'HTTP Dispatcher',
    description: 'Executes outbound REST API call with auth and retry',
    inputs: [{ id: 'in-body', name: 'Payload', type: 'object' }],
    outputs: [{ id: 'out-res', name: 'Response', type: 'object' }],
    config: { method: 'POST', url: 'https://api.external.com/v1/endpoint' }
  },

  // Sinks
  {
    type: 'dlicom-event-bus',
    category: 'sink',
    label: 'Dlicom Event Bus Sink',
    description: 'Publishes canonical event to high-throughput topic',
    inputs: [{ id: 'in-event', name: 'Event', type: 'object' }],
    outputs: [{ id: 'out-ack', name: 'Ack', type: 'object' }],
    config: { topic: 'events.dlicom.primary' }
  }
];

export const NodePalette: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [addCounter, setAddCounter] = useState<number>(1);

  const filteredItems = PALETTE_TEMPLATES.filter(item => {
    const matchesSearch = item.label.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddNode = (item: PaletteItem) => {
    const currentCount = addCounter;
    setAddCounter(c => c + 1);

    const id = `node_${item.type}_${currentCount}`;
    const offset = (currentCount * 25) % 150;
    
    const newNode: NexusNode = {
      id,
      type: 'nexusNode',
      position: { x: 320 + offset, y: 200 + offset },
      data: {
        label: item.label,
        category: item.category,
        type: item.type,
        description: item.description,
        inputs: item.inputs,
        outputs: item.outputs,
        config: { ...item.config },
        status: 'idle'
      }
    };

    globalPipelineStore.addNode(newNode);
  };

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'trigger', label: 'Triggers', icon: <Zap size={13} color="var(--status-amber)" /> },
    { id: 'ai', label: 'AI & Models', icon: <Cpu size={13} color="var(--status-cyan)" /> },
    { id: 'transform', label: 'Transforms', icon: <Binary size={13} color="var(--status-violet)" /> },
    { id: 'connector', label: 'Connectors', icon: <Database size={13} color="var(--status-indigo)" /> },
    { id: 'sink', label: 'Sinks', icon: <Radio size={13} color="var(--status-emerald)" /> }
  ];

  return (
    <div style={{
      width: '260px',
      backgroundColor: 'var(--bg-surface-1)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      zIndex: 20
    }}>
      {/* Header & Search */}
      <div style={{ padding: '12px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Node Palette
        </span>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--text-dim)' }} />
          <input
            type="text"
            className="input"
            style={{ paddingLeft: '30px', fontSize: '12px' }}
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '4px', padding: '8px 12px', overflowX: 'auto', borderBottom: '1px solid var(--border-subtle)' }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding: '4px 8px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '11px',
              fontWeight: 500,
              background: activeCategory === cat.id ? 'var(--bg-surface-3)' : 'transparent',
              color: activeCategory === cat.id ? 'var(--status-cyan)' : 'var(--text-muted)',
              border: '1px solid',
              borderColor: activeCategory === cat.id ? 'var(--border-medium)' : 'transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {cat.icon}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Node Items List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filteredItems.map(item => (
          <div
            key={item.type + item.label}
            style={{
              padding: '10px',
              backgroundColor: 'var(--bg-surface-2)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
            onClick={() => handleAddNode(item)}
            className="palette-item-card"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</span>
              <Plus size={14} color="var(--status-cyan)" />
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-dim)', lineHeight: 1.3 }}>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
