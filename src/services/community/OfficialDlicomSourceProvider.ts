import { type CommunityMember, VerificationLevel } from './types.ts';
import { normalizeXUsername, isValidXUsername } from './registry.ts';

/**
 * Provider responsible for fetching dynamic official Dlicom community registries
 * from server-controlled endpoints (e.g. /api/community/members).
 */
export class OfficialDlicomSourceProvider {
  public readonly name = 'OfficialDlicomSourceProvider';
  private cachedMembers: CommunityMember[] | null = null;
  private lastFetchedAt = 0;
  private readonly ttl = 10 * 60 * 1000; // 10 minutes TTL

  /**
   * Fetches official community records from the server-side verified API.
   * If offline or unavailable, returns previously cached data or an empty array.
   */
  public async fetchOfficialMembers(): Promise<CommunityMember[]> {
    const now = Date.now();
    if (this.cachedMembers && now - this.lastFetchedAt < this.ttl) {
      return this.cachedMembers;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch('/api/community/members', {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        return this.cachedMembers || [];
      }

      const data = await response.json();
      if (!Array.isArray(data.members)) {
        return this.cachedMembers || [];
      }

      const validated: CommunityMember[] = [];
      for (const item of data.members) {
        const cleanHandle = normalizeXUsername(item.xHandle || item.xUsername || item.username);
        if (!isValidXUsername(cleanHandle)) continue;

        // Strict verification: only official, verified records accepted
        if (
          item.verificationStatus === 'VERIFIED' ||
          item.verificationLevel === VerificationLevel.OFFICIALLY_VERIFIED ||
          item.verificationLevel === VerificationLevel.OFFICIAL_COMMUNITY_ROLE
        ) {
          const officialUrl = item.officialSourceUrl || item.sourceUrl || 'https://dlicom.io/';
          const verifiedTime = item.verifiedAt || item.firstVerifiedAt || new Date().toISOString();
          const lastVerified = item.lastVerifiedAt || verifiedTime;

          validated.push({
            dliId: item.dliId || `DLI-DYNA-${cleanHandle.substring(0, 6).toUpperCase()}`,
            xHandle: cleanHandle,
            normalizedHandle: cleanHandle,
            xUsername: cleanHandle,
            displayName: item.displayName || cleanHandle,
            role: item.role || item.communityRole || 'Verified Member',
            verificationLevel: item.verificationLevel || VerificationLevel.OFFICIALLY_VERIFIED,
            verificationStatus: 'VERIFIED',
            sourceType: item.sourceType || 'OFFICIAL_WEBSITE',
            officialSourceUrl: officialUrl,
            sourceUrl: officialUrl,
            evidenceUrls: item.evidenceUrls || [officialUrl],
            evidenceSummary: item.evidenceSummary || item.evidence || 'Verified by official Dlicom registry server.',
            evidence: item.evidence || item.evidenceSummary || 'Verified by official Dlicom registry server.',
            sourceEvidence: item.evidence || 'Verified by official Dlicom registry server.',
            provenance: item.provenance || `Verified via dynamic registry server endpoint (${officialUrl}).`,
            confidenceScore: item.confidenceScore || 95,
            discoverySource: item.discoverySource || item.sourceTitle || 'Dlicom Dynamic Registry Server',
            sourceTitle: item.sourceTitle,
            firstVerifiedAt: verifiedTime,
            verifiedAt: verifiedTime,
            lastVerifiedAt: lastVerified,
            sourceFreshness: 'FRESH',
            status: item.status || 'ACTIVE',
            avatarUrl: item.avatarUrl || item.avatar,
            bio: item.bio,
            region: item.region,
          });
        }
      }

      if (validated.length > 0) {
        this.cachedMembers = validated;
        this.lastFetchedAt = now;
      }

      return this.cachedMembers || [];
    } catch {
      // Return previously verified cache on network error
      return this.cachedMembers || [];
    }
  }
}
