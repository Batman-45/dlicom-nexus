import type { SocialConnection, SocialGraphProvider, SocialGraphResult, SocialProfile } from './types';
import { SocialGraphError } from './types';

/**
 * Production SocialGraphProvider that delegates all X API operations
 * to a secure backend / server-side endpoint.
 *
 * CRITICAL SECURITY: Never put X API keys or client secrets in frontend code.
 */
export class XBackendSocialGraphProvider implements SocialGraphProvider {
  readonly mode = 'production' as const;
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || import.meta.env.VITE_API_URL || '/api';
  }

  async getProfile(rawUsername: string): Promise<SocialProfile> {
    const username = rawUsername.replace(/^@+/, '').trim();
    if (!username) {
      throw new SocialGraphError('Please enter a valid X username.', 'INVALID_HANDLE');
    }

    try {
      const res = await fetch(`${this.baseUrl}/social-graph/profile?username=${encodeURIComponent(username)}`, {
        headers: { 'Accept': 'application/json' },
      });

      if (res.status === 404) {
        throw new SocialGraphError("Couldn't find that X account.", 'NOT_FOUND');
      }

      if (res.status === 429) {
        throw new SocialGraphError("X API rate limit reached. Please try again in a few moments.", 'RATE_LIMITED');
      }

      if (!res.ok) {
        throw new SocialGraphError("Unable to build your Circle right now.", 'UNAVAILABLE');
      }

      const data = await res.json();
      return data.profile;
    } catch (err: unknown) {
      if (err instanceof SocialGraphError) throw err;
      throw new SocialGraphError("Unable to build your Circle right now.", 'NETWORK_ERROR');
    }
  }

  async getConnections(rawUsername: string): Promise<SocialConnection[]> {
    const username = rawUsername.replace(/^@+/, '').trim();
    try {
      const res = await fetch(`${this.baseUrl}/social-graph/connections?username=${encodeURIComponent(username)}`, {
        headers: { 'Accept': 'application/json' },
      });

      if (res.status === 404) {
        throw new SocialGraphError("Couldn't find that X account.", 'NOT_FOUND');
      }

      if (!res.ok) {
        throw new SocialGraphError("Unable to build your Circle right now.", 'UNAVAILABLE');
      }

      const data = await res.json();
      return data.connections || [];
    } catch (err: unknown) {
      if (err instanceof SocialGraphError) throw err;
      throw new SocialGraphError("Unable to build your Circle right now.", 'NETWORK_ERROR');
    }
  }

  async getGraph(rawUsername: string): Promise<SocialGraphResult> {
    const username = rawUsername.replace(/^@+/, '').trim();
    if (!username) {
      throw new SocialGraphError('Please enter a valid X username.', 'INVALID_HANDLE');
    }

    try {
      const res = await fetch(`${this.baseUrl}/social-graph?username=${encodeURIComponent(username)}`, {
        headers: { 'Accept': 'application/json' },
      });

      if (res.status === 404) {
        throw new SocialGraphError("Couldn't find that X account.", 'NOT_FOUND');
      }

      if (res.status === 429) {
        throw new SocialGraphError("X API rate limit reached. Please try again in a few moments.", 'RATE_LIMITED');
      }

      if (!res.ok) {
        throw new SocialGraphError("Unable to build your Circle right now.", 'UNAVAILABLE');
      }

      const data = await res.json();
      return {
        profile: data.profile,
        connections: data.connections || [],
        stats: data.stats,
        isMockData: false,
        fetchedAt: new Date().toISOString(),
      };
    } catch (err: unknown) {
      if (err instanceof SocialGraphError) throw err;
      throw new SocialGraphError("Unable to build your Circle right now.", 'NETWORK_ERROR');
    }
  }
}
