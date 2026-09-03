/**
 * Dlicom Nexus - Execution Event System
 * Typed pub/sub event bus for live execution updates, telemetry, and debugging.
 */

import type { ExecutionLog, ExecutionRun, StepExecution } from '../../types';

export type NexusEventType = 
  | 'execution:start'
  | 'execution:step_start'
  | 'execution:step_finish'
  | 'execution:log'
  | 'execution:finish'
  | 'execution:error';

export interface NexusEventPayloadMap {
  'execution:start': { run: ExecutionRun };
  'execution:step_start': { runId: string; step: StepExecution };
  'execution:step_finish': { runId: string; step: StepExecution };
  'execution:log': { runId: string; log: ExecutionLog };
  'execution:finish': { run: ExecutionRun };
  'execution:error': { runId: string; error: string };
}

export type NexusEventListener<T extends NexusEventType> = (payload: NexusEventPayloadMap[T]) => void;

export class NexusEventEmitter {
  private listeners: Map<NexusEventType, Set<(payload: unknown) => void>> = new Map();

  public on<T extends NexusEventType>(event: T, listener: NexusEventListener<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const set = this.listeners.get(event)!;
    set.add(listener as (payload: unknown) => void);

    return () => {
      set.delete(listener as (payload: unknown) => void);
    };
  }

  public emit<T extends NexusEventType>(event: T, payload: NexusEventPayloadMap[T]): void {
    const set = this.listeners.get(event);
    if (set) {
      for (const listener of set) {
        try {
          listener(payload);
        } catch (err) {
          console.error(`Error in listener for event ${event}:`, err);
        }
      }
    }
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const globalNexusEvents = new NexusEventEmitter();
