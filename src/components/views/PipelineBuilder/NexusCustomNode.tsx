import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { 
  Zap, 
  Binary, 
  Cpu, 
  Database, 
  Radio, 
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react';
import type { NexusNodeData, NodeCategory } from '../../../types';

const getCategoryIcon = (category: NodeCategory) => {
  switch (category) {
    case 'trigger': return <Zap size={14} color="var(--status-amber)" />;
    case 'transform': return <Binary size={14} color="var(--status-violet)" />;
    case 'ai': return <Cpu size={14} color="var(--status-cyan)" />;
    case 'connector': return <Database size={14} color="var(--status-indigo)" />;
    case 'sink': return <Radio size={14} color="var(--status-emerald)" />;
    default: return <HelpCircle size={14} color="var(--text-muted)" />;
  }
};

const getCategoryBadgeClass = (category: NodeCategory) => {
  switch (category) {
    case 'trigger': return 'badge-trigger';
    case 'transform': return 'badge-transform';
    case 'ai': return 'badge-ai';
    case 'connector': return 'badge-connector';
    case 'sink': return 'badge-sink';
    default: return 'badge-idle';
  }
};

const NexusCustomNodeComponent: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as unknown as NexusNodeData;
  const status = nodeData.status || 'idle';

  return (
    <div className={`nexus-node-container ${selected ? 'selected' : ''} status-${status}`}>
      {/* Dynamic Input Handles */}
      {nodeData.inputs && nodeData.inputs.map((input, index) => {
        const topOffset = nodeData.inputs.length === 1 
          ? 50 
          : 35 + (index * (30 / Math.max(1, nodeData.inputs.length - 1)));
        return (
          <Handle
            key={input.id}
            id={input.id}
            type="target"
            position={Position.Left}
            style={{ top: `${topOffset}%` }}
            title={`Input: ${input.name} (${input.type})`}
          />
        );
      })}

      {/* Node Header */}
      <div className="node-header">
        <div className="node-header-info">
          {getCategoryIcon(nodeData.category)}
          <span className="node-title" title={nodeData.label}>{nodeData.label}</span>
        </div>
        <span className={`badge ${getCategoryBadgeClass(nodeData.category)}`} style={{ fontSize: '10px' }}>
          {nodeData.category}
        </span>
      </div>

      {/* Node Body */}
      <div className="node-body">
        {nodeData.description && (
          <p style={{ fontSize: '11px', color: 'var(--text-dim)', lineHeight: 1.4 }}>
            {nodeData.description}
          </p>
        )}

        <div className="node-ports-row">
          <div className="node-port-item">
            <span>In: {nodeData.inputs?.length || 0}</span>
          </div>
          <div className="node-port-item">
            <span>Out: {nodeData.outputs?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* Node Footer with Status */}
      <div className="node-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {status === 'success' && <CheckCircle2 size={12} color="var(--status-emerald)" />}
          {status === 'error' && <AlertCircle size={12} color="var(--status-rose)" />}
          {status === 'running' && <Clock size={12} color="var(--status-cyan)" className="pulse-dot" />}
          <span style={{ textTransform: 'capitalize' }}>{status}</span>
        </div>
        {nodeData.lastExecutionDuration !== undefined && (
          <span>{nodeData.lastExecutionDuration}ms</span>
        )}
      </div>

      {/* Dynamic Output Handles */}
      {nodeData.outputs && nodeData.outputs.map((output, index) => {
        const topOffset = nodeData.outputs.length === 1 
          ? 50 
          : 35 + (index * (30 / Math.max(1, nodeData.outputs.length - 1)));
        return (
          <Handle
            key={output.id}
            id={output.id}
            type="source"
            position={Position.Right}
            style={{ top: `${topOffset}%` }}
            title={`Output: ${output.name} (${output.type})`}
          />
        );
      })}
    </div>
  );
};

export const NexusCustomNode = memo(NexusCustomNodeComponent);
