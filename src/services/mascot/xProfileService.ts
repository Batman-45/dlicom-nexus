/**
 * Public X Profile Service for Dlicom Mascot Generator
 *
 * Retrieves only publicly available profile information legally and technically.
 * Never requests private tokens or invents fabricated data.
 * If X public endpoints are rate-limited (HTTP 429) or unavailable, returns a structured
 * fallback signal prompting user confirmation rather than inventing fake data.
 */

import type { PublicXSignals } from '../../types/mascot';

export function validateUsername(raw: string): { isValid: boolean; cleanUsername: string; error?: string } {
  const clean = (raw || '').replace(/^@+/, '').trim();
  if (!clean) {
    return { isValid: false, cleanUsername: '', error: 'Please enter an X username.' };
  }
  if (!/^[a-zA-Z0-9_]{1,25}$/.test(clean)) {
    return {
      isValid: false,
      cleanUsername: clean,
      error: 'Invalid username format. X handles must be 1-25 letters, numbers, or underscores.',
    };
  }
  return { isValid: true, cleanUsername: clean };
}

export async function fetchPublicXSignals(
  username: string,
  userConfirmedFocus?: string
): Promise<{ success: boolean; signals: PublicXSignals; isFallback: boolean; error?: string }> {
  const { isValid, cleanUsername, error } = validateUsername(username);
  if (!isValid) {
    return {
      success: false,
      isFallback: false,
      error: error || 'Invalid username',
      signals: createFallbackSignals(cleanUsername, userConfirmedFocus),
    };
  }

  // Attempt to fetch public profile data via local proxy / serverless API
  try {
    const endpoints = [
      `/api/mascot/profile/${cleanUsername}`,
      `/api/x/users/${cleanUsername}/connections`,
      `/api/proxy/x/users/${cleanUsername}/connections`,
    ];

    let data: any = null;
    let lastError: string | null = null;

    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          headers: { Accept: 'application/json' },
        });
        if (res.ok) {
          data = await res.json();
          break;
        } else {
          try {
            const errData = await res.json();
            if (errData?.error) {
              lastError = errData.error;
            }
          } catch {
            // Ignore non-json response
          }
          // Definite HTTP response from server - no need to redundantly retry other endpoints
          break;
        }
      } catch {
        // Network connection error - try next fallback endpoint if available
      }
    }

    if (data && (data.user || data.profile || data.screen_name || data.displayName)) {
      const p = data.profile || {};
      const u = data.user || {};
      const bio = p.bio || u.description || u.bio || data.bio || data.description || '';
      const displayName = p.displayName || u.name || data.name || data.displayName || `@${cleanUsername}`;
      const profileImageUrl = p.avatar || u.profile_image_url_https || u.avatar || data.profileImageUrl || data.avatar || null;
      const followersCount = p.followersCount ?? u.followers_count ?? data.followers_count ?? 0;
      const followingCount = p.followingCount ?? u.friends_count ?? data.friends_count ?? 0;
      const isVerified = !!(p.verified || u.verified || data.verified);

      const signals: PublicXSignals = {
        username: cleanUsername,
        displayName,
        bio,
        profileImageUrl,
        followersCount,
        followingCount,
        isVerified,
        sourceType: 'LIVE_X_PUBLIC',
        detectedKeywords: [],
        inferredFocus: userConfirmedFocus || 'Public Web3 Contributor',
      };

      return {
        success: true,
        isFallback: false,
        signals,
      };
    }

    if (lastError) {
      return {
        success: false,
        isFallback: false,
        error: lastError,
        signals: createFallbackSignals(cleanUsername, userConfirmedFocus),
      };
    }
  } catch {
    // Network or server error - gracefully continue to user fallback
  }

  // If X public endpoints are rate-limited, unavailable, or return an error:
  // We NEVER fabricate fake data. We return a clean transparent error state.
  return {
    success: false,
    isFallback: false,
    error: "We couldn't retrieve this public X profile right now.",
    signals: createFallbackSignals(cleanUsername, userConfirmedFocus),
  };

}

export function createFallbackSignals(username: string, userConfirmedFocus?: string): PublicXSignals {
  return {
    username: username || 'dlicom_user',
    displayName: `@${username || 'dlicom_user'}`,
    bio: userConfirmedFocus ? `Ecosystem focus: ${userConfirmedFocus}` : '',
    sourceType: 'USER_CONFIRMED_FALLBACK',
    detectedKeywords: userConfirmedFocus ? [userConfirmedFocus] : [],
    inferredFocus: userConfirmedFocus || 'Web3 Ecosystem Contributor',
  };
}
