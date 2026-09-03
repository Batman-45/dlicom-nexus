/**
 * Dlicom Nexus - Connector Registry
 * Manages connector discovery, search, categorization, and custom connector registration.
 */

import type { ConnectorCategory, ConnectorDefinition } from '../../types';
import { BUILTIN_CONNECTORS } from './builtin';

export class ConnectorRegistry {
  private connectors: Map<string, ConnectorDefinition> = new Map();

  constructor() {
    // Load builtins by default
    BUILTIN_CONNECTORS.forEach(c => this.register(c));
  }

  public register(connector: ConnectorDefinition): void {
    this.connectors.set(connector.id, connector);
  }

  public get(id: string): ConnectorDefinition | undefined {
    return this.connectors.get(id);
  }

  public getAll(): ConnectorDefinition[] {
    return Array.from(this.connectors.values());
  }

  public getByCategory(category: ConnectorCategory): ConnectorDefinition[] {
    return this.getAll().filter(c => c.category === category);
  }

  public getDlicomNative(): ConnectorDefinition[] {
    return this.getAll().filter(c => c.isDlicomNative);
  }

  public search(query: string): ConnectorDefinition[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.getAll();

    return this.getAll().filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.tags.some(t => t.toLowerCase().includes(q))
    );
  }
}

export const globalConnectorRegistry = new ConnectorRegistry();
