import type { SocialGraphProvider, SocialProfile, SocialConnection, SocialGraphResult } from './types';
import { SocialGraphError } from './types';

export class XApiSocialGraphProvider implements SocialGraphProvider {
  readonly mode = 'production' as const;

  async getProfile(rawUsername: string): Promise<SocialProfile> {
    const data = await this.fetchData(rawUsername);
    return this.mapProfile(data.profile);
  }

  async getConnections(rawUsername: string): Promise<SocialConnection[]> {
    const data = await this.fetchData(rawUsername);
    return (data.connections || []).map(this.mapConnection);
  }

  async getGraph(rawUsername: string): Promise<SocialGraphResult> {
    const data = await this.fetchData(rawUsername);
    const hasConnections = Array.isArray(data.connections) && data.connections.length > 0;
    return {
      profile: this.mapProfile(data.profile),
      connections: (data.connections || []).map(this.mapConnection),
      dataStatus: data.dataStatus || (hasConnections ? 'OK' : 'NO_PUBLIC_INTERACTIONS'),
      reason: data.reason || (hasConnections ? undefined : 'No usable public X interactions were available from the syndication source.'),
      fetchedAt: data.fetchedAt || new Date().toISOString(),
      isMockData: false,
      isStale: !!data.isStale,
    };
  }


  private async fetchData(rawUsername: string) {
    const username = rawUsername.replace(/^@+/, '').trim();
    if (!username) {
      throw new SocialGraphError('Please enter a valid X username.', 'INVALID_HANDLE');
    }

    try {
      // Always use relative same-origin endpoint in production and development (handled by Vite dev proxy)
      const endpoint = `/api/x/users/${encodeURIComponent(username)}/connections`;
      const response = await fetch(endpoint);
      if (!response.ok) {
        let errJson = null;
        try {
          errJson = await response.json();
        } catch {
          // ignore parse error
        }
        const message = errJson?.error || 'Unable to build your Circle right now.';

        if (response.status === 404) {
          throw new SocialGraphError(message || "Couldn't find that X account.", 'NOT_FOUND');
        }
        if (response.status === 403) {
          throw new SocialGraphError(message || 'This X account is protected or unavailable.', 'UNAVAILABLE');
        }
        if (response.status === 429) {
          const rateLimitError = new SocialGraphError(
            errJson?.error || 'X public data is temporarily rate-limited.',
            'RATE_LIMITED'
          );
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (rateLimitError as any).retryAfter = errJson?.retryAfter || 60;
          throw rateLimitError;
        }
        throw new SocialGraphError(message, 'NETWORK_ERROR');
      }
      return await response.json();
    } catch (error) {
      if (error instanceof SocialGraphError) throw error;
      throw new SocialGraphError('Unable to reach Dlicom API. Please check your connection.', 'NETWORK_ERROR');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapProfile(profile: any): SocialProfile {
    return {
      id: profile.id || `x-${profile.username}`,
      username: profile.username,
      displayName: profile.displayName || profile.name || profile.username,
      avatar: profile.avatar || profile.profile_image_url || `https://unavatar.io/x/${encodeURIComponent(profile.username)}`,
      banner: profile.banner || profile.profile_banner_url,
      bio: profile.bio || profile.description || '',
      followersCount: profile.followersCount ?? profile.followers_count,
      followingCount: profile.followingCount ?? profile.friends_count,
      verified: !!(profile.verified || profile.is_blue_verified),
      location: profile.location,
      joinedDate: profile.joinedDate || profile.createdDate,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapConnection(conn: any): SocialConnection {
    const types: string[] = conn.interactionTypes || [];
    const score = conn.interactionScore ?? conn.connectionStrength ?? 50;
    const count = conn.interactionCount || 1;

    return {
      id: conn.id || `conn-${conn.username}`,
      username: conn.username,
      displayName: conn.displayName || conn.name || conn.username,
      avatar: conn.avatar || conn.profile_image_url || `https://unavatar.io/x/${encodeURIComponent(conn.username)}`,
      bio: conn.bio || (types.length ? `Observed X interactions: ${types.join(' · ')}` : ''),
      connectionStrength: score,
      interactionScore: score,
      interactionCount: count,
      interactionTypes: types,
      mutualFriendsCount: count,
      role: conn.role || (types.length ? `Interacted via ${types.join(' · ')}` : 'X Interaction'),
      category: conn.category || (types.includes('reply') ? 'friends' : types.includes('quote') ? 'creators' : 'builders'),
      tags: conn.tags || (types.length ? types.map((t: string) => `X ${t}`) : ['X Interaction']),
      recentActivity: conn.recentActivity || (types.length ? [
        {
          id: `act-${conn.username}`,
          action: `Active in recent interactions (${types.join(' · ')})`,
          timestamp: 'Recent',
          iconType: 'spark',
        }
      ] : undefined),
    };
  }
}
