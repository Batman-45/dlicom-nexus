import type { CommunityMember, RegistryDiagnostics } from './types';

export interface CommunityMemberProvider {
  readonly name: string;
  getMembers(): Promise<CommunityMember[]>;
  isMember(username: string): Promise<boolean>;
  getMember(username: string): Promise<CommunityMember | null>;
  getDiagnostics(): Promise<RegistryDiagnostics>;
}
