import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Layers, 
  Copy, 
  Check, 
  FileText
} from 'lucide-react';
import { globalExecutionStore } from '../../core/store/executionStore';
import { globalPipelineStore } from '../../core/store/pipelineStore';
import { PipelineExecutor } from '../../core/engine/executor';
import { useNavigation } from '../../context';
import type { ExecutionRun, StepExecution, LogLevel } from '../../types';

interface ExecutionDetailProps {
  executionId: string | null;
}

export const ExecutionDetail: React.FC<ExecutionDetailProps> = ({ executionId }) => {
  const { navigateTo } = useNavigation();
  const runs = globalExecutionStore.getRuns();
  const run: ExecutionRun | undefined = executionId 
    ? globalExecutionStore.getRun(executionId) || runs[0]
    : runs[0];

  const [selectedStepId, setSelectedStepId] = useState<string | null>(
    run && run.stepOrder.length > 0 ? run.stepOrder[0] : null
  );
  const [logFilter, setLogFilter] = useState<string>('all');
  const [copied, setCopied] = useState<boolean>(false);

  if (!run) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
        <p>No execution selected or recorded yet.</p>
        <button className="btn btn-primary btn-sm" style={{ marginTop: '12px' }} onClick={() => navigateTo('home')}>
          Return to Nexus Home
        </button>
      </div>
    );
  }

  const stepsList: StepExecution[] = run.stepOrder.map(id => run.steps[id]).filter(Boolean);
  const activeStep: StepExecution | undefined = selectedStepId ? run.steps[selectedStepId] : stepsList[0];

  const filteredLogs = run.logs.filter(log => {
    if (logFilter === 'all') return true;
    return log.level === logFilter;
  });

  const handleCopyPayload = (payload: unknown) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleReRun = async () => {
    const pipeline = globalPipelineStore.getAllPipelines().find(p => p.id === run.pipelineId) 
      || globalPipelineStore.getActivePipeline();

    const executor = new PipelineExecutor(pipeline, {
      triggerPayload: run.triggerPayload,
      stepDelayMs: 200,
      environment: run.environment,
      initiatedBy: 'Execution Detail Re-run'
    });

    const newRun = await executor.execute();
    navigateTo('execution_detail', { executionId: newRun.id });
  };

  return (
    <div style={{ padding: '24px', overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header & Breadcrumb */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigateTo('executions')} title="Back to Execution Center">
            <ArrowLeft size={16} />
            <span>Executions</span>
          </button>

          <span className="breadcrumb-divider">/</span>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {run.pipelineName}
              </h1>
              <span className={`badge badge-${run.status}`}>{run.status}</span>
              <span className={`env-pill ${run.environment}`}>{run.environment}</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              Run ID: {run.id} · Initiated by: {run.initiatedBy} · {new Date(run.startedAt).toLocaleString()}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigateTo('builder', { pipelineId: run.pipelineId })}>
            <Layers size={14} />
            <span>Open in Builder</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleReRun}>
            <Play size={14} />
            <span>Re-run Trace</span>
          </button>
        </div>
      </div>

      {/* Execution Summary Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        <div className="nexus-card" style={{ padding: '12px 16px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Total Duration</span>
          <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            {run.metrics.totalDurationMs} ms
          </div>
        </div>
        <div className="nexus-card" style={{ padding: '12px 16px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Nodes Succeeded</span>
          <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--status-emerald)', marginTop: '4px' }}>
            {run.metrics.nodesSucceeded} / {run.metrics.nodesExecuted}
          </div>
        </div>
        <div className="nexus-card" style={{ padding: '12px 16px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Trigger Mode</span>
          <div style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'var(--font-mono)', marginTop: '6px' }}>
            {run.triggerMode}
          </div>
        </div>
        <div className="nexus-card" style={{ padding: '12px 16px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Recorded Logs</span>
          <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            {run.logs.length}
          </div>
        </div>
      </div>

      {/* Step Timeline Waterfall */}
      <div className="nexus-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          DAG Step Execution Sequence
        </span>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {stepsList.map((step, idx) => {
            const isSelected = activeStep?.id === step.id;
            return (
              <div
                key={step.id}
                style={{
                  minWidth: '180px',
                  padding: '10px',
                  backgroundColor: isSelected ? 'var(--bg-surface-3)' : 'var(--bg-surface-2)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid',
                  borderColor: isSelected ? 'var(--status-cyan)' : 'var(--border-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
                onClick={() => setSelectedStepId(step.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    Step {idx + 1}
                  </span>
                  {step.status === 'success' && <CheckCircle2 size={13} color="var(--status-emerald)" />}
                  {step.status === 'error' && <AlertCircle size={13} color="var(--status-rose)" />}
                  {step.status === 'running' && <Clock size={13} color="var(--status-cyan)" className="pulse-dot" />}
                </div>
                <div style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}>{step.nodeLabel}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  <span>{step.durationMs ?? 0} ms</span>
                  <span style={{ textTransform: 'capitalize' }}>{step.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Payload Inspector & Live Log Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '16px' }}>
        
        {/* Step Inspector */}
        <div className="nexus-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={15} color="var(--status-cyan)" />
              <span>Step Payload: {activeStep?.nodeLabel || 'Select Step'}</span>
            </h3>
            {Boolean(activeStep?.outputPayload) && (
              <button className="btn btn-ghost btn-sm" onClick={() => handleCopyPayload(activeStep?.outputPayload)}>
                {copied ? <Check size={13} color="var(--status-emerald)" /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy Output'}</span>
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '10px', height: '320px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Input Payload</span>
              <pre style={{
                flex: 1,
                padding: '10px',
                backgroundColor: 'var(--bg-core)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                overflow: 'auto',
                color: 'var(--text-secondary)'
              }}>
                {JSON.stringify(activeStep?.inputPayload || {}, null, 2)}
              </pre>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Output Payload</span>
              <pre style={{
                flex: 1,
                padding: '10px',
                backgroundColor: 'var(--bg-core)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                overflow: 'auto',
                color: activeStep?.status === 'error' ? 'var(--status-rose)' : 'var(--status-emerald)'
              }}>
                {activeStep?.error 
                  ? JSON.stringify(activeStep.error, null, 2)
                  : JSON.stringify(activeStep?.outputPayload || {}, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Execution Log Stream */}
        <div className="nexus-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600 }}>Execution Logs ({filteredLogs.length})</h3>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['all', 'info', 'warn', 'error', 'debug'] as Array<string | LogLevel>).map((lvl) => (
                <button
                  key={lvl}
                  className={`btn btn-sm ${logFilter === lvl ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ padding: '2px 8px', fontSize: '10px', textTransform: 'uppercase' }}
                  onClick={() => setLogFilter(lvl)}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div style={{
            height: '320px',
            backgroundColor: 'var(--bg-core)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            padding: '10px',
            overflowY: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            {filteredLogs.map(log => (
              <div key={log.id} style={{ display: 'flex', gap: '8px', lineHeight: 1.4 }}>
                <span style={{ color: 'var(--text-dim)' }}>[{log.timestamp.substring(11, 19)}]</span>
                <span style={{
                  color: log.level === 'error' ? 'var(--status-rose)' :
                         log.level === 'warn' ? 'var(--status-amber)' :
                         log.level === 'debug' ? 'var(--status-cyan)' : 'var(--status-emerald)',
                  fontWeight: 600
                }}>
                  [{log.level.toUpperCase()}]
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>{log.message}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
