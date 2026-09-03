import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange
} from '@xyflow/react';
import { 
  Undo2, 
  Redo2, 
  Settings2, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { NexusCustomNode } from './NexusCustomNode';
import { NodePalette } from './NodePalette';
import { NodeInspector } from './NodeInspector';
import { LiveTestRunnerBar } from './LiveTestRunnerBar';
import { globalPipelineStore } from '../../../core/store/pipelineStore';
import type { NexusEdge, NexusNode, PipelineManifest } from '../../../types';

export const PipelineBuilder: React.FC = () => {
  const [pipeline, setPipeline] = useState<PipelineManifest>(globalPipelineStore.getActivePipeline());
  const [nodes, setNodes] = useState<Node[]>(globalPipelineStore.getActivePipeline().nodes as unknown as Node[]);
  const [edges, setEdges] = useState<Edge[]>(globalPipelineStore.getActivePipeline().edges as unknown as Edge[]);
  const [inspectorOpen, setInspectorOpen] = useState<boolean>(true);
  const [paletteOpen, setPaletteOpen] = useState<boolean>(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(globalPipelineStore.getSelectedNodeId());
  const validation = globalPipelineStore.getValidation();

  // Custom Node registration
  const nodeTypes = useMemo(() => ({ nexusNode: NexusCustomNode }), []);

  useEffect(() => {
    const unsub = globalPipelineStore.subscribe(() => {
      const active = globalPipelineStore.getActivePipeline();
      setPipeline(active);
      setNodes(active.nodes as unknown as Node[]);
      setEdges(active.edges as unknown as Edge[]);
      setSelectedNodeId(globalPipelineStore.getSelectedNodeId());
    });
    return () => unsub();
  }, []);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => {
        const nextNodes = applyNodeChanges(changes, nds);
        // Sync node positions back to pipeline store
        for (const c of changes) {
          if (c.type === 'position' && c.position) {
            globalPipelineStore.updateNodePosition(c.id, c.position);
          }
        }
        return nextNodes;
      });
    },
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => {
        const nextEdges = applyEdgeChanges(changes, eds);
        for (const c of changes) {
          if (c.type === 'remove') {
            globalPipelineStore.removeEdge(c.id);
          }
        }
        return nextEdges;
      });
    },
    []
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        const newEdge: NexusEdge = {
          id: `e_${connection.source}_${connection.target}`,
          source: connection.source,
          target: connection.target,
          sourceHandle: connection.sourceHandle ?? undefined,
          targetHandle: connection.targetHandle ?? undefined,
          animated: true
        };
        globalPipelineStore.addEdge(newEdge);
        setEdges((eds) => addEdge({ ...connection, animated: true }, eds));
      }
    },
    []
  );

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    globalPipelineStore.selectNode(node.id);
    setSelectedNodeId(node.id);
    setInspectorOpen(true);
  };

  const onPaneClick = () => {
    globalPipelineStore.selectNode(null);
    setSelectedNodeId(null);
  };

  const selectedNode = (pipeline.nodes.find(n => n.id === selectedNodeId)) as NexusNode | undefined;

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      
      {/* Left Node Palette */}
      {paletteOpen && <NodePalette />}

      {/* Main Canvas Area */}
      <div style={{ flex: 1, position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
        
        {/* Canvas Toolbar Top Bar */}
        <div style={{
          height: '42px',
          backgroundColor: 'var(--bg-surface-1)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setPaletteOpen(!paletteOpen)}
              title="Toggle Palette Drawer"
            >
              <span>{paletteOpen ? 'Hide Palette' : 'Show Palette'}</span>
            </button>

            <span className="breadcrumb-divider">|</span>

            <button
              className="btn btn-ghost btn-sm"
              onClick={() => globalPipelineStore.undo()}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={14} />
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => globalPipelineStore.redo()}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 size={14} />
            </button>

            <span className="breadcrumb-divider">|</span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
              {validation.isValid ? (
                <span style={{ color: 'var(--status-emerald)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={13} />
                  <span>Acyclic DAG</span>
                </span>
              ) : (
                <span style={{ color: 'var(--status-rose)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={13} />
                  <span>Cycle / Connection Issue</span>
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setInspectorOpen(!inspectorOpen)}
              title="Toggle Inspector Drawer"
            >
              <Settings2 size={14} />
              <span>Inspector</span>
            </button>
          </div>
        </div>

        {/* ReactFlow Interactive Canvas */}
        <div style={{ flex: 1, position: 'relative', width: '100%', height: 'calc(100% - 42px)' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            defaultEdgeOptions={{ animated: true }}
          >
            <Background gap={20} size={1} color="#242c3f" />
            <Controls showInteractive={false} position="bottom-right" />
          </ReactFlow>

          {/* Bottom Live Test Runner Bar */}
          <LiveTestRunnerBar pipeline={pipeline} validation={validation} />
        </div>
      </div>

      {/* Right Inspector Panel */}
      {inspectorOpen && (
        <NodeInspector
          selectedNode={selectedNode}
          pipeline={pipeline}
          onClose={() => setInspectorOpen(false)}
        />
      )}
    </div>
  );
};
