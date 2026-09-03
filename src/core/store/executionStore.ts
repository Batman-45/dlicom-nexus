/**
 * Dlicom Nexus - Execution Store
 * Tracks execution histories, active run states, real-time logs, and metrics.
 */

import type { ExecutionRun } from '../../types';
import { globalNexusEvents } from '../engine/events';

export type ExecutionStoreListener = () => void;

export class ExecutionStore {
  private runs: Map<string, ExecutionRun> = new Map();
  private activeRunId: string | null = null;
  private listeners: Set<ExecutionStoreListener> = new Set();

  constructor() {
    this.initEventListeners();
  }

  private initEventListeners(): void {
    globalNexusEvents.on('execution:start', ({ run }) => {
      this.runs.set(run.id, { ...run });
      this.activeRunId = run.id;
      this.notify();
    });

    globalNexusEvents.on('execution:step_start', ({ runId, step }) => {
      const run = this.runs.get(runId);
      if (run) {
        run.steps = { ...run.steps, [step.id]: { ...step } };
        this.notify();
      }
    });

    globalNexusEvents.on('execution:step_finish', ({ runId, step }) => {
      const run = this.runs.get(runId);
      if (run) {
        run.steps = { ...run.steps, [step.id]: { ...step } };
        this.notify();
      }
    });

    globalNexusEvents.on('execution:log', ({ runId, log }) => {
      const run = this.runs.get(runId);
      if (run) {
        run.logs = [...run.logs, log];
        this.notify();
      }
    });

    globalNexusEvents.on('execution:finish', ({ run }) => {
      this.runs.set(run.id, { ...run });
      this.notify();
    });

    globalNexusEvents.on('execution:error', ({ runId }) => {
      const run = this.runs.get(runId);
      if (run) {
        run.status = 'error';
        this.notify();
      }
    });
  }

  public subscribe(listener: ExecutionStoreListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (err) {
        console.error('Error in ExecutionStore subscriber:', err);
      }
    }
  }

  public getRuns(): ExecutionRun[] {
    return Array.from(this.runs.values()).sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  }

  public getRun(id: string): ExecutionRun | undefined {
    return this.runs.get(id);
  }

  public getActiveRun(): ExecutionRun | undefined {
    return this.activeRunId ? this.runs.get(this.activeRunId) : undefined;
  }

  public setActiveRunId(id: string | null): void {
    this.activeRunId = id;
    this.notify();
  }

  public clearHistory(): void {
    this.runs.clear();
    this.activeRunId = null;
    this.notify();
  }
}

export const globalExecutionStore = new ExecutionStore();
