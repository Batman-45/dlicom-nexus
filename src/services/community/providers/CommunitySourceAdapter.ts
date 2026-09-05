import type { CommunityMember, CommunitySourceType, SourceHealthReport } from '../types.ts';

export interface SourceFetchResult {
  members: CommunityMember[];
  health: SourceHealthReport;
}

export interface CommunitySourceAdapter {
  readonly id: string;
  readonly name: string;
  readonly sourceType: CommunitySourceType;
  readonly primaryUrl: string;

  fetchRecords(): Promise<SourceFetchResult>;
}
