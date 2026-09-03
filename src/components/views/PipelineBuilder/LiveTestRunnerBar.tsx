import React, { useState } from 'react';
import { 
  Play, 
  Terminal, 
  CheckCircle2, 
  AlertCircle, 
  ChevronUp, 
  ChevronDown, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { PipelineExecutor } from '../../../core/engine/executor';
import { useNavigation } from '../../../context';
import type { GraphValidationResult, PipelineManifest, ExecutionRun } from '../../../types';

interface LiveTestRunnerBarProps {
  pipeline: PipelineManifest;
  validation: GraphValidationResult;
}

export const LiveTestRunnerBar: React.FC<LiveTestRunnerBarProps> = ({ pipeline, validation }) => {
  const { navigateTo } = useNavigation();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [lastRun, setLastRun] = useState<ExecutionRun | null>(null);
  const [payloadJson, setPayloadJson] = useState<string>(
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        eventType: 'telemetry.device.update',
        tenantId: 'dlicom-tenant-01',
        metrics: { cpuUsage: 42.5, memoryMb: 1024, errorCount: 0 }
      },
      null,
      2
    )
  );

  const handleExecute = async () => {
    setIsRunning(true);
    let parsedPayload = {};
    try {
      parsedPayload = JSON.parse(payloadJson);
    } catch {
      parsedPayload = { error: 'Invalid JSON payload parsed' };
    }

    const executor = new PipelineExecutor(pipeline, {
      triggerPayload: parsedPayload,
      stepDelayMs: 200,
      environment: pipeline.environment,
      initiatedBy: 'Builder Test Bar'
    });

    const run = await executor.execute();
    setLastRun(run);
    setIsRunning(false);
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'var(--bg-surface-1)',
      borderTop: '1px solid var(--border-subtle)',
      zIndex: 30,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: 'var(--shadow-lg)'
    }}>
      {/* Bar Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        backgroundColor: 'var(--bg-surface-2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Terminal size={14} color="var(--status-cyan)" />
            <span style={{ fontWeight: 600, fontSize: '12px' }}>Test Console & Runner</span>
            {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>

          {/* Validation Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            {validation.isValid ? (
              <span className="badge badge-success">
                <CheckCircle2 size={12} />
                <span>DAG Valid ({pipeline.nodes.length} nodes, {validation.executionTiers.length} tiers)</span>
              </span>
            ) : (
              <span className="badge badge-error" title={validation.errors.join(', ')}>
                <AlertCircle size={12} />
                <span>DAG Issues: {validation.errors[0] || 'Invalid'}</span>
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {lastRun && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              <span className={`badge badge-${lastRun.status}`}>
                {lastRun.status} ({lastRun.metrics.totalDurationMs}ms)
              </span>
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => navigateTo('execution_detail', { executionId: lastRun.id })}
                title="Inspect in Execution Detail"
              >
                <span>Inspect Trace</span>
                <ExternalLink size={12} />
              </button>
            </div>
          )}

          <button
            className="btn btn-primary btn-sm"
            onClick={handleExecute}
            disabled={isRunning || !validation.isValid}
          >
            {isRunning ? (
              <>
                <RefreshCw size={13} className="pulse-dot" />
                <span>Executing...</span>
              </>
            ) : (
              <>
                <Play size={13} />
                <span>Run Pipeline</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Console Panel */}
      {isExpanded && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          padding: '16px',
          height: '200px',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-core)'
        }}>
          {/* Payload Editor */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', height: '100%' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Input Trigger Payload (JSON)
            </span>
            <textarea
              className="textarea"
              style={{ flex: 1, height: '100%', resize: 'none' }}
              value={payloadJson}
              onChange={(e) => setPayloadJson(e.target.value)}
            />
          </div>

          {/* Execution Output / Logs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', height: '100%' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Execution Logs & Step Traces
            </span>
            <div style={{
              flex: 1,
              backgroundColor: 'var(--bg-surface-1)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              {!lastRun ? (
                <span style={{ color: 'var(--text-dim)' }}>No execution logs yet. Click "Run Pipeline" to start test.</span>
              ) : (
                lastRun.logs.map((log) => (
                  <div key={log.id} style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ color: 'var(--text-dim)' }}>[{log.timestamp.substring(11, 19)}]</span>
                    <span style={{
                      color: log.level === 'error' ? 'var(--status-rose)' :
                             log.level === 'warn' ? 'var(--status-amber)' :
                             log.level === 'debug' ? 'var(--status-cyan)' : 'var(--text-secondary)'
                    }}>
                      [{log.level.toUpperCase()}]
                    </span>
                    <span>{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
