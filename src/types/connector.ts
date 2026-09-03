/**
 * Dlicom Nexus - Integration & Connector Specifications
 * Defines standard contracts for Dlicom Ecosystem & external protocol connectors.
 */

import type { NodeConfigField, PortDefinition } from './pipeline';

export type ConnectorCategory = 
  | 'dlicom_core'
  | 'database'
  | 'streaming'
  | 'ai_model'
  | 'protocols'
  | 'storage'
  | 'utilities';

export type AuthType = 'none' | 'api_key' | 'bearer' | 'oauth2' | 'mutual_tls' | 'dlicom_vault';

export interface AuthConfiguration {
  type: AuthType;
  fields: NodeConfigField[];
}

export interface ConnectorAction {
  id: string;
  name: string;
  description: string;
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  configFields: NodeConfigField[];
  executeHandler?: (config: Record<string, unknown>, payload: unknown) => Promise<unknown>;
}

export interface ConnectorTrigger {
  id: string;
  name: string;
  description: string;
  outputs: PortDefinition[];
  configFields: NodeConfigField[];
  mode: 'push' | 'poll' | 'stream';
}

export interface ConnectorDefinition {
  id: string;
  name: string;
  version: string;
  category: ConnectorCategory;
  description: string;
  icon: string;
  author: string;
  isDlicomNative: boolean;
  auth?: AuthConfiguration;
  triggers: ConnectorTrigger[];
  actions: ConnectorAction[];
  documentationUrl?: string;
  tags: string[];
}
