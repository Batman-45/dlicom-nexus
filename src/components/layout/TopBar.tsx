import React, { useEffect, useState } from 'react';
import { 
  Boxes, 
  Play, 
  Plus, 
  Terminal,
  Activity,
  Layers
} from 'lucide-react';
import { useNavigation } from '../../context';
import { globalPipelineStore } from '../../core/store/pipelineStore';
import { globalExecutionStore } from '../../core/store/executionStore';
import { PipelineExecutor } from '../../core/engine/executor';
import type { PipelineManifest } from '../../types';

export const TopBar: React.FC = () => {
  const { navigateTo } = useNavigation();
  const [pipeline, setPipeline] = useState<PipelineManifest>(globalPipelineStore.getActivePipeline());
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeRunsCount, setActiveRunsCount] = useState<number>(0);

  useEffect(() => {
    const unsubPipeline = globalPipelineStore.subscribe(() => {
      setPipeline(globalPipelineStore.getActivePipeline());
    });

    const unsubExec = globalExecutionStore.subscribe(() => {
      const active = globalExecutionStore.getRuns().filter(r => r.status === 'running').length;
      setActiveRunsCount(active);
    });

    return () => {
      unsubPipeline();
      unsubExec();
    };
  }, []);

  const handleRunActivePipeline = async () => {
    setIsRunning(true);
    const executor = new PipelineExecutor(pipeline, {
      stepDelayMs: 250,
      environment: pipeline.environment,
      initiatedBy: 'TopBar Quick Run'
    });
    
    // Execute and auto navigate to execution center/detail
    const run = await executor.execute();
    setIsRunning(false);
    navigateTo('execution_detail', { executionId: run.id });
  };

  const handleCreateNew = () => {
    const created = globalPipelineStore.createNewPipeline(
      `Pipeline ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      'New customized Dlicom workflow'
    );
    setPipeline(created);
    navigateTo('builder');
  };

  const cycleEnvironment = () => {
    const envs: Array<'development' | 'staging' | 'production'> = ['development', 'staging', 'production'];
    const currentIndex = envs.indexOf(pipeline.environment);
    const nextEnv = envs[(currentIndex + 1) % envs.length];
    globalPipelineStore.updateActiveMetadata({ environment: nextEnv });
  };

  return (
    <header className="nexus-topbar">
      <div className="topbar-left">
        <div className="dlicom-brand" onClick={() => navigateTo('home')}>
          <div className="brand-icon-box">
            <Boxes size={18} strokeWidth={2.5} />
          </div>
          <span>DLICOM</span>
          <span className="brand-badge">NEXUS</span>
        </div>

        <span className="breadcrumb-divider">/</span>

        <div className="pipeline-breadcrumb">
          <Layers size={15} color="var(--text-dim)" />
          <span 
            style={{ fontWeight: 600, cursor: 'pointer' }}
            onClick={() => navigateTo('builder')}
            title="Open in Builder"
          >
            {pipeline.name}
          </span>
          <span style={{ color: 'var(--text-dim)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            v{pipeline.version}
          </span>
        </div>

        <button 
          className={`env-pill ${pipeline.environment}`}
          onClick={cycleEnvironment}
          title="Click to cycle environment"
        >
          <span className="pulse-dot"></span>
          {pipeline.environment}
        </button>
      </div>

      <div className="topbar-center">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <Activity size={14} color="var(--status-emerald)" />
          <span>Cluster: <strong style={{ color: 'var(--text-primary)' }}>dlicom-mesh-us-east</strong></span>
          <span className="breadcrumb-divider">|</span>
          <span>Active Runs: <strong style={{ color: activeRunsCount > 0 ? 'var(--status-cyan)' : 'var(--text-primary)' }}>{activeRunsCount}</strong></span>
        </div>
      </div>

      <div className="topbar-right">
        <button 
          className="btn btn-secondary btn-sm"
          onClick={handleCreateNew}
          title="Create a new workflow pipeline"
        >
          <Plus size={14} />
          <span>New Pipeline</span>
        </button>

        <button 
          className="btn btn-primary btn-sm"
          onClick={handleRunActivePipeline}
          disabled={isRunning}
          title="Execute active pipeline immediately"
        >
          <Play size={14} />
          <span>{isRunning ? 'Running...' : 'Execute Run'}</span>
        </button>

        <button 
          className="btn btn-ghost btn-sm"
          onClick={() => navigateTo('executions')}
          title="View Executions Console"
        >
          <Terminal size={15} />
        </button>
      </div>
    </header>
  );
};
