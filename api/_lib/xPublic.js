import https from 'https';

/**
 * Normalizes user object across standard and GraphQL/legacy Twitter syndication structures.
 *
 * @param {object|null} rawUser
 * @returns {object|null}
 */
export function normalizeUser(rawUser) {
  if (!rawUser) return null;
  const legacy = rawUser.legacy || {};
  return {
    id_str: rawUser.id_str || (rawUser.id ? String(rawUser.id) : legacy.id_str) || null,
    screen_name: rawUser.screen_name || rawUser.username || legacy.screen_name || null,
    name: rawUser.name || rawUser.displayName || legacy.name || null,
    profile_image_url_https: rawUser.profile_image_url_https || rawUser.profile_image_url || legacy.profile_image_url_https || null,
    profile_banner_url: rawUser.profile_banner_url || legacy.profile_banner_url || null,
    description: rawUser.description || rawUser.bio || legacy.description || '',
    followers_count: rawUser.followers_count ?? rawUser.followersCount ?? legacy.followers_count ?? 0,
    friends_count: rawUser.friends_count ?? rawUser.friendsCount ?? rawUser.followingCount ?? legacy.friends_count ?? 0,
    verified: !!(rawUser.verified || rawUser.is_blue_verified || legacy.verified || legacy.is_blue_verified),
    created_at: rawUser.created_at || rawUser.createdAt || legacy.created_at || null,
  };
}

/**
 * Extracts all entries from diverse timeline shapes (entries array, GraphQL instructions, raw items).
 *
 * @param {object} pageProps
 * @returns {Array}
 */
export function extractTimelineEntries(pageProps) {
  if (!pageProps) return [];
  const collected = [];

  // 1. Standard entries array
  if (Array.isArray(pageProps.timeline?.entries)) {
    collected.push(...pageProps.timeline.entries);
  }

  // 2. Twitter GraphQL instructions structure (TimelineAddEntries / TimelinePinEntry)
  const instructions = pageProps.timeline?.instructions ||
                       pageProps.user?.timeline?.timeline?.instructions ||
                       pageProps.instructions;
  if (Array.isArray(instructions)) {
    for (const inst of instructions) {
      if (Array.isArray(inst?.entries)) {
        collected.push(...inst.entries);
      } else if (inst?.entry) {
        collected.push(inst.entry);
      } else if (inst?.item) {
        collected.push(inst.item);
      }
    }
  }

  // 3. Alternative timeline array properties (items, tweets, raw)
  if (Array.isArray(pageProps.timeline?.items)) {
    collected.push(...pageProps.timeline.items);
  }
  if (Array.isArray(pageProps.timeline?.tweets)) {
    collected.push(...pageProps.timeline.tweets);
  }
  if (Array.isArray(pageProps.timeline?.raw)) {
    collected.push(...pageProps.timeline.raw);
  }
  if (Array.isArray(pageProps.tweets)) {
    collected.push(...pageProps.tweets);
  } else if (pageProps.tweets && typeof pageProps.tweets === 'object') {
    collected.push(...Object.values(pageProps.tweets));
  }

  // 4. Pinned tweet
  if (pageProps.timeline?.pinnedTweet) {
    collected.unshift({ content: { tweet: pageProps.timeline.pinnedTweet } });
  } else if (pageProps.pinnedTweet) {
    collected.unshift({ content: { tweet: pageProps.pinnedTweet } });
  }

  return collected;
}

/**
 * Resolves a tweet object from an entry item across varying syndication layouts.
 *
 * @param {object} entry
 * @returns {object|null}
 */
export function extractTweetFromEntry(entry) {
  if (!entry) return null;
  // Direct content tweet
  if (entry.content?.tweet) return entry.content.tweet;
  // GraphQL tweet result
  if (entry.content?.itemContent?.tweet_results?.result?.tweet) {
    return entry.content.itemContent.tweet_results.result.tweet;
  }
  if (entry.content?.itemContent?.tweet_results?.result) {
    return entry.content.itemContent.tweet_results.result;
  }
  // Nested item content
  if (entry.content?.item?.content?.tweet) return entry.content.item.content.tweet;
  if (entry.content?.item?.tweet) return entry.content.item.tweet;
  if (entry.tweet) return entry.tweet;
  if (entry.itemContent?.tweet_results?.result?.tweet) {
    return entry.itemContent.tweet_results.result.tweet;
  }
  if (entry.itemContent?.tweet_results?.result) {
    return entry.itemContent.tweet_results.result;
  }
  // If entry itself is already a tweet object
  if (entry.id_str || entry.full_text || entry.text || entry.legacy) return entry;
  return null;
}

/**
 * Normalizes tweet fields (replies, mentions, quotes, retweets) into a consistent schema.
 *
 * @param {object} rawTweet
 * @returns {object|null}
 */
export function normalizeTweet(rawTweet) {
  if (!rawTweet) return null;
  const legacy = rawTweet.legacy || {};

  const user = rawTweet.user ||
               rawTweet.core?.user_results?.result?.legacy ||
               rawTweet.core?.user_results?.result ||
               rawTweet.author ||
               null;

  const quoted = rawTweet.quoted_tweet ||
                 rawTweet.quoted_status ||
                 rawTweet.quoted_status_result?.result?.tweet ||
                 rawTweet.quoted_status_result?.result ||
                 legacy.quoted_status ||
                 null;

  const retweeted = rawTweet.retweeted_status ||
                    rawTweet.retweeted_status_result?.result?.tweet ||
                    rawTweet.retweeted_status_result?.result ||
                    legacy.retweeted_status ||
                    null;

  return {
    id_str: rawTweet.id_str || (rawTweet.id ? String(rawTweet.id) : legacy.id_str) || null,
    text: rawTweet.full_text || rawTweet.text || legacy.full_text || legacy.text || '',
    user: normalizeUser(user),
    in_reply_to_screen_name: rawTweet.in_reply_to_screen_name || legacy.in_reply_to_screen_name || null,
    in_reply_to_user_id_str: rawTweet.in_reply_to_user_id_str || legacy.in_reply_to_user_id_str || null,
    entities: rawTweet.entities || legacy.entities || {},
    quoted_tweet: quoted ? {
      ...quoted,
      user: normalizeUser(quoted.user || quoted.core?.user_results?.result?.legacy || quoted.core?.user_results?.result)
    } : null,
    retweeted_status: retweeted ? {
      ...retweeted,
      user: normalizeUser(retweeted.user || retweeted.core?.user_results?.result?.legacy || retweeted.core?.user_results?.result)
    } : null,
  };
}

/**
 * Shared serverless extraction engine for public X profile and real interactions.
 * Uses official public syndication infrastructure (syndication.twitter.com).
 * Zero Bearer Tokens, zero paid API keys, zero authentication bypass.
 *
 * @param {string} rawUsername
 * @returns {Promise<{
 *   profile: object,
 *   connections: Array,
 *   isMockData: boolean,
 *   dataStatus: 'OK' | 'NO_PUBLIC_INTERACTIONS',
 *   reason: string | null,
 *   fetchedAt: string
 * }>}
 */
export async function fetchXPublicProfile(rawUsername) {
  const clean = (rawUsername || '').replace(/^@+/, '').trim();
  if (!clean || !/^[a-zA-Z0-9_]{1,25}$/.test(clean)) {
    const err = new Error('Invalid X username format. Must be 1-25 alphanumeric characters or underscores.');
    err.status = 400;
    throw err;
  }

  const url = `https://syndication.twitter.com/srv/timeline-profile/screen-name/${encodeURIComponent(clean)}`;

  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout: 12000
    }, (res) => {
      if (res.statusCode === 404) {
        const err = new Error("Couldn't find that X account.");
        err.status = 404;
        return reject(err);
      }
      if (res.statusCode === 429) {
        const err = new Error('X public data is temporarily rate-limited.');
        err.status = 429;
        const resetHeader = res.headers['x-rate-limit-reset'];
        if (resetHeader) {
          const resetTimestamp = parseInt(resetHeader, 10);
          if (!isNaN(resetTimestamp)) {
            err.retryAfter = Math.max(1, resetTimestamp - Math.floor(Date.now() / 1000));
          }
        }
        if (!err.retryAfter) {
          err.retryAfter = 60;
        }
        return reject(err);
      }
      if (res.statusCode === 403) {
        const err = new Error('This X account is protected or unavailable.');
        err.status = 403;
        return reject(err);
      }
      if (res.statusCode < 200 || res.statusCode >= 300) {
        const err = new Error(`Public X syndication returned status ${res.statusCode}`);
        err.status = 502;
        return reject(err);
      }

      let html = '';
      res.on('data', chunk => html += chunk);
      res.on('end', () => {
        try {
          const match = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/);
          if (!match) {
            const err = new Error('Unable to parse public X data payload.');
            err.status = 502;
            return reject(err);
          }

          const json = JSON.parse(match[1]);
          const pageProps = json.props?.pageProps;
          const rawEntries = extractTimelineEntries(pageProps);

          // 1. Build registry of verified X users from payload with genuine pbs.twimg.com avatars
          const knownUsersRegistry = new Map();

          const registerUser = (userObj) => {
            const normalized = normalizeUser(userObj);
            if (!normalized?.screen_name) return;
            const key = normalized.screen_name.toLowerCase();
            const existing = knownUsersRegistry.get(key);
            if (!existing || (!existing.profile_image_url_https && normalized.profile_image_url_https)) {
              knownUsersRegistry.set(key, normalized);
            }
          };

          const normalizedTweets = [];
          for (const entry of rawEntries) {
            const tweet = extractTweetFromEntry(entry);
            if (!tweet) continue;
            const normTweet = normalizeTweet(tweet);
            if (!normTweet) continue;
            normalizedTweets.push(normTweet);

            if (normTweet.user) registerUser(normTweet.user);
            if (normTweet.quoted_tweet?.user) registerUser(normTweet.quoted_tweet.user);
            if (normTweet.retweeted_status?.user) registerUser(normTweet.retweeted_status.user);
          }

          // 2. Locate primary profile across all candidate locations
          let rawUser = knownUsersRegistry.get(clean.toLowerCase()) || null;
          if (!rawUser && pageProps?.user) {
            rawUser = normalizeUser(pageProps.user);
          }
          if (!rawUser && pageProps?.userProfile) {
            rawUser = normalizeUser(pageProps.userProfile);
          }
          if (!rawUser && pageProps?.author) {
            rawUser = normalizeUser(pageProps.author);
          }
          if (!rawUser && normalizedTweets.length > 0 && normalizedTweets[0].user) {
            rawUser = normalizedTweets[0].user;
          }

          const headerScreenName = pageProps?.headerProps?.screenName;
          if (!rawUser && !headerScreenName) {
            const err = new Error("Couldn't find that X account.");
            err.status = 404;
            return reject(err);
          }

          // Format high-res X CDN avatar
          const primaryAvatar = rawUser?.profile_image_url_https
            ? rawUser.profile_image_url_https.replace('_normal.', '_400x400.')
            : `https://unavatar.io/x/${encodeURIComponent(clean)}`;

          const profile = {
            id: rawUser?.id_str || (rawUser?.id ? String(rawUser.id) : `x-${clean}`),
            username: rawUser?.screen_name || headerScreenName || clean,
            displayName: rawUser?.name || headerScreenName || clean,
            avatar: primaryAvatar,
            avatarSource: rawUser?.profile_image_url_https ? 'x-cdn' : 'unavatar-fallback',
            banner: rawUser?.profile_banner_url || null,
            bio: rawUser?.description || '',
            followersCount: rawUser?.followers_count ?? 0,
            followingCount: rawUser?.friends_count ?? 0,
            verified: !!(rawUser?.verified || rawUser?.is_blue_verified),
            createdDate: rawUser?.created_at ? new Date(rawUser.created_at).getFullYear().toString() : null
          };

          // 3. Extract genuine observed interactions
          const interactionMap = new Map();

          const recordInteraction = (handle, name, avatar, bio, idStr, weight, type) => {
            if (!handle) return;
            const normHandle = handle.replace(/^@+/, '').trim();
            if (!normHandle || normHandle.toLowerCase() === clean.toLowerCase()) return;

            const key = normHandle.toLowerCase();
            const known = knownUsersRegistry.get(key);

            let finalAvatar = avatar;
            let avatarSource = 'x-cdn';
            if (!finalAvatar && known?.profile_image_url_https) {
              finalAvatar = known.profile_image_url_https.replace('_normal.', '_400x400.');
            }
            if (!finalAvatar) {
              finalAvatar = `https://unavatar.io/x/${encodeURIComponent(normHandle)}`;
              avatarSource = 'unavatar-fallback';
            } else if (finalAvatar.includes('twimg.com')) {
              avatarSource = 'x-cdn';
            }

            const finalDisplayName = name || known?.name || normHandle;
            const finalBio = bio || known?.description || '';
            const finalId = idStr || known?.id_str || (known?.id ? String(known.id) : `x-${normHandle}`);

            const existing = interactionMap.get(key) || {
              id: finalId,
              username: normHandle,
              displayName: finalDisplayName,
              avatar: finalAvatar,
              avatarSource,
              bio: finalBio,
              rawScore: 0,
              interactionCount: 0,
              interactionTypesSet: new Set(),
            };

            existing.rawScore += weight;
            existing.interactionCount += 1;
            existing.interactionTypesSet.add(type);

            if (finalDisplayName && (!existing.displayName || existing.displayName === normHandle)) {
              existing.displayName = finalDisplayName;
            }
            if (avatarSource === 'x-cdn' && existing.avatarSource !== 'x-cdn') {
              existing.avatar = finalAvatar;
              existing.avatarSource = 'x-cdn';
            }
            if (finalBio && !existing.bio) {
              existing.bio = finalBio;
            }
            if (finalId && (!existing.id || existing.id.startsWith('x-'))) {
              existing.id = finalId;
            }

            interactionMap.set(key, existing);
          };

          for (const tweet of normalizedTweets) {
            // Reply: weight 3
            if (tweet.in_reply_to_screen_name) {
              recordInteraction(
                tweet.in_reply_to_screen_name,
                null,
                null,
                null,
                tweet.in_reply_to_user_id_str,
                3,
                'reply'
              );
            }

            // User mentions in entities: weight 2
            if (tweet.entities?.user_mentions) {
              for (const m of tweet.entities.user_mentions) {
                const screenName = m.screen_name || m.screenName;
                const name = m.name;
                const idStr = m.id_str || (m.id ? String(m.id) : null);
                recordInteraction(screenName, name, null, null, idStr, 2, 'mention');
              }
            }

            // Quoted tweet: weight 2
            if (tweet.quoted_tweet?.user) {
              const qu = tweet.quoted_tweet.user;
              recordInteraction(
                qu.screen_name,
                qu.name,
                qu.profile_image_url_https,
                qu.description,
                qu.id_str,
                2,
                'quote'
              );
            }

            // Retweet / Repost: weight 1
            if (tweet.retweeted_status?.user) {
              const rt = tweet.retweeted_status.user;
              recordInteraction(
                rt.screen_name,
                rt.name,
                rt.profile_image_url_https,
                rt.description,
                rt.id_str,
                1,
                'repost'
              );
            }

            // Text @mentions: weight 1
            const text = tweet.text || '';
            const matches = text.match(/@([a-zA-Z0-9_]{1,25})/g) || [];
            for (const m of matches) {
              recordInteraction(m.slice(1), null, null, null, null, 1, 'mention');
            }
          }

          // 4. Sort descending by rawScore and normalize to 15-98
          const sorted = Array.from(interactionMap.values()).sort((a, b) => b.rawScore - a.rawScore);
          const maxScore = sorted.length > 0 ? sorted[0].rawScore : 1;

          const connections = sorted.map((conn) => {
            const score = Math.max(15, Math.min(98, Math.round((conn.rawScore / maxScore) * 83 + 15)));
            const types = Array.from(conn.interactionTypesSet);
            return {
              id: conn.id,
              username: conn.username,
              displayName: conn.displayName,
              avatar: conn.avatar,
              avatarSource: conn.avatarSource,
              bio: conn.bio,
              interactionCount: conn.interactionCount,
              interactionTypes: types,
              interactionScore: score,
              connectionStrength: score, // layout compat
              role: types.length ? `Interacted via ${types.join(' · ')}` : 'X Interaction',
              category: types.includes('reply') ? 'friends' : types.includes('quote') ? 'creators' : 'builders',
            };
          });

          const dataStatus = connections.length > 0 ? 'OK' : 'NO_PUBLIC_INTERACTIONS';
          const reason = connections.length > 0
            ? null
            : 'No usable public X interactions were available from the syndication source.';

          resolve({
            profile,
            connections,
            isMockData: false,
            dataStatus,
            reason,
            fetchedAt: new Date().toISOString()
          });
        } catch {
          const err = new Error('Failed to parse public X data payload.');
          err.status = 502;
          reject(err);
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const err = new Error('Public X syndication request timed out.');
      err.status = 504;
      reject(err);
    });

    req.on('error', (err) => {
      const e = new Error(`Failed to reach public X syndication: ${err.message}`);
      e.status = 502;
      reject(e);
    });
  });
}

