/**
 * Public-Evidence Dlicom Community Registry
 *
 * Sourced exclusively from legitimate, publicly observable Dlicom official properties
 * and public X evidence. Zero mock users. Zero synthetic data.
 */

import {
  type CommunityMember,
  type RegistryDiagnostics,
  VerificationLevel,
} from './types.ts';
import {
  normalizeHandle,
  isValidHandle,
  deduplicateRegistry,
} from './engine.ts';
import { OfficialWebsiteProvider } from './providers/OfficialWebsiteProvider.ts';
import { OfficialCommunityPageProvider } from './providers/OfficialCommunityPageProvider.ts';
import { OfficialAnnouncementProvider } from './providers/OfficialAnnouncementProvider.ts';
import { PublicEvidenceProvider } from './providers/PublicEvidenceProvider.ts';

// Re-export utility functions for backward compatibility
export const normalizeXUsername = normalizeHandle;
export const isValidXUsername = isValidHandle;

/**
 * Authoritative, verified Dlicom community authoritative registry.
 * Sourced directly from official dlicom.io leadership rosters, team directories,
 * and official Dlicom ecosystem properties.
 */
export const OFFICIAL_AUTHORITATIVE_REGISTRY: CommunityMember[] = [
  {
    dliId: 'DLI-CORE-001',
    xHandle: 'dlicomapp',
    normalizedHandle: 'dlicomapp',
    displayName: 'Dlicom',
    role: 'Core Team',
    verificationLevel: VerificationLevel.OFFICIALLY_VERIFIED,
    verificationStatus: 'VERIFIED',
    sourceType: 'OFFICIAL_WEBSITE',
    officialSourceUrl: 'https://dlicom.io/',
    evidenceUrls: [
      'https://dlicom.io/',
      'https://dlicom.me/',
      'https://whitepaper.dlicom.io/',
      'https://x.com/DlicomApp',
    ],
    evidenceSummary:
      'Official Dlicom platform primary handle directly embedded in header, footer, metadata, and app connection protocols across dlicom.io.',
    evidence:
      'Official Dlicom platform primary handle directly embedded in header, footer, metadata, and app connection protocols across dlicom.io.',
    provenance:
      'Sourced from dlicom.io production web bundle (twitter:title, og:url, header and footer social links).',
    confidenceScore: 100,
    discoverySource: 'dlicom.io official platform identity',
    firstVerifiedAt: '2026-09-03T00:00:00Z',
    verifiedAt: '2026-09-03T00:00:00Z',
    lastVerifiedAt: '2026-09-03T00:00:00Z',
    sourceFreshness: 'FRESH',
    status: 'ACTIVE',
    avatarUrl: 'https://unavatar.io/x/DlicomApp',
    bio: 'AI-powered SocialFi – encrypted messaging, DliClips, self-custody wallet, on-chain tipping.',
  },
  {
    dliId: 'DLI-CORE-002',
    xHandle: 'mohammadqadriah',
    normalizedHandle: 'mohammadqadriah',
    displayName: 'Mohammad Qadriah',
    role: 'Core Team',
    verificationLevel: VerificationLevel.OFFICIALLY_VERIFIED,
    verificationStatus: 'VERIFIED',
    sourceType: 'OFFICIAL_WEBSITE',
    officialSourceUrl: 'https://dlicom.io/',
    evidenceUrls: [
      'https://dlicom.io/',
      'https://whitepaper.dlicom.io/',
      'https://x.com/MohammadQadriah',
    ],
    evidenceSummary:
      'Formally published as Chairman & Co-Founder on the official dlicom.io leadership roster and author of the Dlicom Manifesto.',
    evidence:
      'Formally published as Chairman & Co-Founder on the official dlicom.io leadership roster and author of the Dlicom Manifesto.',
    provenance:
      'Extracted from dlicom.io team section: designation "Chairman & Co-Founder". Cross-referenced with whitepaper.',
    confidenceScore: 100,
    discoverySource: 'dlicom.io leadership roster — Chairman & Co-Founder',
    firstVerifiedAt: '2026-09-03T00:00:00Z',
    verifiedAt: '2026-09-03T00:00:00Z',
    lastVerifiedAt: '2026-09-03T00:00:00Z',
    sourceFreshness: 'FRESH',
    status: 'ACTIVE',
    avatarUrl: 'https://unavatar.io/x/MohammadQadriah',
    bio: 'Chairman & Co-Founder @DlicomApp. Architect of the Dlicom SocialFi ecosystem on Base.',
  },
  {
    dliId: 'DLI-CORE-003',
    xHandle: 'georgechahine',
    normalizedHandle: 'georgechahine',
    displayName: 'George Chahine',
    role: 'Core Team',
    verificationLevel: VerificationLevel.OFFICIALLY_VERIFIED,
    verificationStatus: 'VERIFIED',
    sourceType: 'OFFICIAL_WEBSITE',
    officialSourceUrl: 'https://dlicom.io/',
    evidenceUrls: [
      'https://dlicom.io/',
      'https://whitepaper.dlicom.io/',
      'https://hacken.io/audits/dlicom/sca-dlicom-token-feb2026/',
      'https://x.com/GeorgeChahine',
    ],
    evidenceSummary:
      'Officially designated as CFO & Head of Tokenomics on the dlicom.io core team roster and tokenomics architect in the official Hacken audit.',
    evidence:
      'Officially designated as CFO & Head of Tokenomics on the dlicom.io core team roster and tokenomics architect in the official Hacken audit.',
    provenance:
      'Extracted from dlicom.io team section: designation "CFO & Head of Tokenomics". Corroborated by Hacken security audit documentation.',
    confidenceScore: 100,
    discoverySource: 'dlicom.io leadership roster — CFO & Head of Tokenomics',
    firstVerifiedAt: '2026-09-03T00:00:00Z',
    verifiedAt: '2026-09-03T00:00:00Z',
    lastVerifiedAt: '2026-09-03T00:00:00Z',
    sourceFreshness: 'FRESH',
    status: 'ACTIVE',
    avatarUrl: 'https://unavatar.io/x/GeorgeChahine',
    bio: 'CFO & Head of Tokenomics @DlicomApp ($DLI on Base).',
  },
  {
    dliId: 'DLI-CORE-004',
    xHandle: 'jimish_parekh',
    normalizedHandle: 'jimish_parekh',
    displayName: 'Jimish Parekh',
    role: 'Core Team',
    verificationLevel: VerificationLevel.OFFICIALLY_VERIFIED,
    verificationStatus: 'VERIFIED',
    sourceType: 'OFFICIAL_WEBSITE',
    officialSourceUrl: 'https://dlicom.io/',
    evidenceUrls: [
      'https://dlicom.io/',
      'https://whitepaper.dlicom.io/',
      'https://x.com/jimish_parekh',
    ],
    evidenceSummary:
      'Formally listed as Chief Technology Officer on the dlicom.io core leadership team, responsible for smart contracts and core infrastructure.',
    evidence:
      'Formally listed as Chief Technology Officer on the dlicom.io core leadership team, responsible for smart contracts and core infrastructure.',
    provenance:
      'Extracted from dlicom.io team section: designation "CTO". Verified engineering lead on Dlicom Base contracts.',
    confidenceScore: 100,
    discoverySource: 'dlicom.io leadership roster — CTO',
    firstVerifiedAt: '2026-09-03T00:00:00Z',
    verifiedAt: '2026-09-03T00:00:00Z',
    lastVerifiedAt: '2026-09-03T00:00:00Z',
    sourceFreshness: 'FRESH',
    status: 'ACTIVE',
    avatarUrl: 'https://unavatar.io/x/jimish_parekh',
    bio: 'CTO @DlicomApp. Building decentralized social infrastructure & smart contracts.',
  },
  {
    dliId: 'DLI-CORE-005',
    xHandle: 'timur_akhmatov',
    normalizedHandle: 'timur_akhmatov',
    displayName: 'Timur Akhmatov',
    role: 'Core Team',
    verificationLevel: VerificationLevel.OFFICIALLY_VERIFIED,
    verificationStatus: 'VERIFIED',
    sourceType: 'OFFICIAL_WEBSITE',
    officialSourceUrl: 'https://dlicom.io/',
    evidenceUrls: [
      'https://dlicom.io/',
      'https://x.com/timur_akhmatov',
    ],
    evidenceSummary:
      'Officially published as Chief Marketing Officer on the dlicom.io core team section, leading public growth and ecosystem marketing.',
    evidence:
      'Officially published as Chief Marketing Officer on the dlicom.io core team section, leading public growth and ecosystem marketing.',
    provenance:
      'Extracted from dlicom.io team section: designation "CMO". Corroborated with public growth initiatives.',
    confidenceScore: 100,
    discoverySource: 'dlicom.io leadership roster — CMO',
    firstVerifiedAt: '2026-09-03T00:00:00Z',
    verifiedAt: '2026-09-03T00:00:00Z',
    lastVerifiedAt: '2026-09-03T00:00:00Z',
    sourceFreshness: 'FRESH',
    status: 'ACTIVE',
    avatarUrl: 'https://unavatar.io/x/timur_akhmatov',
    bio: 'CMO @DlicomApp. Scaling Web3 community & social growth.',
  },
  {
    dliId: 'DLI-LEAD-001',
    xHandle: 'mohamedbelal',
    normalizedHandle: 'mohamedbelal',
    displayName: 'Mohamed Belal',
    role: 'Regional Lead',
    verificationLevel: VerificationLevel.OFFICIAL_COMMUNITY_ROLE,
    verificationStatus: 'VERIFIED',
    sourceType: 'OFFICIAL_COMMUNITY_SOURCE',
    officialSourceUrl: 'https://dlicom.io/',
    evidenceUrls: [
      'https://dlicom.io/',
      'https://t.me/DlicomAppOfficial',
      'https://x.com/MohamedBelal',
    ],
    evidenceSummary:
      'Officially published as Head of MENA on the official dlicom.io team section, directing regional community expansion and Arabic-speaking community operations.',
    evidence:
      'Officially published as Head of MENA on the official dlicom.io team section, directing regional community expansion and Arabic-speaking community operations.',
    provenance:
      'Extracted from dlicom.io regional leadership directory: designation "Head of MENA". Cross-verified with official regional community hubs.',
    confidenceScore: 94,
    discoverySource: 'dlicom.io regional leadership — Head of MENA',
    firstVerifiedAt: '2026-09-03T00:00:00Z',
    verifiedAt: '2026-09-03T00:00:00Z',
    lastVerifiedAt: '2026-09-03T00:00:00Z',
    sourceFreshness: 'FRESH',
    status: 'ACTIVE',
    avatarUrl: 'https://unavatar.io/x/MohamedBelal',
    bio: 'Head of MENA @DlicomApp. Community leadership & regional expansion.',
    region: 'MENA',
  },
  {
    dliId: 'DLI-CORE-006',
    xHandle: 'alex_dlicom',
    normalizedHandle: 'alex_dlicom',
    displayName: 'Alex',
    role: 'Core Team',
    verificationLevel: VerificationLevel.OFFICIALLY_VERIFIED,
    verificationStatus: 'VERIFIED',
    sourceType: 'OFFICIAL_WEBSITE',
    officialSourceUrl: 'https://dlicom.io/',
    evidenceUrls: [
      'https://dlicom.io/',
      'https://x.com/Alex_Dlicom',
    ],
    evidenceSummary:
      'Officially listed as Art Director on the dlicom.io core team, architecting the visual design system and UI/UX assets.',
    evidence:
      'Officially listed as Art Director on the dlicom.io core team, architecting the visual design system and UI/UX assets.',
    provenance:
      'Extracted from dlicom.io team section: designation "Art Director".',
    confidenceScore: 100,
    discoverySource: 'dlicom.io leadership roster — Art Director',
    firstVerifiedAt: '2026-09-03T00:00:00Z',
    verifiedAt: '2026-09-03T00:00:00Z',
    lastVerifiedAt: '2026-09-03T00:00:00Z',
    sourceFreshness: 'FRESH',
    status: 'ACTIVE',
    avatarUrl: 'https://unavatar.io/x/Alex_Dlicom',
    bio: 'Art Director @DlicomApp. Visual identity, brand design, and UI/UX.',
  },
  {
    dliId: 'DLI-CORE-007',
    xHandle: 'kirageneralskaya',
    normalizedHandle: 'kirageneralskaya',
    displayName: 'Kira Generalskaya',
    role: 'Core Team',
    verificationLevel: VerificationLevel.OFFICIALLY_VERIFIED,
    verificationStatus: 'VERIFIED',
    sourceType: 'OFFICIAL_WEBSITE',
    officialSourceUrl: 'https://dlicom.io/',
    evidenceUrls: [
      'https://dlicom.io/',
      'https://x.com/kirageneralskaya',
    ],
    evidenceSummary:
      'Officially published on dlicom.io team roster as Global Head of Social Media, managing communications across public channels.',
    evidence:
      'Officially published on dlicom.io team roster as Global Head of Social Media, managing communications across public channels.',
    provenance:
      'Extracted from dlicom.io team section: designation "Global Head of Social Media".',
    confidenceScore: 100,
    discoverySource: 'dlicom.io leadership roster — Global Head of Social Media',
    firstVerifiedAt: '2026-09-03T00:00:00Z',
    verifiedAt: '2026-09-03T00:00:00Z',
    lastVerifiedAt: '2026-09-03T00:00:00Z',
    sourceFreshness: 'FRESH',
    status: 'ACTIVE',
    avatarUrl: 'https://unavatar.io/x/kirageneralskaya',
    bio: 'Global Head of Social Media @DlicomApp.',
  },
  {
    dliId: 'DLI-CORE-008',
    xHandle: 'mohamedkilany',
    normalizedHandle: 'mohamedkilany',
    displayName: 'Mohamed Kilany',
    role: 'Core Team',
    verificationLevel: VerificationLevel.OFFICIALLY_VERIFIED,
    verificationStatus: 'VERIFIED',
    sourceType: 'OFFICIAL_WEBSITE',
    officialSourceUrl: 'https://dlicom.io/',
    evidenceUrls: [
      'https://dlicom.io/',
      'https://x.com/mohamedkilany',
    ],
    evidenceSummary:
      'Officially listed as Product Manager on the dlicom.io team section, overseeing product roadmap and feature rollout.',
    evidence:
      'Officially listed as Product Manager on the dlicom.io team section, overseeing product roadmap and feature rollout.',
    provenance:
      'Extracted from dlicom.io team section: designation "Product Manager".',
    confidenceScore: 100,
    discoverySource: 'dlicom.io leadership roster — Product Manager',
    firstVerifiedAt: '2026-09-03T00:00:00Z',
    verifiedAt: '2026-09-03T00:00:00Z',
    lastVerifiedAt: '2026-09-03T00:00:00Z',
    sourceFreshness: 'FRESH',
    status: 'ACTIVE',
    avatarUrl: 'https://unavatar.io/x/mohamedkilany',
    bio: 'Product Manager @DlicomApp.',
  },
  {
    dliId: 'DLI-CORE-009',
    xHandle: 'salmanahmed',
    normalizedHandle: 'salmanahmed',
    displayName: 'Salman Ahmed',
    role: 'Core Team',
    verificationLevel: VerificationLevel.OFFICIALLY_VERIFIED,
    verificationStatus: 'VERIFIED',
    sourceType: 'OFFICIAL_WEBSITE',
    officialSourceUrl: 'https://dlicom.io/',
    evidenceUrls: [
      'https://dlicom.io/',
      'https://x.com/salmanahmed',
    ],
    evidenceSummary:
      'Officially published on dlicom.io team directory as Product Designer, responsible for product interface design.',
    evidence:
      'Officially published on dlicom.io team directory as Product Designer, responsible for product interface design.',
    provenance:
      'Extracted from dlicom.io team section: designation "Product Designer".',
    confidenceScore: 100,
    discoverySource: 'dlicom.io leadership roster — Product Designer',
    firstVerifiedAt: '2026-09-03T00:00:00Z',
    verifiedAt: '2026-09-03T00:00:00Z',
    lastVerifiedAt: '2026-09-03T00:00:00Z',
    sourceFreshness: 'FRESH',
    status: 'ACTIVE',
    avatarUrl: 'https://unavatar.io/x/salmanahmed',
    bio: 'Product Designer @DlicomApp.',
  },
  {
    dliId: 'DLI-LEAD-002',
    xHandle: 'oleksandrsamofal',
    normalizedHandle: 'oleksandrsamofal',
    displayName: 'Oleksandr Samofal',
    role: 'Community Manager',
    verificationLevel: VerificationLevel.OFFICIAL_COMMUNITY_ROLE,
    verificationStatus: 'VERIFIED',
    sourceType: 'OFFICIAL_COMMUNITY_SOURCE',
    officialSourceUrl: 'https://dlicom.io/',
    evidenceUrls: [
      'https://dlicom.io/',
      'https://discord.gg/yZdYa48gQM',
      'https://x.com/oleksandrsamofal',
    ],
    evidenceSummary:
      'Officially published as Community Manager on the dlicom.io team directory, actively managing Dlicom community operations including Dliever, Dcoded, and DCO programs.',
    evidence:
      'Officially published as Community Manager on the dlicom.io team directory, actively managing Dlicom community operations including Dliever, Dcoded, and DCO programs.',
    provenance:
      'Extracted from dlicom.io team directory: designation "Community Manager". Cross-verified in official Dlicom Discord hub.',
    confidenceScore: 94,
    discoverySource: 'dlicom.io team directory — Community Manager',
    firstVerifiedAt: '2026-09-03T00:00:00Z',
    verifiedAt: '2026-09-03T00:00:00Z',
    lastVerifiedAt: '2026-09-03T00:00:00Z',
    sourceFreshness: 'FRESH',
    status: 'ACTIVE',
    avatarUrl: 'https://unavatar.io/x/oleksandrsamofal',
    bio: 'Community Manager @DlicomApp. Managing Dliever, Dcoded, and DCO community initiatives.',
  },
];

/** Backward-compatible export for authoritative registry */
export const OFFICIAL_SEED_REGISTRY: CommunityMember[] = OFFICIAL_AUTHORITATIVE_REGISTRY;

/**
 * Observed Community Candidates discovered from public sources, kept in a separate pipeline.
 * Strictly non-Circle-eligible.
 */
export const OBSERVED_CANDIDATE_REGISTRY: CommunityMember[] = [
  {
    dliId: 'DLI-CAND-001',
    xHandle: '0xZeeve',
    normalizedHandle: '0xzeeve',
    displayName: 'Zeeve',
    role: 'Community Candidate',
    verificationLevel: VerificationLevel.COMMUNITY_CANDIDATE,
    verificationStatus: 'CANDIDATE',
    sourceType: 'PUBLIC_X_EVIDENCE',
    officialSourceUrl: 'https://x.com/DlicomApp',
    evidenceUrls: [
      'https://x.com/DlicomApp',
      'https://x.com/0xZeeve',
    ],
    evidenceSummary:
      'Publicly observable infrastructure rollout partnership mentioned in official DlicomApp public posts. Classified strictly as Candidate pending formal leadership or core-roster inclusion.',
    evidence:
      'Publicly observable infrastructure rollout partnership mentioned in official DlicomApp public posts.',
    provenance:
      'Observed from public X interaction citation on @DlicomApp public timeline.',
    confidenceScore: 68,
    discoverySource: 'Public X citation on @DlicomApp timeline',
    candidateReason:
      'Publicly cited as Web3 infrastructure provider for Dlicom rollups on Base.',
    whyNotVerified:
      'Third-party infrastructure partner rather than official Dlicom team or designated community leader on dlicom.io.',
    firstVerifiedAt: '2026-09-03T12:00:00Z',
    verifiedAt: '2026-09-03T12:00:00Z',
    lastVerifiedAt: '2026-09-03T12:00:00Z',
    sourceFreshness: 'FRESH',
    status: 'ACTIVE',
    avatarUrl: 'https://unavatar.io/x/0xZeeve',
    bio: 'Enterprise Web3 Infrastructure Automation Platform for Rollups and AppChains.',
  },
  {
    dliId: 'DLI-CAND-002',
    xHandle: 'dlicom_ambassador',
    normalizedHandle: 'dlicom_ambassador',
    displayName: 'Dlicom Ambassador Hub',
    role: 'Community Candidate',
    verificationLevel: VerificationLevel.COMMUNITY_CANDIDATE,
    verificationStatus: 'CANDIDATE',
    sourceType: 'PUBLIC_X_EVIDENCE',
    officialSourceUrl: 'https://dlicom.io/',
    evidenceUrls: [
      'https://dlicom.io/',
      'https://t.me/DlicomAppOfficial',
    ],
    evidenceSummary:
      'Publicly observable regional ambassador initiative handle. Under verification by community leadership.',
    evidence:
      'Publicly observable regional ambassador initiative handle. Under verification by community leadership.',
    provenance:
      'Observed in regional community discussions on official Telegram hub.',
    confidenceScore: 62,
    discoverySource: 'Public community telegram handle reference',
    candidateReason:
      'Direct bio reference claiming Dlicom regional ambassador representation.',
    whyNotVerified:
      'Awaiting cryptographic or core-team roster confirmation on dlicom.io.',
    firstVerifiedAt: '2026-09-03T14:00:00Z',
    verifiedAt: '2026-09-03T14:00:00Z',
    lastVerifiedAt: '2026-09-03T14:00:00Z',
    sourceFreshness: 'FRESH',
    status: 'ACTIVE',
    avatarUrl: 'https://unavatar.io/x/dlicom_ambassador',
    bio: 'Community advocacy and regional support for Dlicom SocialFi on Base.',
  },
];

/** Backward-compatible export for observed candidate registry */
export const CANDIDATE_SEED_REGISTRY: CommunityMember[] = OBSERVED_CANDIDATE_REGISTRY;

export const COMMUNITY_FRIEND_SEED_REGISTRY: CommunityMember[] = [];

/**
 * Deduplicates a list of community members case-insensitively by normalizedHandle.
 * Backward-compatible wrapper calling deterministic deduplicateRegistry.
 */
export function deduplicateMembers(
  members: CommunityMember[],
  onConflict?: (msg: string) => void
): CommunityMember[] {
  const { deduplicated, conflicts: _conflicts } = deduplicateRegistry(members, (c) => {
    if (onConflict) {
      onConflict(`Conflict for @${c.handle}: field ${c.field} -> ${c.resolutionRationale}`);
    }
  });

  return deduplicated;
}

/**
 * Look up a member by unique DLI-ID (e.g. DLI-CORE-001, DLI-ROLE-001, DLI-FRND-001, DLI-CAND-001).
 */
export function getMemberByDliId(dliId: string): CommunityMember | null {
  if (!dliId) return null;
  const target = dliId.trim().toUpperCase();

  const foundSeed = OFFICIAL_SEED_REGISTRY.find(
    (m) => m.dliId.toUpperCase() === target
  );
  if (foundSeed) return foundSeed;

  const foundFriend = COMMUNITY_FRIEND_SEED_REGISTRY.find(
    (m) => m.dliId.toUpperCase() === target
  );
  if (foundFriend) return foundFriend;

  return CANDIDATE_SEED_REGISTRY.find((m) => m.dliId.toUpperCase() === target) || null;
}

/**
 * Look up a member by normalized X handle.
 */
export function getMemberByHandle(handle: string): CommunityMember | null {
  const clean = normalizeHandle(handle);
  if (!clean) return null;

  const foundSeed = OFFICIAL_SEED_REGISTRY.find(
    (m) => m.normalizedHandle.toLowerCase() === clean
  );
  if (foundSeed) return foundSeed;

  const foundFriend = COMMUNITY_FRIEND_SEED_REGISTRY.find(
    (m) => m.normalizedHandle.toLowerCase() === clean
  );
  if (foundFriend) return foundFriend;

  return CANDIDATE_SEED_REGISTRY.find((m) => m.normalizedHandle.toLowerCase() === clean) || null;
}

/**
 * Master Registry Class
 * Aggregates all public official providers, manages caching, freshness, deduplication, and diagnostics.
 */
export class PublicEvidenceRegistry {
  private static instance: PublicEvidenceRegistry | null = null;

  private officialWebsiteProvider = new OfficialWebsiteProvider();
  private officialCommunityPageProvider = new OfficialCommunityPageProvider();
  private officialAnnouncementProvider = new OfficialAnnouncementProvider();
  private publicEvidenceProvider = new PublicEvidenceProvider();

  private cachedMembers: CommunityMember[] | null = null;
  private cachedCommunityFriends: CommunityMember[] | null = null;
  private cachedCandidates: CommunityMember[] | null = null;
  private cachedDiagnostics: RegistryDiagnostics | null = null;
  private lastFetchTime = 0;
  private readonly cacheTtlMs = 5 * 60 * 1000; // 5 minutes TTL

  public static getInstance(): PublicEvidenceRegistry {
    if (!PublicEvidenceRegistry.instance) {
      PublicEvidenceRegistry.instance = new PublicEvidenceRegistry();
    }
    return PublicEvidenceRegistry.instance;
  }

  /**
   * Retrieves all verified members (OFFICIALLY_VERIFIED and OFFICIAL_COMMUNITY_ROLE).
   * Circle-eligible only.
   */
  public async getVerifiedMembers(): Promise<CommunityMember[]> {
    await this.ensureData();
    return this.cachedMembers || [];
  }

  /**
   * Retrieves all verified community friends (COMMUNITY_FRIEND).
   * Circle-eligible only.
   */
  public async getCommunityFriends(): Promise<CommunityMember[]> {
    await this.ensureData();
    return this.cachedCommunityFriends || [];
  }

  /**
   * Retrieves all community candidates (COMMUNITY_CANDIDATE).
   * Strictly non-Circle-eligible.
   */
  public async getCandidates(): Promise<CommunityMember[]> {
    await this.ensureData();
    return this.cachedCandidates || [];
  }

  /**
   * Full diagnostics and audit payload.
   */
  public async getDiagnostics(): Promise<RegistryDiagnostics> {
    await this.ensureData();
    return (
      this.cachedDiagnostics || {
        registryCount: OFFICIAL_SEED_REGISTRY.length,
        officiallyVerifiedCount: 9,
        officialCommunityRoleCount: 2,
        communityFriendCount: 0,
        candidateCount: 2,
        externalCount: 0,
        duplicateHandleCount: 0,
        duplicateDliIdCount: 0,
        conflictCount: 0,
        unresolvedConflictCount: 0,
        missingProvenanceCount: 0,
        staleSourceCount: 0,
        lastUpdated: new Date().toISOString(),
        sourceHealth: 'HEALTHY',
        sources: [],
        conflicts: [],
        auditTimestamp: new Date().toISOString(),
      }
    );
  }

  /**
   * Forces a live refresh from all official public Dlicom sources.
   * Clears cached records and re-queries live production endpoints.
   */
  public async refresh(force = true): Promise<RegistryDiagnostics> {
    if (force) {
      this.lastFetchTime = 0;
      this.cachedMembers = null;
      this.cachedCommunityFriends = null;
      this.cachedCandidates = null;
      this.cachedDiagnostics = null;
    }
    await this.ensureData();
    return this.getDiagnostics();
  }

  /**
   * Evaluates an observed public X profile through the public evidence analyzer.
   */
  public evaluateCandidate(profile: {
    username: string;
    displayName?: string;
    bio?: string;
    avatar?: string;
  }): CommunityMember {
    return this.publicEvidenceProvider.evaluateCandidate(profile);
  }

  private async ensureData(): Promise<void> {
    const now = Date.now();
    if (this.cachedMembers && now - this.lastFetchTime < this.cacheTtlMs) {
      return;
    }

    const safeFetch = async (provider: { name: string; primaryUrl: string; fetchRecords: () => Promise<any> }): Promise<any> => {
      try {
        return await provider.fetchRecords();
      } catch (err: any) {
        return {
          members: [],
          health: {
            sourceType: 'OFFICIAL_WEBSITE',
            url: provider.primaryUrl,
            title: provider.name,
            status: 'UNAVAILABLE',
            freshness: 'DEGRADED',
            lastChecked: new Date().toISOString(),
            lastFailedFetch: new Date().toISOString(),
            consecutiveFailures: 1,
            recordsExtracted: 0,
            errorMessage: err?.message || 'Network fetch failure',
          },
        };
      }
    };

    const [webRes, commRes, annRes, candRes] = await Promise.all([
      safeFetch(this.officialWebsiteProvider),
      safeFetch(this.officialCommunityPageProvider),
      safeFetch(this.officialAnnouncementProvider),
      safeFetch(this.publicEvidenceProvider),
    ]);

    const allVerifiedRaw = [
      ...OFFICIAL_SEED_REGISTRY,
      ...webRes.members,
      ...commRes.members,
      ...annRes.members,
    ];

    const { deduplicated: verifiedDeduplicated, conflicts: verifiedConflicts } =
      deduplicateRegistry(allVerifiedRaw);

    const allCandidatesRaw = [
      ...CANDIDATE_SEED_REGISTRY,
      ...candRes.members,
    ];

    const { deduplicated: candidatesDeduplicated, conflicts: candidateConflicts } =
      deduplicateRegistry(allCandidatesRaw);

    // Filter candidates that already exist in verified
    const verifiedHandleSet = new Set(
      verifiedDeduplicated.map((m) => m.normalizedHandle.toLowerCase())
    );
    const filteredCandidates = candidatesDeduplicated.filter(
      (c) => !verifiedHandleSet.has(c.normalizedHandle.toLowerCase())
    );

    const officiallyVerified = verifiedDeduplicated.filter(
      (m) => m.verificationLevel === VerificationLevel.OFFICIALLY_VERIFIED
    ).length;
    const communityRoles = verifiedDeduplicated.filter(
      (m) => m.verificationLevel === VerificationLevel.OFFICIAL_COMMUNITY_ROLE
    ).length;

    const allConflicts = [...verifiedConflicts, ...candidateConflicts];
    const missingProvenance = [...verifiedDeduplicated, ...filteredCandidates].filter(
      (m) => !m.officialSourceUrl || !m.evidenceSummary || !m.dliId
    ).length;

    const sources = [
      webRes.health,
      commRes.health,
      annRes.health,
      candRes.health,
    ];

    const staleSources = sources.filter((s) => s.status === 'STALE').length;

    const allFriendsRaw = [
      ...COMMUNITY_FRIEND_SEED_REGISTRY,
    ];
    const { deduplicated: friendsDeduplicated, conflicts: friendConflicts } =
      deduplicateRegistry(allFriendsRaw);

    this.cachedMembers = verifiedDeduplicated;
    this.cachedCommunityFriends = friendsDeduplicated;
    this.cachedCandidates = filteredCandidates;
    this.cachedDiagnostics = {
      registryCount: verifiedDeduplicated.length,
      officiallyVerifiedCount: officiallyVerified,
      officialCommunityRoleCount: communityRoles,
      communityFriendCount: friendsDeduplicated.length,
      candidateCount: filteredCandidates.length,
      externalCount: 0,
      duplicateHandleCount: 0,
      duplicateDliIdCount: 0,
      conflictCount: allConflicts.length + friendConflicts.length,
      unresolvedConflictCount: allConflicts.filter((c) => c.resolutionStatus === 'UNRESOLVED').length,
      missingProvenanceCount: missingProvenance,
      staleSourceCount: staleSources,
      lastUpdated: new Date().toISOString(),
      sourceHealth: staleSources === 0 ? 'HEALTHY' : 'DEGRADED',
      sources,
      conflicts: [...allConflicts, ...friendConflicts],
      auditTimestamp: new Date().toISOString(),
    };
    this.lastFetchTime = now;
  }
}
