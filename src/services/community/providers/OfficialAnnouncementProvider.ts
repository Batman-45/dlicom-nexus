import type { CommunityMember } from '../types.ts';
import type { CommunitySourceAdapter, SourceFetchResult } from './CommunitySourceAdapter.ts';

export class OfficialAnnouncementProvider implements CommunitySourceAdapter {
  readonly id = 'official-announcement-provider';
  readonly name = 'Official Public Announcement Provider';
  readonly sourceType = 'OFFICIAL_ANNOUNCEMENT' as const;
  readonly primaryUrl = 'https://whitepaper.dlicom.io/';
  readonly proxyUrl = '/api/community/whitepaper';

  private lastSuccessfulFetch?: string;
  private lastFailedFetch?: string;

  async fetchRecords(customFetch?: typeof fetch): Promise<SourceFetchResult> {
    const checkedAt = new Date().toISOString();
    let httpStatus = 200;
    let responseTimeMs = 0;
    let status: 'HEALTHY' | 'STALE' | 'UNAVAILABLE' = 'HEALTHY';
    let errorMessage: string | undefined;

    // Use customFetch if supplied (test/custom injection targets real upstream URL directly);
    // Otherwise in browser/production runtime, use serverless proxy to prevent CORS blockage.
    const isBrowser = typeof window !== 'undefined';
    const targetUrl = customFetch ? this.primaryUrl : (isBrowser ? this.proxyUrl : this.primaryUrl);
    const fetchFn = customFetch || (typeof fetch === 'function' ? fetch : undefined);

    if (fetchFn) {
      const startTime = Date.now();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const res = await fetchFn(targetUrl, {
          signal: controller.signal,
          headers: { 'User-Agent': 'Dlicom-Community-Auditor/1.0' },
        });
        clearTimeout(timeoutId);

        if (targetUrl === this.proxyUrl) {
          try {
            const data = await res.json();
            httpStatus = typeof data.status === 'number' ? data.status : res.status;
            responseTimeMs = typeof data.responseTimeMs === 'number' ? data.responseTimeMs : (Date.now() - startTime);
            if (data.ok) {
              this.lastSuccessfulFetch = checkedAt;
              status = 'HEALTHY';
            } else {
              this.lastFailedFetch = checkedAt;
              status = 'STALE';
              errorMessage = data.error || `HTTP ${httpStatus} returned from ${this.primaryUrl}`;
            }
          } catch {
            responseTimeMs = Date.now() - startTime;
            httpStatus = res.status;
            if (res.ok) {
              this.lastSuccessfulFetch = checkedAt;
              status = 'HEALTHY';
            } else {
              this.lastFailedFetch = checkedAt;
              status = 'STALE';
              errorMessage = `HTTP ${res.status} returned from ${this.primaryUrl}`;
            }
          }
        } else {
          responseTimeMs = Date.now() - startTime;
          httpStatus = res.status;
          if (res.ok) {
            this.lastSuccessfulFetch = checkedAt;
            status = 'HEALTHY';
          } else {
            this.lastFailedFetch = checkedAt;
            status = 'STALE';
            errorMessage = `HTTP ${res.status} returned from ${this.primaryUrl}`;
          }
        }
      } catch (err) {
        responseTimeMs = Date.now() - startTime;
        httpStatus = 0;
        status = 'STALE';
        this.lastFailedFetch = checkedAt;
        errorMessage = err instanceof Error ? err.message : 'Network fetch timed out or offline';
      }
    }

    const members: CommunityMember[] = [];

    return {
      members,
      health: {
        sourceType: this.sourceType,
        url: this.primaryUrl,
        title: 'Dlicom Whitepaper & Official Announcements',
        status,
        freshness: 'FRESH',
        lastChecked: checkedAt,
        lastSuccessfulFetch: this.lastSuccessfulFetch || checkedAt,
        lastFailedFetch: this.lastFailedFetch,
        httpStatus,
        responseTimeMs,
        recordsExtracted: members.length,
        recordsAccepted: 0,
        recordsRejected: 0,
        errorMessage,
      },
    };
  }
}
