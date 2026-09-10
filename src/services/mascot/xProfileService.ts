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
  let clean = (raw || '').trim();
  // Strip protocol and domain if full URL is passed (e.g. https://x.com/username, https://twitter.com/username)
  clean = clean.replace(/^(?:https?:\/\/)?(?:www\.)?(?:x\.com|twitter\.com)\//i, '');
  // Strip query parameters (?s=20 or #...)
  clean = clean.split(/[?#]/)[0];
  // Strip trailing slashes
  clean = clean.replace(/\/+$/, '');
  // Strip leading @
  clean = clean.replace(/^@+/, '').trim();

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

  // Explicit simulated/mock failure handles for testing genuine total failures
  if (cleanUsername === 'notfound' || cleanUsername.startsWith('notfound_')) {
    return {
      success: false,
      isFallback: false,
      error: "Couldn't find that X account.",
      signals: createFallbackSignals(cleanUsername, userConfirmedFocus),
    };
  }

  if (cleanUsername === 'error' || cleanUsername.startsWith('error_')) {
    return {
      success: false,
      isFallback: false,
      error: "Unable to retrieve public X profile right now.",
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

    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          headers: { Accept: 'application/json' },
        });
        if (res.ok) {
          data = await res.json();
          break;
        } else if (res.status === 404) {
          try {
            const errData = await res.json();
            if (errData?.status === 404 || errData?.error?.includes("Couldn't find")) {
              return {
                success: false,
                isFallback: false,
                error: errData?.error || "Couldn't find that X account.",
                signals: createFallbackSignals(cleanUsername, userConfirmedFocus),
              };
            }
          } catch {
            // Ignore non-json response
          }
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
  } catch {
    // Network or server error - gracefully continue to user fallback
  }

  // Safe fallback path:
  // When live public X endpoints are unavailable, rate-limited, malformed, or offline,
  // we do NOT fabricate fake data or claim it was live. We return structured deterministic fallback signals.
  const fallbackSignals = createFallbackSignals(cleanUsername, userConfirmedFocus);
  return {
    success: true,
    isFallback: true,
    signals: fallbackSignals,
  };
}

export function createFallbackSignals(username: string, userConfirmedFocus?: string): PublicXSignals {
  const rawHandle = (username || '').replace(/^@+/, '').trim();
  return {
    username: rawHandle || 'dlicom_user',
    displayName: `@${rawHandle || 'dlicom_user'}`,
    bio: userConfirmedFocus ? `Ecosystem focus: ${userConfirmedFocus}` : '',
    sourceType: 'USER_CONFIRMED_FALLBACK',
    detectedKeywords: userConfirmedFocus ? [userConfirmedFocus] : [],
    inferredFocus: userConfirmedFocus || 'Web3 Ecosystem Contributor',
  };
}
