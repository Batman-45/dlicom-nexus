import React, { useEffect, useState } from 'react';
import { 
  Layers, 
  Search, 
  Plus, 
  Play, 
  Copy, 
  ArrowRight
} from 'lucide-react';
import { globalPipelineStore } from '../../core/store/pipelineStore';
import { PipelineExecutor } from '../../core/engine/executor';
import { useNavigation } from '../../context';
import type { PipelineManifest } from '../../types';

export const PipelineLibrary: React.FC = () => {
  const { navigateTo } = useNavigation();
  const [pipelines, setPipelines] = useState<PipelineManifest[]>(globalPipelineStore.getAllPipelines());
  const [search, setSearch] = useState<string>('');
  const [envFilter, setEnvFilter] = useState<string>('all');

  useEffect(() => {
    const unsub = globalPipelineStore.subscribe(() => {
      setPipelines(globalPipelineStore.getAllPipelines());
    });
    return () => unsub();
  }, []);

  const filtered = pipelines.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesEnv = envFilter === 'all' || p.environment === envFilter;
    return matchesSearch && matchesEnv;
  });

  const handleOpen = (pipelineId: string) => {
    globalPipelineStore.switchPipeline(pipelineId);
    navigateTo('builder');
  };

  const handleCreate = () => {
    const created = globalPipelineStore.createNewPipeline(
      `Pipeline ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      'Custom Dlicom workflow graph'
    );
    navigateTo('builder', { pipelineId: created.id });
  };

  const handleDuplicate = (p: PipelineManifest) => {
    const time = new Date().toISOString();
    const dup: PipelineManifest = {
      ...JSON.parse(JSON.stringify(p)),
      id: `pipeline_${p.id}_copy`,
      name: `${p.name} (Copy)`,
      createdAt: time,
      updatedAt: time
    };
    globalPipelineStore.createNewPipeline(dup.name, dup.description);
    globalPipelineStore.updateActiveMetadata(dup);
    setPipelines(globalPipelineStore.getAllPipelines());
  };

  const handleRun = async (p: PipelineManifest) => {
    const executor = new PipelineExecutor(p, {
      stepDelayMs: 200,
      environment: p.environment,
      initiatedBy: 'Library Quick Run'
    });
    const run = await executor.execute();
    navigateTo('execution_detail', { executionId: run.id });
  };

  return (
    <div style={{ padding: '24px', overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Layers size={20} color="var(--status-indigo)" />
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>Pipeline Library</h1>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Manage, version, clone, and configure all workflow pipelines across your active Dlicom cluster.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleCreate}>
          <Plus size={15} />
          <span>New Pipeline</span>
        </button>
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
            placeholder="Search pipelines, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { id: 'all', label: 'All Environments' },
            { id: 'production', label: 'Production' },
            { id: 'staging', label: 'Staging' },
            { id: 'development', label: 'Development' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setEnvFilter(f.id)}
              className={`btn btn-sm ${envFilter === f.id ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '12px' }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Pipelines */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
        {filtered.map(p => (
          <div
            key={p.id}
            className="nexus-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '14px',
              cursor: 'pointer'
            }}
            onClick={() => handleOpen(p.id)}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</h3>
                <span className={`env-pill ${p.environment}`}>{p.environment}</span>
              </div>

              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '12px' }}>
                {p.description}
              </p>

              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {p.tags.map(t => (
                  <span key={t} className="badge badge-idle" style={{ fontSize: '10px' }}>#{t}</span>
                ))}
                <span className="badge badge-ai" style={{ fontSize: '10px' }}>{p.nodes.length} Nodes</span>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '10px', fontFamily: 'var(--font-mono)' }}>
                <span>v{p.version} · By {p.author}</span>
                <span>{new Date(p.updatedAt).toLocaleDateString()}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDuplicate(p)} title="Duplicate Pipeline">
                    <Copy size={13} />
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleRun(p)} title="Execute Run">
                    <Play size={13} />
                  </button>
                </div>

                <button className="btn btn-primary btn-sm" onClick={() => handleOpen(p.id)}>
                  <span>Edit Graph</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
