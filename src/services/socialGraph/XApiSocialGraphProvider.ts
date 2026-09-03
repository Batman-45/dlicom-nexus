import type { SocialGraphProvider, SocialProfile, SocialConnection, SocialGraphResult } from './types';
import { SocialGraphError } from './types';

export class XApiSocialGraphProvider implements SocialGraphProvider {
  readonly mode = 'production';
  private readonly proxyUrl = import.meta.env.VITE_API_PROXY_URL;

  async getProfile(username: string): Promise<SocialProfile> {
    const data = await this.fetchData(username);
    return this.mapProfile(data.profile);
  }

  async getConnections(username: string): Promise<SocialConnection[]> {
    const data = await this.fetchData(username);
    return [...data.following, ...data.followers].map(this.mapConnection);
  }

  async getGraph(username: string): Promise<SocialGraphResult> {
    const data = await this.fetchData(username);
    return {
      profile: this.mapProfile(data.profile),
      connections: [...data.following, ...data.followers].map(this.mapConnection),
      fetchedAt: new Date().toISOString(),
      isMockData: false,
    };
  }

  private async fetchData(username: string) {
    try {
      const response = await fetch(`${this.proxyUrl}/api/proxy/x/users/${username}/connections`);
      if (!response.ok) {
        if (response.status === 404) throw new SocialGraphError('User not found', 'NOT_FOUND');
        if (response.status === 402) throw new SocialGraphError('X API credits depleted — upgrade your X Developer plan to Basic or higher', 'UNAVAILABLE');
        if (response.status === 403) throw new SocialGraphError('Unavailable', 'UNAVAILABLE');
        if (response.status === 429) throw new SocialGraphError('Rate limited by X API — try again in a few minutes', 'RATE_LIMITED');
        if (response.status === 401) throw new SocialGraphError('X API authentication failed — check the Bearer token in server/.env', 'UNAVAILABLE');
        throw new SocialGraphError('API Error', 'NETWORK_ERROR');
      }
      return await response.json();
    } catch (error) {
      if (error instanceof SocialGraphError) throw error;
      throw new SocialGraphError('Failed to fetch data', 'NETWORK_ERROR');
    }
  }

  private mapProfile(profile: any): SocialProfile {
    return {
      id: profile.id,
      username: profile.username,
      displayName: profile.name,
      avatar: profile.profile_image_url,
      bio: profile.description || '',
    };
  }

  private mapConnection(connection: any): SocialConnection {
    return {
      id: connection.id,
      username: connection.username,
      displayName: connection.name,
      avatar: connection.profile_image_url,
      bio: connection.description || '',
    };
  }
}
