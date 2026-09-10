/**
 * Dlicom Nexus - Pipeline Store & State Engine
 * Manages active pipeline DAG graph mutations, selection, validation, local persistence, and undo/redo history.
 */

import type { NexusEdge, NexusNode, PipelineManifest } from '../../types';
import { DagResolver, type GraphValidationResult } from '../engine/dagResolver';
import { SAMPLE_PIPELINES } from '../data/templates';

export type PipelineStoreListener = () => void;

const STORAGE_KEY = 'dlicom_pipelines_v1';

export class PipelineStore {
  private activePipeline: PipelineManifest;
  private pipelines: Map<string, PipelineManifest> = new Map();
  private selectedNodeId: string | null = null;
  private selectedEdgeId: string | null = null;
  private validationResult: GraphValidationResult;
  private listeners: Set<PipelineStoreListener> = new Set();
  private history: PipelineManifest[] = [];
  private historyIndex: number = -1;

  constructor() {
    this.loadFromStorage();

    // If active pipeline is not set, default to first available
    const firstPipeline = this.pipelines.values().next().value || SAMPLE_PIPELINES[0];
    this.activePipeline = JSON.parse(JSON.stringify(firstPipeline));
    this.validationResult = DagResolver.resolve(this.activePipeline.nodes, this.activePipeline.edges);
    this.pushHistory();
  }

  private loadFromStorage(): void {
    let loadedFromStorage = false;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsed.forEach((p: PipelineManifest) => {
              if (p && p.id && Array.isArray(p.nodes) && Array.isArray(p.edges)) {
                this.pipelines.set(p.id, p);
              }
            });
            loadedFromStorage = this.pipelines.size > 0;
          }
        }
      }
    } catch (err) {
      console.warn('[pipelineStore] Failed to read from localStorage:', err);
    }

    // Always ensure canonical blueprints exist in the registry
    SAMPLE_PIPELINES.forEach(p => {
      if (!this.pipelines.has(p.id)) {
        this.pipelines.set(p.id, JSON.parse(JSON.stringify(p)));
      }
    });

    if (!loadedFromStorage) {
      this.persist();
    }
  }

  private persist(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const payload = JSON.stringify(Array.from(this.pipelines.values()));
        window.localStorage.setItem(STORAGE_KEY, payload);
      }
    } catch (err) {
      console.warn('[pipelineStore] Failed to write to localStorage:', err);
    }
  }

  public subscribe(listener: PipelineStoreListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.validationResult = DagResolver.resolve(this.activePipeline.nodes, this.activePipeline.edges);
    this.persist();
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (err) {
        console.error('Error in PipelineStore subscriber:', err);
      }
    }
  }

  private pushHistory(): void {
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    this.history.push(JSON.parse(JSON.stringify(this.activePipeline)));
    if (this.history.length > 30) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
  }

  public undo(): void {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.activePipeline = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      this.notify();
    }
  }

  public redo(): void {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.activePipeline = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      this.notify();
    }
  }

  public getActivePipeline(): PipelineManifest {
    return this.activePipeline;
  }

  public getNodes(): NexusNode[] {
    return this.activePipeline.nodes;
  }

  public getEdges(): NexusEdge[] {
    return this.activePipeline.edges;
  }

  public getAllPipelines(): PipelineManifest[] {
    return Array.from(this.pipelines.values());
  }

  public getPipelineById(id: string): PipelineManifest | undefined {
    return this.pipelines.get(id);
  }

  public getSelectedNodeId(): string | null {
    return this.selectedNodeId;
  }

  public getSelectedNode(): NexusNode | undefined {
    return this.activePipeline.nodes.find(n => n.id === this.selectedNodeId);
  }

  public getValidation(): GraphValidationResult {
    return this.validationResult;
  }

  public selectNode(nodeId: string | null): void {
    this.selectedNodeId = nodeId;
    this.selectedEdgeId = null;
    this.notify();
  }

  public selectEdge(edgeId: string | null): void {
    this.selectedEdgeId = edgeId;
    this.selectedNodeId = null;
    this.notify();
  }

  public switchPipeline(pipelineId: string): void {
    const found = this.pipelines.get(pipelineId);
    if (found) {
      this.activePipeline = JSON.parse(JSON.stringify(found));
      this.selectedNodeId = null;
      this.selectedEdgeId = null;
      this.history = [];
      this.historyIndex = -1;
      this.pushHistory();
      this.notify();
    }
  }

  public updateActiveMetadata(metadata: Partial<Omit<PipelineManifest, 'nodes' | 'edges'>>): void {
    this.activePipeline = {
      ...this.activePipeline,
      ...metadata,
      updatedAt: new Date().toISOString()
    };
    this.pipelines.set(this.activePipeline.id, this.activePipeline);
    this.pushHistory();
    this.notify();
  }

  public addNode(node: NexusNode): void {
    this.activePipeline.nodes = [...this.activePipeline.nodes, node];
    this.activePipeline.updatedAt = new Date().toISOString();
    this.pipelines.set(this.activePipeline.id, this.activePipeline);
    this.selectedNodeId = node.id;
    this.pushHistory();
    this.notify();
  }

  public updateNode(nodeId: string, updates: Partial<NexusNode['data']>): void {
    this.activePipeline.nodes = this.activePipeline.nodes.map(n => {
      if (n.id === nodeId) {
        return {
          ...n,
          data: { ...n.data, ...updates }
        };
      }
      return n;
    });
    this.activePipeline.updatedAt = new Date().toISOString();
    this.pipelines.set(this.activePipeline.id, this.activePipeline);
    this.pushHistory();
    this.notify();
  }

  public updateNodePosition(nodeId: string, position: { x: number; y: number }): void {
    this.activePipeline.nodes = this.activePipeline.nodes.map(n => {
      if (n.id === nodeId) {
        return { ...n, position };
      }
      return n;
    });
    this.persist();
    this.notify();
  }

  public removeNode(nodeId: string): void {
    this.activePipeline.nodes = this.activePipeline.nodes.filter(n => n.id !== nodeId);
    this.activePipeline.edges = this.activePipeline.edges.filter(
      e => e.source !== nodeId && e.target !== nodeId
    );
    if (this.selectedNodeId === nodeId) {
      this.selectedNodeId = null;
    }
    this.activePipeline.updatedAt = new Date().toISOString();
    this.pipelines.set(this.activePipeline.id, this.activePipeline);
    this.pushHistory();
    this.notify();
  }

  public addEdge(edge: NexusEdge): void {
    const exists = this.activePipeline.edges.some(
      e => e.source === edge.source && e.target === edge.target
    );
    if (exists) return;

    this.activePipeline.edges = [...this.activePipeline.edges, edge];
    this.activePipeline.updatedAt = new Date().toISOString();
    this.pipelines.set(this.activePipeline.id, this.activePipeline);
    this.pushHistory();
    this.notify();
  }

  public removeEdge(edgeId: string): void {
    this.activePipeline.edges = this.activePipeline.edges.filter(e => e.id !== edgeId);
    if (this.selectedEdgeId === edgeId) {
      this.selectedEdgeId = null;
    }
    this.activePipeline.updatedAt = new Date().toISOString();
    this.pipelines.set(this.activePipeline.id, this.activePipeline);
    this.pushHistory();
    this.notify();
  }

  public createNewPipeline(name: string, description: string): PipelineManifest {
    const id = `pipeline_${Date.now()}`;
    const newPipeline: PipelineManifest = {
      id,
      name,
      description,
      version: '1.0.0',
      environment: 'development',
      tags: ['custom'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'Current User',
      nodes: [],
      edges: [],
      variables: {},
      retryPolicy: {
        maxRetries: 3,
        backoffFactor: 2,
        initialIntervalMs: 200,
        maxIntervalMs: 5000
      },
      concurrencyLimit: 10,
      timeoutSeconds: 30,
      active: true
    };

    this.pipelines.set(id, newPipeline);
    this.switchPipeline(id);
    return newPipeline;
  }

  public exportPipelinesJson(): string {
    return JSON.stringify(Array.from(this.pipelines.values()), null, 2);
  }

  public importPipelinesJson(jsonStr: string): { success: boolean; count: number; error?: string } {
    try {
      const parsed = JSON.parse(jsonStr);
      const items: PipelineManifest[] = Array.isArray(parsed) ? parsed : [parsed];
      let importedCount = 0;

      for (const item of items) {
        if (item && item.id && item.name && Array.isArray(item.nodes) && Array.isArray(item.edges)) {
          this.pipelines.set(item.id, item);
          importedCount++;
        }
      }

      if (importedCount > 0) {
        this.persist();
        this.notify();
        return { success: true, count: importedCount };
      }
      return { success: false, count: 0, error: 'No valid pipeline definitions found in JSON payload.' };
    } catch (err: unknown) {
      return {
        success: false,
        count: 0,
        error: err instanceof Error ? err.message : 'Invalid JSON format'
      };
    }
  }

  public resetToDefaults(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
    this.pipelines.clear();
    SAMPLE_PIPELINES.forEach(p => this.pipelines.set(p.id, JSON.parse(JSON.stringify(p))));
    this.activePipeline = JSON.parse(JSON.stringify(SAMPLE_PIPELINES[0]));
    this.persist();
    this.notify();
  }
}

export const globalPipelineStore = new PipelineStore();
