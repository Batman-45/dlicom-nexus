import https from 'https';

/**
 * Shared serverless extraction engine for public X profile and real interactions.
 * Uses official public syndication infrastructure (syndication.twitter.com).
 * Zero Bearer Tokens, zero paid API keys, zero authentication bypass.
 *
 * @param {string} rawUsername
 * @returns {Promise<{ profile: object, connections: Array, isMockData: boolean, fetchedAt: string }>}
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
        const err = new Error('Rate limit reached on public X syndication. Please try again in a few moments.');
        err.status = 429;
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
          const entries = pageProps?.timeline?.entries || [];

          // 1. Build registry of verified X users from payload with genuine pbs.twimg.com avatars
          const knownUsersRegistry = new Map();

          const registerUser = (userObj) => {
            if (!userObj?.screen_name) return;
            const key = userObj.screen_name.toLowerCase();
            const existing = knownUsersRegistry.get(key);
            if (!existing || (!existing.profile_image_url_https && userObj.profile_image_url_https)) {
              knownUsersRegistry.set(key, userObj);
            }
          };

          for (const entry of entries) {
            const tweet = entry.content?.tweet;
            if (!tweet) continue;
            if (tweet.user) registerUser(tweet.user);
            if (tweet.quoted_tweet?.user) registerUser(tweet.quoted_tweet.user);
            if (tweet.retweeted_status?.user) registerUser(tweet.retweeted_status.user);
          }

          // 2. Locate primary profile
          let rawUser = knownUsersRegistry.get(clean.toLowerCase()) || null;
          if (!rawUser && entries.length > 0) {
            rawUser = entries[0].content?.tweet?.user;
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

          for (const entry of entries) {
            const tweet = entry.content?.tweet;
            if (!tweet) continue;

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
                recordInteraction(
                  m.screen_name,
                  m.name,
                  null,
                  null,
                  m.id_str,
                  2,
                  'mention'
                );
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
            const text = tweet.full_text || tweet.text || '';
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

          resolve({
            profile,
            connections,
            isMockData: false,
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
