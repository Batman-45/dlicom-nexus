import type { SocialGraphProvider } from './types';
import { MockSocialGraphProvider } from './MockSocialGraphProvider';
import { XApiSocialGraphProvider } from './XApiSocialGraphProvider';

export * from './types';
export * from './layout';
export * from './MockSocialGraphProvider';
export * from './XApiSocialGraphProvider';

// Singleton instances
let mockProviderInstance: MockSocialGraphProvider | null = null;
let productionProviderInstance: XApiSocialGraphProvider | null = null;

export function getSocialGraphProvider(): SocialGraphProvider {
  const rawEnv = import.meta.env.VITE_USE_MOCK_DATA;
  // Default to mock mode (free offline demo) unless explicitly configured as 'false'
  const useMock = rawEnv === undefined ? true : rawEnv === 'true';

  // Safe diagnostics — never logs credentials
  console.log('[provider] VITE_USE_MOCK_DATA =', JSON.stringify(rawEnv), '| useMock =', useMock);

  if (useMock) {
    if (!mockProviderInstance) {
      mockProviderInstance = new MockSocialGraphProvider();
      console.log('[provider] MODE: MOCK — zero X API requests will be made');
    }
    return mockProviderInstance;
  }

  // Production path — requires a running proxy server
  console.warn('[provider] MODE: PRODUCTION — will attempt to call X API proxy');
  if (!productionProviderInstance) {
    productionProviderInstance = new XApiSocialGraphProvider();
  }
  return productionProviderInstance;
}
