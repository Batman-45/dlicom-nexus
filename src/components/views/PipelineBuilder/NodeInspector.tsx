import React from 'react';
import { 
  Trash2, 
  Settings, 
  Layers, 
  X, 
  Clock
} from 'lucide-react';
import { globalPipelineStore } from '../../../core/store/pipelineStore';
import type { NexusNode, PipelineManifest } from '../../../types';

interface NodeInspectorProps {
  selectedNode: NexusNode | undefined;
  pipeline: PipelineManifest;
  onClose: () => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({ selectedNode, pipeline, onClose }) => {
  const handleUpdateLabel = (newLabel: string) => {
    if (selectedNode) {
      globalPipelineStore.updateNode(selectedNode.id, { label: newLabel });
    }
  };

  const handleUpdateDescription = (newDesc: string) => {
    if (selectedNode) {
      globalPipelineStore.updateNode(selectedNode.id, { description: newDesc });
    }
  };

  const handleConfigChange = (key: string, value: unknown) => {
    if (selectedNode) {
      const updatedConfig = { ...selectedNode.data.config, [key]: value };
      globalPipelineStore.updateNode(selectedNode.id, { config: updatedConfig });
    }
  };

  const handleDeleteNode = () => {
    if (selectedNode) {
      globalPipelineStore.removeNode(selectedNode.id);
    }
  };

  const handleUpdatePipeline = (field: keyof PipelineManifest, value: unknown) => {
    globalPipelineStore.updateActiveMetadata({ [field]: value });
  };

  return (
    <div style={{
      width: '320px',
      backgroundColor: 'var(--bg-surface-1)',
      borderLeft: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      zIndex: 20
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {selectedNode ? <Settings size={16} color="var(--status-cyan)" /> : <Layers size={16} color="var(--status-indigo)" />}
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {selectedNode ? 'Node Configuration' : 'Pipeline Settings'}
          </span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: '4px' }}>
          <X size={14} />
        </button>
      </div>

      {/* Body Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {selectedNode ? (
          <>
            {/* Node Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Node Label
              </label>
              <input
                type="text"
                className="input"
                value={selectedNode.data.label}
                onChange={(e) => handleUpdateLabel(e.target.value)}
              />
            </div>

            {/* Node Category & ID */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              <span>Category: <strong style={{ color: 'var(--text-primary)' }}>{selectedNode.data.category}</strong></span>
              <span>ID: {selectedNode.id}</span>
            </div>

            {/* Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Description
              </label>
              <textarea
                className="textarea"
                rows={3}
                value={selectedNode.data.description || ''}
                onChange={(e) => handleUpdateDescription(e.target.value)}
                placeholder="What does this step do?"
              />
            </div>

            {/* Configuration Key-Values */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Parameters & Config
              </label>
              {Object.entries(selectedNode.data.config || {}).map(([key, val]) => (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{key}</span>
                  {typeof val === 'object' || String(val).includes('\n') ? (
                    <textarea
                      className="textarea"
                      rows={4}
                      value={typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val)}
                      onChange={(e) => handleConfigChange(key, e.target.value)}
                    />
                  ) : (
                    <input
                      type="text"
                      className="input"
                      value={String(val)}
                      onChange={(e) => handleConfigChange(key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Ports Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Input & Output Contracts
              </label>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                <div>Inputs: {selectedNode.data.inputs?.map(i => `${i.name} (${i.type})`).join(', ') || 'None'}</div>
                <div style={{ marginTop: '4px' }}>Outputs: {selectedNode.data.outputs?.map(o => `${o.name} (${o.type})`).join(', ') || 'None'}</div>
              </div>
            </div>

            {/* Delete Action */}
            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <button 
                className="btn btn-danger" 
                style={{ width: '100%' }}
                onClick={handleDeleteNode}
              >
                <Trash2 size={14} />
                <span>Delete Node</span>
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Global Pipeline Properties */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Pipeline Name
              </label>
              <input
                type="text"
                className="input"
                value={pipeline.name}
                onChange={(e) => handleUpdatePipeline('name', e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Description
              </label>
              <textarea
                className="textarea"
                rows={3}
                value={pipeline.description}
                onChange={(e) => handleUpdatePipeline('description', e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Version
                </label>
                <input
                  type="text"
                  className="input"
                  value={pipeline.version}
                  onChange={(e) => handleUpdatePipeline('version', e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Environment
                </label>
                <select
                  className="select"
                  value={pipeline.environment}
                  onChange={(e) => handleUpdatePipeline('environment', e.target.value as 'development' | 'staging' | 'production')}
                >
                  <option value="development">Development</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Concurrency & Timeout
              </label>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Max Concurrency:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{pipeline.concurrencyLimit} workers</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Timeout:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{pipeline.timeoutSeconds}s</span>
              </div>
            </div>

            <div style={{
              padding: '12px',
              backgroundColor: 'var(--bg-surface-2)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: '12px',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--status-cyan)', fontWeight: 600 }}>
                <Clock size={14} />
                <span>Execution Policy</span>
              </div>
              <p style={{ fontSize: '11px', lineHeight: 1.4 }}>
                Automatic retry backoff: {pipeline.retryPolicy?.maxRetries || 3} retries with factor {pipeline.retryPolicy?.backoffFactor || 2}x.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
