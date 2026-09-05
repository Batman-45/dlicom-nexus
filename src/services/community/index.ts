import { DlicomCommunityProvider } from './DlicomCommunityProvider.ts';
import type { CommunityMemberProvider } from './CommunityMemberProvider.ts';
import { type CommunityMember, VerificationLevel } from './types.ts';
import type { SocialConnection } from '../socialGraph/types.ts';
import { normalizeHandle } from './engine.ts';
import { PublicEvidenceRegistry } from './registry.ts';

export * from './types.ts';
export * from './engine.ts';
export * from './registry.ts';
export * from './CommunityMemberProvider.ts';
export * from './OfficialDlicomSourceProvider.ts';
export * from './DlicomCommunityProvider.ts';
export * from './providers/CommunitySourceAdapter.ts';
export * from './providers/OfficialWebsiteProvider.ts';
export * from './providers/OfficialCommunityPageProvider.ts';
export * from './providers/OfficialAnnouncementProvider.ts';
export * from './providers/PublicEvidenceProvider.ts';
export * from './CommunityFriendEngine.ts';

let communityProviderInstance: CommunityMemberProvider | null = null;

export function getCommunityProvider(): CommunityMemberProvider {
  if (!communityProviderInstance) {
    communityProviderInstance = new DlicomCommunityProvider();
  }
  return communityProviderInstance;
}

/**
 * Deterministic Intersection Matching:
 * Observable Public X Interactions ∩ Verified Dlicom Community Registry
 *
 * Rules:
 * 1. Normalized exact match: normalizedXHandle === normalizedRegistryHandle
 * 2. Only OFFICIALLY_VERIFIED, OFFICIAL_COMMUNITY_ROLE, and COMMUNITY_FRIEND enter matchedConnections (Circle-eligible).
 * 3. COMMUNITY_CANDIDATE enters potentialCandidates (NEVER in main Circle).
 * 4. EXTERNAL_ACCOUNT is strictly counted as external and never enters Circle.
 * 5. Every Circle node is traceable with an explicit evidence attribution string.
 */
export async function matchCommunityConnections(
  candidates: SocialConnection[],
  targetUsername?: string,
  provider: CommunityMemberProvider = getCommunityProvider()
): Promise<{
  matchedConnections: SocialConnection[];
  totalCandidates: number;
  matchedCount: number;
  matchedCommunityMembers: CommunityMember[];
  potentialCandidates: CommunityMember[];
  externalAccountsCount: number;
  matchExplanations: Record<string, string>;
  officialMatchesCount: number;
  communityFriendMatchesCount: number;
}> {
  const verifiedMembers = await provider.getMembers();
  const verifiedMap = new Map<string, CommunityMember>();
  for (const m of verifiedMembers) {
    verifiedMap.set(m.normalizedHandle.toLowerCase(), m);
  }

  const registry = PublicEvidenceRegistry.getInstance();
  const knownCandidates = await registry.getCandidates();
  const candidateMap = new Map<string, CommunityMember>();
  for (const c of knownCandidates) {
    candidateMap.set(c.normalizedHandle.toLowerCase(), c);
  }

  const matchedConnections: SocialConnection[] = [];
  const matchedCommunityMembers: CommunityMember[] = [];
  const potentialCandidates: CommunityMember[] = [];
  const matchExplanations: Record<string, string> = {};
  let externalAccountsCount = 0;
  let officialMatchesCount = 0;
  let communityFriendMatchesCount = 0;

  for (const conn of candidates) {
    const cleanHandle = normalizeHandle(conn.username);
    if (!cleanHandle) continue;

    // Check if account is in authoritative verified registry
    const verifiedMember = verifiedMap.get(cleanHandle);

    if (
      verifiedMember &&
      (verifiedMember.verificationLevel === VerificationLevel.OFFICIALLY_VERIFIED ||
        verifiedMember.verificationLevel === VerificationLevel.OFFICIAL_COMMUNITY_ROLE ||
        verifiedMember.verificationLevel === VerificationLevel.COMMUNITY_FRIEND)
    ) {
      matchedCommunityMembers.push(verifiedMember);

      const interactionDesc = (conn.interactionTypes && conn.interactionTypes.length > 0)
        ? conn.interactionTypes.join(', ')
        : 'observed public activity';

      const targetRef = targetUsername ? `@${normalizeHandle(targetUsername)}` : 'the target account';
      const isFriend = verifiedMember.verificationLevel === VerificationLevel.COMMUNITY_FRIEND;

      if (isFriend) {
        communityFriendMatchesCount++;
      } else {
        officialMatchesCount++;
      }

      const explanation = isFriend
        ? `Matched because @${cleanHandle} interacted with ${targetRef} on X (${interactionDesc}) and has independent public evidence of Dlicom community participation through ${(verifiedMember.evidenceUrls || []).slice(0, 2).join(' and ') || verifiedMember.officialSourceUrl}.`
        : `Matched because @${cleanHandle} interacted with ${targetRef} on X (${interactionDesc}) and @${cleanHandle} is independently verified as a Dlicom ${verifiedMember.role} (${verifiedMember.dliId}) via ${verifiedMember.officialSourceUrl}.`;
      
      matchExplanations[cleanHandle] = explanation;

      // Enrich connection with verified Dlicom metadata
      matchedConnections.push({
        ...conn,
        dliId: verifiedMember.dliId,
        verificationLevel: verifiedMember.verificationLevel,
        evidenceSummary: verifiedMember.evidenceSummary,
        officialSourceUrl: verifiedMember.officialSourceUrl,
        evidenceUrls: verifiedMember.evidenceUrls,
        matchExplanation: explanation,
        confidenceScore: verifiedMember.confidenceScore,
        sourceFreshness: verifiedMember.sourceFreshness,
        displayName: conn.displayName || verifiedMember.displayName,
        avatar: conn.avatar || verifiedMember.avatarUrl || `https://unavatar.io/x/${cleanHandle}`,
        role: isFriend
          ? `Dlicom Community Friend (${verifiedMember.dliId})`
          : `${verifiedMember.role} · Dlicom (${verifiedMember.dliId})`,
        category:
          verifiedMember.role === 'Core Team' || verifiedMember.role === 'Regional Lead'
            ? 'builders'
            : verifiedMember.role === 'Community Manager' || verifiedMember.role === 'MOD'
            ? 'communities'
            : 'friends',
        tags: [
          isFriend ? 'Dlicom Community Friend' : 'Verified Dlicom Community',
          verifiedMember.role,
          verifiedMember.dliId,
          `${verifiedMember.confidenceScore}% Confidence`,
          ...(conn.tags || []),
        ],
        bio: verifiedMember.bio || conn.bio,
      });
      continue;
    }

    // Check if account is in known candidate registry or has public bio evidence
    const existingCandidate = candidateMap.get(cleanHandle);
    if (existingCandidate) {
      potentialCandidates.push(existingCandidate);
      matchExplanations[cleanHandle] = `Candidate account: @${cleanHandle} interacted on X and holds public Candidate status (${existingCandidate.candidateReason || existingCandidate.evidenceSummary}). Excluded from primary Circle constellation.`;
      continue;
    }

    // Evaluate on-the-fly public evidence for this interaction candidate
    const evaluated = registry.evaluateCandidate({
      username: conn.username,
      displayName: conn.displayName,
      bio: conn.bio,
      avatar: conn.avatar,
    });

    if (evaluated.verificationLevel === VerificationLevel.COMMUNITY_CANDIDATE) {
      potentialCandidates.push(evaluated);
      matchExplanations[cleanHandle] = `Candidate account: @${cleanHandle} bio asserts Dlicom affiliation. Excluded from primary Circle constellation pending official core roster publication.`;
    } else {
      externalAccountsCount++;
      matchExplanations[cleanHandle] = `Filtered external account: @${cleanHandle} interacted on X, but lacks public evidence of Dlicom community membership. Excluded.`;
    }
  }

  return {
    matchedConnections,
    totalCandidates: candidates.length,
    matchedCount: matchedConnections.length,
    matchedCommunityMembers,
    potentialCandidates,
    externalAccountsCount,
    matchExplanations,
    officialMatchesCount,
    communityFriendMatchesCount,
  };
}
