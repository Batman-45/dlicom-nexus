import type { CommunityMemberProvider } from './CommunityMemberProvider.ts';
import { type CommunityMember, type RegistryDiagnostics } from './types.ts';
import { normalizeHandle } from './engine.ts';
import { PublicEvidenceRegistry } from './registry.ts';

export class DlicomCommunityProvider implements CommunityMemberProvider {
  public readonly name = 'DlicomCommunityProvider';
  private registry = PublicEvidenceRegistry.getInstance();
  private memberMap: Map<string, CommunityMember> | null = null;
  private lastFetchTime = 0;
  private readonly cacheTTL = 5 * 60 * 1000;

  /**
   * Loads verified Dlicom community members and community friends.
   * STRICT: Returns ONLY OFFICIALLY_VERIFIED, OFFICIAL_COMMUNITY_ROLE, and COMMUNITY_FRIEND identities.
   */
  public async getMembers(): Promise<CommunityMember[]> {
    const now = Date.now();
    if (this.memberMap && now - this.lastFetchTime < this.cacheTTL) {
      return Array.from(this.memberMap.values());
    }

    const [verified, friends] = await Promise.all([
      this.registry.getVerifiedMembers(),
      this.registry.getCommunityFriends(),
    ]);
    const all = [...verified, ...friends];
    const map = new Map<string, CommunityMember>();
    for (const m of all) {
      map.set(m.normalizedHandle.toLowerCase(), m);
    }

    this.memberMap = map;
    this.lastFetchTime = now;
    return all;
  }

  /**
   * Returns only official Dlicom identities (Core Team & Community Leadership).
   */
  public async getOfficialMembers(): Promise<CommunityMember[]> {
    return this.registry.getVerifiedMembers();
  }

  /**
   * Returns only verified Dlicom Community Friends.
   */
  public async getCommunityFriends(): Promise<CommunityMember[]> {
    return this.registry.getCommunityFriends();
  }

  /**
   * Fast check if a normalized X handle is a verified Dlicom community member or friend.
   * COMMUNITY_CANDIDATE and EXTERNAL_ACCOUNT return false.
   */
  public async isMember(username: string): Promise<boolean> {
    const clean = normalizeHandle(username);
    if (!clean) return false;
    await this.getMembers();
    return this.memberMap?.has(clean) || false;
  }

  /**
   * Retrieves member provenance details if present in the verified Dlicom registry.
   */
  public async getMember(username: string): Promise<CommunityMember | null> {
    const clean = normalizeHandle(username);
    if (!clean) return null;
    await this.getMembers();
    return this.memberMap?.get(clean) || null;
  }

  /**
   * Retrieves separate candidate queue.
   */
  public async getCandidates(): Promise<CommunityMember[]> {
    return this.registry.getCandidates();
  }

  /**
   * Exposes registry health, audit logs, and provenance statistics.
   */
  public async getDiagnostics(): Promise<RegistryDiagnostics> {
    return this.registry.getDiagnostics();
  }
}
