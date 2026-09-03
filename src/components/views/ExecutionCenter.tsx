import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  Search, 
  Trash2, 
  Play, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { globalExecutionStore } from '../../core/store/executionStore';
import { globalPipelineStore } from '../../core/store/pipelineStore';
import { PipelineExecutor } from '../../core/engine/executor';
import { useNavigation } from '../../context';
import type { ExecutionRun, ExecutionStatus } from '../../types';

export const ExecutionCenter: React.FC = () => {
  const { navigateTo } = useNavigation();
  const [runs, setRuns] = useState<ExecutionRun[]>(globalExecutionStore.getRuns());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    const unsub = globalExecutionStore.subscribe(() => {
      setRuns(globalExecutionStore.getRuns());
    });
    return () => unsub();
  }, []);

  const filteredRuns = runs.filter(r => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesSearch = r.pipelineName.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.initiatedBy.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleReRun = async (run: ExecutionRun) => {
    const pipeline = globalPipelineStore.getAllPipelines().find(p => p.id === run.pipelineId) 
      || globalPipelineStore.getActivePipeline();

    const executor = new PipelineExecutor(pipeline, {
      triggerPayload: run.triggerPayload,
      stepDelayMs: 200,
      environment: run.environment,
      initiatedBy: 'Execution Center Re-run'
    });

    const newRun = await executor.execute();
    navigateTo('execution_detail', { executionId: newRun.id });
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all execution history logs?')) {
      globalExecutionStore.clearHistory();
    }
  };

  const getStatusIcon = (status: ExecutionStatus) => {
    switch (status) {
      case 'success': return <CheckCircle2 size={14} color="var(--status-emerald)" />;
      case 'error': return <AlertCircle size={14} color="var(--status-rose)" />;
      case 'running': return <RefreshCw size={14} color="var(--status-cyan)" className="pulse-dot" />;
      default: return <Clock size={14} color="var(--text-dim)" />;
    }
  };

  return (
    <div style={{ padding: '24px', overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Activity size={20} color="var(--status-emerald)" />
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>Execution Center</h1>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Real-time pipeline runs, execution metrics, latency histograms, and observability traces.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-ghost btn-sm"
            onClick={handleClearHistory}
            disabled={runs.length === 0}
          >
            <Trash2 size={14} />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Filter & Controls Bar */}
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
            placeholder="Search run ID, pipeline name, initiator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { id: 'all', label: 'All Runs' },
            { id: 'running', label: 'Running' },
            { id: 'success', label: 'Succeeded' },
            { id: 'error', label: 'Failed' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`btn btn-sm ${statusFilter === f.id ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '12px' }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Runs Table */}
      <div className="nexus-card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredRuns.length === 0 ? (
          <div style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
            <SlidersHorizontal size={32} style={{ margin: '0 auto 12px auto', color: 'var(--text-disabled)' }} />
            <p>No execution runs found matching the current filter.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontSize: '11px', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Pipeline</th>
                <th style={{ padding: '12px 16px' }}>Environment</th>
                <th style={{ padding: '12px 16px' }}>Trigger Mode</th>
                <th style={{ padding: '12px 16px' }}>Nodes Executed</th>
                <th style={{ padding: '12px 16px' }}>Duration</th>
                <th style={{ padding: '12px 16px' }}>Timestamp</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRuns.map((run) => (
                <tr 
                  key={run.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'background var(--transition-fast)'
                  }}
                  onClick={() => navigateTo('execution_detail', { executionId: run.id })}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {getStatusIcon(run.status)}
                      <span className={`badge badge-${run.status}`}>{run.status}</span>
                    </div>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{run.pipelineName}</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{run.id}</span>
                    </div>
                  </td>

                  <td style={{ padding: '12px 16px' }}>
                    <span className={`env-pill ${run.environment}`}>{run.environment}</span>
                  </td>

                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {run.triggerMode}
                  </td>

                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>
                    {run.metrics.nodesExecuted} ({run.metrics.nodesSucceeded} OK, {run.metrics.nodesFailed} ERR)
                  </td>

                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>
                    {run.metrics.totalDurationMs} ms
                  </td>

                  <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-dim)' }}>
                    {new Date(run.startedAt).toLocaleString()}
                  </td>

                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleReRun(run)}
                        title="Re-run this pipeline"
                      >
                        <Play size={12} />
                        <span>Re-run</span>
                      </button>
                      <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => navigateTo('execution_detail', { executionId: run.id })}
                        title="View Detailed Trace"
                      >
                        <ExternalLink size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};
