import React, { useEffect, useState } from 'react';
import { 
  GitFork, 
  Activity, 
  Cpu, 
  Database, 
  Radio, 
  Play, 
  ArrowRight, 
  Plus, 
  Sparkles,
  Layers,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useNavigation } from '../../context';
import { globalPipelineStore } from '../../core/store/pipelineStore';
import { globalExecutionStore } from '../../core/store/executionStore';
import { SAMPLE_PIPELINES } from '../../core/data/templates';
import type { ExecutionRun, PipelineManifest } from '../../types';

export const NexusHome: React.FC = () => {
  const { navigateTo } = useNavigation();
  const [pipelines, setPipelines] = useState<PipelineManifest[]>(globalPipelineStore.getAllPipelines());
  const [runs, setRuns] = useState<ExecutionRun[]>(globalExecutionStore.getRuns());

  useEffect(() => {
    const unsubPipeline = globalPipelineStore.subscribe(() => {
      setPipelines(globalPipelineStore.getAllPipelines());
    });
    const unsubExec = globalExecutionStore.subscribe(() => {
      setRuns(globalExecutionStore.getRuns());
    });
    return () => {
      unsubPipeline();
      unsubExec();
    };
  }, []);

  const handleOpenPipeline = (pipelineId: string) => {
    globalPipelineStore.switchPipeline(pipelineId);
    navigateTo('builder');
  };

  const handleCreateNew = () => {
    const created = globalPipelineStore.createNewPipeline(
      `Pipeline ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      'Custom Dlicom graph workflow'
    );
    navigateTo('builder', { pipelineId: created.id });
  };

  const activeRunsCount = runs.filter(r => r.status === 'running').length;
  const successRunsCount = runs.filter(r => r.status === 'success').length;
  const successRate = runs.length > 0 ? Math.round((successRunsCount / runs.length) * 100) : 100;

  return (
    <div style={{ padding: '24px', overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Welcome / Live Telemetry Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px',
        background: 'linear-gradient(135deg, var(--bg-surface-1), var(--bg-surface-2))',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="env-pill production">
              <span className="pulse-dot"></span>
              DLICOM ECOSYSTEM LIVE
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Cluster: us-east-mesh-01</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Dlicom Nexus Orchestrator
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '640px' }}>
            Mission control for designing, connecting, and running resilient pipelines across Dlicom AI Reasoning engines, Data Mesh, and Event Buses.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => navigateTo('connectors')}>
            <Database size={15} />
            <span>Connectors</span>
          </button>
          <button className="btn btn-primary" onClick={handleCreateNew}>
            <Plus size={15} />
            <span>New Pipeline</span>
          </button>
        </div>
      </div>

      {/* Telemetry Metrics Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="nexus-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', fontSize: '12px', marginBottom: '8px' }}>
            <span>Active Pipelines</span>
            <Layers size={16} color="var(--status-indigo)" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{pipelines.length}</div>
          <div style={{ fontSize: '11px', color: 'var(--status-emerald)', marginTop: '4px' }}>All graphs valid & ready</div>
        </div>

        <div className="nexus-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', fontSize: '12px', marginBottom: '8px' }}>
            <span>Active Executions</span>
            <Activity size={16} color="var(--status-cyan)" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: activeRunsCount > 0 ? 'var(--status-cyan)' : 'var(--text-primary)' }}>
            {activeRunsCount}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Real-time event loop active</div>
        </div>

        <div className="nexus-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', fontSize: '12px', marginBottom: '8px' }}>
            <span>Success Rate</span>
            <Sparkles size={16} color="var(--status-emerald)" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--status-emerald)' }}>
            {successRate}%
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{runs.length} total recorded runs</div>
        </div>

        <div className="nexus-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', fontSize: '12px', marginBottom: '8px' }}>
            <span>Avg Node Latency</span>
            <Clock size={16} color="var(--status-amber)" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>38 ms</div>
          <div style={{ fontSize: '11px', color: 'var(--status-emerald)', marginTop: '4px' }}>P95 within 85ms SLA</div>
        </div>
      </div>

      {/* Blueprint Launchpad (Templates) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Dlicom Blueprint Launchpad</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Production-grade reference architectures ready to customize</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigateTo('library')}>
            <span>View All Blueprints</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
          {SAMPLE_PIPELINES.map((template) => (
            <div 
              key={template.id} 
              className="nexus-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                borderColor: 'var(--border-medium)'
              }}
              onClick={() => handleOpenPipeline(template.id)}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-surface-3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--status-cyan)'
                    }}>
                      {template.id.includes('agent') ? <Cpu size={18} /> : <Radio size={18} />}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{template.name}</span>
                  </div>
                  <span className={`env-pill ${template.environment}`}>
                    {template.environment}
                  </span>
                </div>

                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
                  {template.description}
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {template.tags.map(t => (
                    <span key={t} className="badge badge-idle">#{t}</span>
                  ))}
                  <span className="badge badge-ai">{template.nodes.length} Nodes</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    Version {template.version}
                  </span>
                  <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); handleOpenPipeline(template.id); }}>
                    <span>Open in Builder</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-Column Section: Active Pipelines & Recent Execution Runs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        
        {/* Active Pipelines */}
        <div className="nexus-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <GitFork size={16} color="var(--status-cyan)" />
              <span>Pipelines In Workspace</span>
            </h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigateTo('library')}>
              <span>Manage ({pipelines.length})</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pipelines.map(p => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-surface-2)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer'
                }}
                onClick={() => handleOpenPipeline(p.id)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{p.name}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                    {p.nodes.length} nodes · Updated {new Date(p.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`env-pill ${p.environment}`}>{p.environment}</span>
                  <ExternalLink size={14} color="var(--text-dim)" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Execution Stream */}
        <div className="nexus-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={16} color="var(--status-emerald)" />
              <span>Recent Executions</span>
            </h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigateTo('executions')}>
              <span>View All Runs</span>
            </button>
          </div>

          {runs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-dim)', fontSize: '13px' }}>
              <p>No executions recorded yet in this session.</p>
              <button 
                className="btn btn-secondary btn-sm" 
                style={{ marginTop: '12px' }}
                onClick={() => {
                  const active = globalPipelineStore.getActivePipeline();
                  handleOpenPipeline(active.id);
                }}
              >
                <Play size={13} />
                <span>Run First Pipeline</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {runs.slice(0, 5).map(r => (
                <div
                  key={r.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    backgroundColor: 'var(--bg-surface-2)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigateTo('execution_detail', { executionId: r.id })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge badge-${r.status}`}>
                      {r.status}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>{r.pipelineName}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                    <span>{r.metrics.totalDurationMs}ms</span>
                    <span>{new Date(r.startedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
