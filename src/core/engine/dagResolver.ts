/**
 * Dlicom Nexus - DAG Graph Resolver
 * Performs dependency graph resolution, cycle detection, and topological sorting
 * to determine execution order and parallel execution tiers.
 */

import type { NexusEdge, NexusNode } from '../../types';

export interface GraphValidationResult {
  isValid: boolean;
  hasCycles: boolean;
  errors: string[];
  warnings: string[];
  executionTiers: string[][]; // Node IDs organized in parallel execution tiers
  rootNodeIds: string[];
  leafNodeIds: string[];
}

export class DagResolver {
  /**
   * Validates and analyzes a pipeline DAG.
   */
  public static resolve(nodes: NexusNode[], edges: NexusEdge[]): GraphValidationResult {
    const nodeMap = new Map<string, NexusNode>();
    nodes.forEach(n => nodeMap.set(n.id, n));

    const inDegree = new Map<string, number>();
    const adjacency = new Map<string, string[]>();
    const reverseAdjacency = new Map<string, string[]>();

    // Initialize maps
    for (const node of nodes) {
      inDegree.set(node.id, 0);
      adjacency.set(node.id, []);
      reverseAdjacency.set(node.id, []);
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Populate adjacency and in-degrees
    for (const edge of edges) {
      if (!nodeMap.has(edge.source)) {
        errors.push(`Edge references non-existent source node: ${edge.source}`);
        continue;
      }
      if (!nodeMap.has(edge.target)) {
        errors.push(`Edge references non-existent target node: ${edge.target}`);
        continue;
      }

      const currentAdjacency = adjacency.get(edge.source) || [];
      currentAdjacency.push(edge.target);
      adjacency.set(edge.source, currentAdjacency);

      const currentRev = reverseAdjacency.get(edge.target) || [];
      currentRev.push(edge.source);
      reverseAdjacency.set(edge.target, currentRev);

      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    }

    // Identify Root Nodes (Trigger / Entry points)
    const rootNodeIds = nodes
      .filter(n => (inDegree.get(n.id) || 0) === 0)
      .map(n => n.id);

    // Identify Leaf Nodes
    const leafNodeIds = nodes
      .filter(n => (adjacency.get(n.id) || []).length === 0)
      .map(n => n.id);

    if (nodes.length > 0 && rootNodeIds.length === 0) {
      errors.push('Pipeline has no root entry node (all nodes have incoming dependencies).');
    }

    // Topological sort via Kahn's algorithm by tiers for parallel execution
    const executionTiers: string[][] = [];
    const inDegreeCopy = new Map<string, number>(inDegree);
    let currentTier = [...rootNodeIds];
    let processedNodeCount = 0;

    while (currentTier.length > 0) {
      executionTiers.push(currentTier);
      processedNodeCount += currentTier.length;

      const nextTier: string[] = [];

      for (const nodeId of currentTier) {
        const neighbors = adjacency.get(nodeId) || [];
        for (const neighborId of neighbors) {
          const currentDeg = inDegreeCopy.get(neighborId) || 0;
          const newDeg = currentDeg - 1;
          inDegreeCopy.set(neighborId, newDeg);

          if (newDeg === 0) {
            nextTier.push(neighborId);
          }
        }
      }

      currentTier = nextTier;
    }

    const hasCycles = processedNodeCount < nodes.length;
    if (hasCycles) {
      errors.push('Cycle detected in pipeline graph. DAG must be strictly acyclic.');
    }

    // Check for orphaned non-root nodes
    for (const node of nodes) {
      const incoming = inDegree.get(node.id) || 0;
      const outgoing = (adjacency.get(node.id) || []).length;

      if (incoming === 0 && outgoing === 0 && nodes.length > 1) {
        warnings.push(`Node "${node.data.label}" (${node.id}) is disconnected from the pipeline.`);
      }
    }

    return {
      isValid: errors.length === 0,
      hasCycles,
      errors,
      warnings,
      executionTiers,
      rootNodeIds,
      leafNodeIds
    };
  }
}
