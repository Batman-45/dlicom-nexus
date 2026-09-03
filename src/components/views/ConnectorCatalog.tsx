import React, { useState } from 'react';
import { 
  Puzzle, 
  Search, 
  ShieldCheck, 
  Cpu, 
  Database, 
  Radio, 
  Globe, 
  Binary, 
  Layers, 
  Plus, 
  CheckCircle,
  X
} from 'lucide-react';
import { globalConnectorRegistry } from '../../core/connectors/registry';
import { globalPipelineStore } from '../../core/store/pipelineStore';
import { useNavigation } from '../../context';
import type { ConnectorDefinition, NexusNode } from '../../types';

export const ConnectorCatalog: React.FC = () => {
  const { navigateTo } = useNavigation();
  const [connectors] = useState<ConnectorDefinition[]>(globalConnectorRegistry.getAll());
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedConnector, setSelectedConnector] = useState<ConnectorDefinition | null>(null);

  const filtered = connectors.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || 
      (filterCategory === 'dlicom_native' ? c.isDlicomNative : c.category === filterCategory);
    return matchesSearch && matchesCategory;
  });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu': return <Cpu size={20} color="var(--status-cyan)" />;
      case 'Database': return <Database size={20} color="var(--status-indigo)" />;
      case 'Radio': return <Radio size={20} color="var(--status-emerald)" />;
      case 'Globe': return <Globe size={20} color="var(--status-amber)" />;
      case 'Binary': return <Binary size={20} color="var(--status-violet)" />;
      default: return <Puzzle size={20} color="var(--status-cyan)" />;
    }
  };

  const handleAddConnectorToPipeline = (connector: ConnectorDefinition) => {
    const action = connector.actions[0];
    const trigger = connector.triggers[0];

    const newNode: NexusNode = {
      id: `node_conn_${connector.id}`,
      type: 'nexusNode',
      position: { x: 350, y: 220 },
      data: {
        label: connector.name,
        category: connector.category === 'ai_model' ? 'ai' :
                  connector.category === 'database' ? 'connector' :
                  connector.category === 'streaming' ? 'sink' :
                  connector.category === 'utilities' ? 'transform' : 'connector',
        type: connector.id,
        description: connector.description,
        inputs: action ? action.inputs : [],
        outputs: action ? action.outputs : (trigger ? trigger.outputs : []),
        config: {},
        status: 'idle'
      }
    };

    globalPipelineStore.addNode(newNode);
    setSelectedConnector(null);
    navigateTo('builder');
  };

  return (
    <div style={{ padding: '24px', overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Puzzle size={20} color="var(--status-cyan)" />
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>Connector Catalog</h1>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Discover and integrate Dlicom ecosystem services, AI reasoning models, data fabrics, and enterprise protocols.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigateTo('builder')}>
            <Layers size={14} />
            <span>Open Builder</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg-surface-1)',
        padding: '12px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-dim)' }} />
          <input
            type="text"
            className="input"
            style={{ paddingLeft: '32px' }}
            placeholder="Search connectors, capabilities, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'dlicom_native', label: 'Dlicom Native' },
            { id: 'ai_model', label: 'AI Models' },
            { id: 'database', label: 'Data & Mesh' },
            { id: 'streaming', label: 'Streaming' },
            { id: 'protocols', label: 'Protocols' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterCategory(f.id)}
              className={`btn btn-sm ${filterCategory === f.id ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '12px' }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Connectors Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {filtered.map(connector => (
          <div
            key={connector.id}
            className="nexus-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '14px',
              cursor: 'pointer',
              borderColor: connector.isDlicomNative ? 'var(--border-medium)' : 'var(--border-subtle)'
            }}
            onClick={() => setSelectedConnector(connector)}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-surface-2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border-medium)'
                  }}>
                    {getIcon(connector.icon)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{connector.name}</h3>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>v{connector.version}</span>
                  </div>
                </div>

                {connector.isDlicomNative && (
                  <span className="badge badge-ai" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={11} />
                    <span>DLICOM NATIVE</span>
                  </span>
                )}
              </div>

              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '12px' }}>
                {connector.description}
              </p>
            </div>

            <div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {connector.tags.map(t => (
                  <span key={t} className="badge badge-idle" style={{ fontSize: '10px' }}>#{t}</span>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                  {connector.actions.length} Actions · {connector.triggers.length} Triggers
                </span>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={(e) => { e.stopPropagation(); handleAddConnectorToPipeline(connector); }}
                >
                  <Plus size={13} />
                  <span>Add to Canvas</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Connector Detail Modal */}
      {selectedConnector && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}
        onClick={() => setSelectedConnector(null)}
        >
          <div 
            style={{
              width: '100%',
              maxWidth: '560px',
              backgroundColor: 'var(--bg-surface-1)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: 'var(--shadow-lg)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface-2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--border-medium)'
                }}>
                  {getIcon(selectedConnector.icon)}
                </div>
                <div>
                  <h2 style={{ fontSize: '17px', fontWeight: 700 }}>{selectedConnector.name}</h2>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    <span>Author: {selectedConnector.author}</span>
                    <span>·</span>
                    <span>Version {selectedConnector.version}</span>
                  </div>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedConnector(null)}>
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {selectedConnector.description}
            </p>

            {/* Auth Information */}
            <div style={{ padding: '12px', backgroundColor: 'var(--bg-surface-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Authentication Policy
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-primary)', marginTop: '4px' }}>
                <CheckCircle size={14} color="var(--status-emerald)" />
                <span>{selectedConnector.auth?.type === 'dlicom_vault' ? 'Integrated with Dlicom Secure Vault' : 'Standard Token / API Key Auth'}</span>
              </div>
            </div>

            {/* Capabilities (Actions & Triggers) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Actions & Capabilities ({selectedConnector.actions.length})
              </span>
              {selectedConnector.actions.map(action => (
                <div key={action.id} style={{ padding: '10px', backgroundColor: 'var(--bg-surface-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 600, fontSize: '12px', color: 'var(--status-cyan)' }}>{action.name}</div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{action.description}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedConnector(null)}>
                Close
              </button>
              <button className="btn btn-primary" onClick={() => handleAddConnectorToPipeline(selectedConnector)}>
                <Plus size={14} />
                <span>Add to Canvas</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
