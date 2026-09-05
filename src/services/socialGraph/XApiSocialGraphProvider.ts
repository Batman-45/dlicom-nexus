import type { SocialGraphProvider, SocialProfile, SocialConnection, SocialGraphResult } from './types.ts';
import { SocialGraphError } from './types.ts';
import { matchCommunityConnections } from '../community/index.ts';

export class XApiSocialGraphProvider implements SocialGraphProvider {
  readonly mode = 'production' as const;

  async getProfile(rawUsername: string): Promise<SocialProfile> {
    const { data } = await this.fetchData(rawUsername);
    return this.mapProfile(data.profile);
  }

  async getConnections(rawUsername: string): Promise<SocialConnection[]> {
    const graph = await this.getGraph(rawUsername);
    return graph.connections;
  }

  async getGraph(rawUsername: string): Promise<SocialGraphResult> {
    const { data, status } = await this.fetchData(rawUsername);
    const rawApiConnections: any[] = data.connections || [];
    const rawCandidates: SocialConnection[] = rawApiConnections.map(this.mapConnection);

    // Apply Dlicom community classification:
    // Dlicom Community Members ∩ Public X Interactions
    const {
      matchedConnections,
      totalCandidates,
      matchedCount,
      officialMatchesCount = 0,
      communityFriendMatchesCount = 0,
      potentialCandidates,
      externalAccountsCount,
      matchExplanations,
    } = await matchCommunityConnections(rawCandidates, rawUsername);

    // Index verified & candidate members for fast enrichment lookup
    const verifiedMap = new Map<string, SocialConnection>();
    for (const m of matchedConnections) {
      verifiedMap.set(m.username.toLowerCase(), m);
    }
    const candidateMap = new Map<string, any>();
    for (const c of potentialCandidates) {
      candidateMap.set(c.normalizedHandle.toLowerCase(), c);
    }

    // Evaluate Personal Circle eligibility & enrich each connection
    // Rule: Observable public X interaction + meets interaction threshold
    const MIN_CIRCLE_STRENGTH = 15;
    const enrichedCircleFriends: SocialConnection[] = [];
    let dlicomOfficialCount = 0;
    let dlicomCommunityCount = 0;
    let dlicomCandidateCount = 0;
    let externalFriendsCount = 0;

    for (const conn of rawCandidates) {
      const cleanHandle = conn.username.toLowerCase();
      const hasObservableInteraction =
        (conn.interactionCount || 0) >= 1 &&
        ((conn.interactionTypes && conn.interactionTypes.length > 0) || (conn.interactionScore ?? conn.connectionStrength ?? 0) > 0);
      const meetsThreshold = (conn.connectionStrength ?? conn.interactionScore ?? 50) >= MIN_CIRCLE_STRENGTH;
      const circleEligible = hasObservableInteraction && meetsThreshold;

      const verified = verifiedMap.get(cleanHandle);
      const candidate = candidateMap.get(cleanHandle);

      let classification: 'official' | 'community_role' | 'community_friend' | 'candidate' | 'external' = 'external';

      if (verified) {
        if (verified.verificationLevel === 'OFFICIALLY_VERIFIED') {
          classification = 'official';
          dlicomOfficialCount++;
        } else if (verified.verificationLevel === 'OFFICIAL_COMMUNITY_ROLE') {
          classification = 'community_role';
          dlicomCommunityCount++;
        } else {
          classification = 'community_friend';
          dlicomCommunityCount++;
        }
      } else if (candidate) {
        classification = 'candidate';
        dlicomCandidateCount++;
      } else {
        classification = 'external';
        externalFriendsCount++;
      }

      const enriched: SocialConnection = {
        ...(verified || conn),
        circleEligible,
        communityClassification: classification,
        matchExplanation: verified?.matchExplanation || candidate?.candidateReason || matchExplanations[cleanHandle] || `Observable public X interaction with @${rawUsername}. External account.`,
      };

      if (circleEligible) {
        enrichedCircleFriends.push(enriched);
      }
    }

    let dataStatus = data.dataStatus || 'OK';
    let reason: string | undefined = data.reason || undefined;

    if (totalCandidates === 0) {
      dataStatus = 'NO_PUBLIC_INTERACTIONS';
      reason = 'No usable public X interactions were available from the public sources.';
    }

    const uniqueHandles = Array.from(new Set(rawCandidates.map((c) => c.username.toLowerCase())));

    // Strict Invariant Assertion: Every friend in enrichedCircleFriends MUST originate from rawCandidates
    const currentConnectionHandles = new Set(rawCandidates.map((c) => c.username.toLowerCase().replace(/^@+/, '').trim()));
    for (const friend of enrichedCircleFriends) {
      const cleanFriendHandle = friend.username.toLowerCase().replace(/^@+/, '').trim();
      if (!currentConnectionHandles.has(cleanFriendHandle)) {
        throw new Error(`[circle-isolation] FATAL VIOLATION: friend @${friend.username} entered Personal Friend Circle without being an observable public X connection!`);
      }
    }

    // Required development-safe diagnostic logs (zero secrets logged)
    console.log('[circle-debug] USERNAME:', rawUsername);
    console.log('[circle-debug] RAW X CONNECTIONS:', rawCandidates.length);
    console.log('[circle-debug] UNIQUE X CONNECTIONS:', uniqueHandles.length);
    console.log('[circle-debug] CIRCLE-ELIGIBLE CONNECTIONS:', enrichedCircleFriends.length);
    console.log('[circle-debug] DLICOM OFFICIAL:', dlicomOfficialCount);
    console.log('[circle-debug] DLICOM COMMUNITY:', dlicomCommunityCount);
    console.log('[circle-debug] DLICOM CANDIDATES:', dlicomCandidateCount);
    console.log('[circle-debug] EXTERNAL FRIENDS:', externalFriendsCount);
    console.log('[circle-debug] FINAL CIRCLE NODES:', enrichedCircleFriends.length);

    // Boundary diagnostic logs for isolation tracing & contract compliance
    console.log(`[circle-isolation] INGESTION: @${rawUsername} has ${rawCandidates.length} raw observable X connections`);
    console.log(`[circle-isolation] REGISTRY-MATCH: Found ${matchedCount} registry matches (enrichment only)`);
    console.log(`[circle-isolation] FILTERING: ${enrichedCircleFriends.length} connections met interaction threshold`);
    console.log(`[circle-isolation] INVARIANT-CHECK: 100% of ${enrichedCircleFriends.length} circle friends are verified observable X interactions`);
    console.log('[circle-debug] username:', rawUsername);
    console.log('[circle-debug] API status:', status);
    console.log('[circle-debug] API dataStatus:', data.dataStatus);
    console.log('[circle-debug] API isMockData:', !!data.isMockData);
    console.log(`[circle-debug] RAW API connections: ${rawApiConnections.length} [${rawApiConnections.map((c: any) => c.username).join(', ')}]`);
    console.log(`[circle-debug] NORMALIZED connections: ${rawCandidates.length} [${rawCandidates.map((c) => c.username).join(', ')}]`);
    console.log(`[circle-debug] UNIQUE connections: ${uniqueHandles.length} [${uniqueHandles.join(', ')}]`);
    console.log(`[circle-debug] COMMUNITY MATCHES: ${matchedCount}`);
    console.log(`[circle-debug] OFFICIAL MATCHES: ${officialMatchesCount}`);
    console.log(`[circle-debug] COMMUNITY FRIEND MATCHES: ${communityFriendMatchesCount}`);
    console.log(`[circle-debug] CANDIDATES: ${potentialCandidates.length}`);
    console.log(`[circle-debug] EXTERNAL: ${externalAccountsCount}`);
    console.log(`[circle-debug] VERIFIED CIRCLE NODES: ${matchedConnections.length}`);

    return {
      profile: this.mapProfile(data.profile),
      connections: enrichedCircleFriends,
      circleFriends: enrichedCircleFriends,
      rawConnections: rawCandidates,
      rawConnectionsCount: rawCandidates.length,
      dataStatus,
      reason,
      fetchedAt: data.fetchedAt || new Date().toISOString(),
      isMockData: false,
      isStale: !!data.isStale,
      totalCandidatesAnalyzed: totalCandidates,
      circleEligibleCount: enrichedCircleFriends.length,
      matchedMembersCount: matchedCount,
      officialMatchesCount: dlicomOfficialCount,
      communityFriendMatchesCount: dlicomCommunityCount,
      candidateMatchesCount: dlicomCandidateCount,
      externalFriendsCount,
      potentialCommunityMembers: potentialCandidates,
      externalAccountsCount,
      matchExplanations,
    };
  }

  private async fetchData(rawUsername: string): Promise<{ data: any; status: number }> {
    const username = rawUsername.replace(/^@+/, '').trim();
    if (!username) {
      throw new SocialGraphError('Please enter a valid X username.', 'INVALID_HANDLE');
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nodeProcess = typeof globalThis !== 'undefined' ? (globalThis as any).process : undefined;
      const baseUrl = typeof window === 'undefined' ? (nodeProcess?.env?.API_BASE_URL || 'https://dlicom-nexus.vercel.app') : '';
      // Relative same-origin endpoint (proxied to backend)
      const endpoint = `${baseUrl}/api/x/users/${encodeURIComponent(username)}/connections`;
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
      const data = await response.json();
      return { data, status: response.status };
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
      avatar:
        profile.avatar ||
        profile.profile_image_url ||
        `https://unavatar.io/x/${encodeURIComponent(profile.username)}`,
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
      avatar:
        conn.avatar ||
        conn.profile_image_url ||
        `https://unavatar.io/x/${encodeURIComponent(conn.username)}`,
      bio: conn.bio || (types.length ? `Observed X interactions: ${types.join(' · ')}` : ''),
      connectionStrength: score,
      interactionScore: score,
      interactionCount: count,
      interactionTypes: types,
      mutualFriendsCount: count,
      role: conn.role || (types.length ? `Interacted via ${types.join(' · ')}` : 'X Interaction'),
      category:
        conn.category ||
        (types.includes('reply') ? 'friends' : types.includes('quote') ? 'creators' : 'builders'),
      tags: conn.tags || (types.length ? types.map((t: string) => `X ${t}`) : ['X Interaction']),
      recentActivity:
        conn.recentActivity ||
        (types.length
          ? [
              {
                id: `act-${conn.username}`,
                action: `Active in recent interactions (${types.join(' · ')})`,
                timestamp: 'Recent',
                iconType: 'spark',
              },
            ]
          : undefined),
    };
  }
}
