import https from 'https';
import vm from 'vm';

/**
 * Normalizes user object across standard, GraphQL/legacy Twitter syndication structures,
 * and public Relay records.
 *
 * @param {object|null} rawUser
 * @returns {object|null}
 */
export function normalizeUser(rawUser) {
  if (!rawUser) return null;
  const legacy = rawUser.legacy || {};
  return {
    id_str: rawUser.id_str || (rawUser.id ? String(rawUser.id) : (rawUser.rest_id || legacy.id_str)) || null,
    screen_name: rawUser.screen_name || rawUser.username || legacy.screen_name || null,
    name: rawUser.name || rawUser.displayName || legacy.name || null,
    profile_image_url_https: rawUser.profile_image_url_https || rawUser.profile_image_url || rawUser.image_url || legacy.profile_image_url_https || null,
    profile_banner_url: rawUser.profile_banner_url || legacy.profile_banner_url || null,
    description: rawUser.description || rawUser.bio || legacy.description || '',
    followers_count: rawUser.followers_count ?? rawUser.followersCount ?? rawUser.followers ?? legacy.followers_count ?? 0,
    friends_count: rawUser.friends_count ?? rawUser.friendsCount ?? rawUser.following ?? rawUser.followingCount ?? legacy.friends_count ?? 0,
    verified: !!(rawUser.verified || rawUser.is_blue_verified || legacy.verified || legacy.is_blue_verified),
    created_at: rawUser.created_at || rawUser.createdAt || legacy.created_at || null,
  };
}

/**
 * Resilient HTTPS GET with redirect handling, customizable headers, and timeouts.
 */
function fetchHttps(url, options = {}, follow = 3) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        ...options.headers
      },
      timeout: options.timeout || 12000
    }, (res) => {
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location && follow > 0) {
        return resolve(fetchHttps(res.headers.location, options, follow - 1));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, data }));
    });
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });
    req.on('error', reject);
  });
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

  // 2. Twitter GraphQL instructions structure (TimelineAddEntries / TimelinePinEntry / TimelineAddToModule)
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
      } else if (Array.isArray(inst?.moduleItems)) {
        collected.push(...inst.moduleItems);
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
 * SOURCE 1: Official Twitter public syndication widget timeline.
 * Endpoint: https://syndication.twitter.com/srv/timeline-profile/screen-name/{username}
 */
export async function fetchSyndicationSource(cleanUsername) {
  const url = `https://syndication.twitter.com/srv/timeline-profile/screen-name/${encodeURIComponent(cleanUsername)}`;
  try {
    const res = await fetchHttps(url);
    if (res.status === 404) return { status: 404 };
    if (res.status === 429) {
      const err = new Error('X public data is temporarily rate-limited.');
      err.status = 429;
      const resetHeader = res.headers['x-rate-limit-reset'];
      if (resetHeader) {
        const resetTimestamp = parseInt(resetHeader, 10);
        if (!isNaN(resetTimestamp)) {
          err.retryAfter = Math.max(1, resetTimestamp - Math.floor(Date.now() / 1000));
        }
      }
      if (!err.retryAfter) err.retryAfter = 60;
      throw err;
    }
    if (res.status === 403) {
      const err = new Error('This X account is protected or unavailable.');
      err.status = 403;
      throw err;
    }
    if (res.status < 200 || res.status >= 300) return null;

    const match = res.data.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/);
    if (!match) return null;

    const json = JSON.parse(match[1]);
    const pageProps = json.props?.pageProps;
    const rawEntries = extractTimelineEntries(pageProps);
    const tweets = [];

    for (const entry of rawEntries) {
      const tw = extractTweetFromEntry(entry);
      if (!tw) continue;
      const norm = normalizeTweet(tw);
      if (norm) tweets.push(norm);
    }

    return {
      status: 200,
      source: 'X Syndication',
      rawSize: res.data.length,
      rawEntriesCount: rawEntries.length,
      pageProps,
      tweets,
    };
  } catch (err) {
    if (err.status === 429 || err.status === 403 || err.status === 404) throw err;
    return null;
  }
}

/**
 * SOURCE 2: Official public web profile page at https://x.com/{username}.
 * Contains OpenGraph profile metadata and public SSR Relay hydration records.
 */
export async function fetchPublicWebSource(cleanUsername) {
  const url = `https://x.com/${encodeURIComponent(cleanUsername)}`;
  try {
    const res = await fetchHttps(url);
    if (res.status === 404) return { status: 404 };
    if (res.status === 429) {
      const err = new Error('X public data is temporarily rate-limited.');
      err.status = 429;
      err.retryAfter = 60;
      throw err;
    }
    if (res.status === 403) {
      const err = new Error('This X account is protected or unavailable.');
      err.status = 403;
      throw err;
    }
    if (res.status < 200 || res.status >= 300) return null;

    const html = res.data;
    const ogTitle = html.match(/<meta property="og:title" content="([^"]*)"/i)?.[1];
    const ogDesc = html.match(/<meta property="og:description" content="([^"]*)"/i)?.[1];
    const ogImage = html.match(/<meta property="og:image" content="([^"]*)"/i)?.[1];

    let parsedDisplayName = null;
    if (ogTitle) {
      const m = ogTitle.match(/^(.*?)\s*\(@[a-zA-Z0-9_]+\)/);
      if (m && m[1]) parsedDisplayName = m[1].trim();
    }

    const capturedRecords = [];
    const createMockTarget = () => {
      const target = [];
      return new Proxy(target, {
        get(t, prop) {
          if (prop in t) return t[prop];
          return {
            next: (payload) => { if (payload?.relayRecords) capturedRecords.push(payload.relayRecords); },
            return: () => {},
            error: () => {}
          };
        },
        set(t, prop, val) {
          t[prop] = val;
          if (val?.relayRecords) capturedRecords.push(val.relayRecords);
          return true;
        }
      });
    };

    const tsr = createMockTarget();
    const $R = { tsr };
    const sandbox = {
      self: {},
      window: {},
      document: { currentScript: { remove() {} }, getElementById: () => null, documentElement: { style: {} }, cookie: '' },
      $R,
      ReadableStream: globalThis.ReadableStream,
      TextEncoder: globalThis.TextEncoder,
      TextDecoder: globalThis.TextDecoder,
      requestAnimationFrame() {},
      performance: { now: () => 0 },
      $RT: 0,
      $RB: [],
      $RV: () => {},
      $_TSR: { h: () => {}, e: () => {}, c: () => {} },
      console: { log() {}, warn() {}, error() {} }
    };
    sandbox.self = sandbox;
    sandbox.window = sandbox;
    sandbox.self.$R = $R;
    const context = vm.createContext(sandbox);

    const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = scriptRegex.exec(html)) !== null) {
      const code = match[1];
      if (code.includes('relayRecords') && !code.includes('ReadableStream')) {
        try {
          vm.runInContext(code, context, { timeout: 2000 });
        } catch {
          // Safe evaluation error ignore
        }
      }
    }

    const relayRecords = Object.assign({}, ...capturedRecords);

    return {
      status: 200,
      source: 'Public Web Profile (x.com)',
      rawSize: html.length,
      og: {
        displayName: parsedDisplayName,
        bio: ogDesc ? ogDesc.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'") : null,
        avatar: ogImage ? ogImage.replace('_200x200.', '_400x400.').replace('_normal.', '_400x400.') : null,
      },
      relayRecords,
    };
  } catch (err) {
    if (err.status === 429 || err.status === 403 || err.status === 404) throw err;
    return null;
  }
}

/**
 * Shared serverless extraction engine for public X profile and real interactions.
 * Exhausts legitimate free/public X data paths without tokens, authentication bypass, or fake graphs.
 *
 * @param {string} rawUsername
 * @returns {Promise<{
 *   profile: object,
 *   connections: Array,
 *   isMockData: boolean,
 *   dataStatus: 'OK' | 'NO_PUBLIC_INTERACTIONS',
 *   reason: string | null,
 *   fetchedAt: string,
 *   sourcesUsed: string[]
 * }>}
 */
export async function fetchXPublicProfile(rawUsername) {
  const clean = (rawUsername || '').replace(/^@+/, '').trim();
  if (!clean || !/^[a-zA-Z0-9_]{1,25}$/.test(clean)) {
    const err = new Error('Invalid X username format. Must be 1-25 alphanumeric characters or underscores.');
    err.status = 400;
    throw err;
  }

  // 1. Concurrently fetch all legitimate public X data sources
  const [syndicationResult, webProfileResult] = await Promise.all([
    fetchSyndicationSource(clean).catch(e => ({ error: e })),
    fetchPublicWebSource(clean).catch(e => ({ error: e })),
  ]);

  // Check fatal errors across all sources
  if (syndicationResult?.error?.status === 429 && webProfileResult?.error?.status === 429) {
    throw syndicationResult.error;
  }
  if (syndicationResult?.status === 404 && webProfileResult?.status === 404) {
    const err = new Error("Couldn't find that X account.");
    err.status = 404;
    throw err;
  }
  if (syndicationResult?.status === 403 && webProfileResult?.status === 403) {
    const err = new Error('This X account is protected or unavailable.');
    err.status = 403;
    throw err;
  }

  const sourcesUsed = [];
  if (syndicationResult?.tweets?.length > 0) {
    sourcesUsed.push('X Syndication');
  } else if (syndicationResult?.status === 200) {
    sourcesUsed.push('X Syndication (empty timeline)');
  }

  if (webProfileResult?.status === 200) {
    sourcesUsed.push('Public Web Profile (x.com)');
  }

  if (sourcesUsed.length === 0) {
    const err = new Error('Unable to reach public X data sources.');
    err.status = 502;
    throw err;
  }

  // 2. Build verified X users registry across all sources
  const knownUsersRegistry = new Map();

  const registerUser = (userObj) => {
    const normalized = normalizeUser(userObj);
    if (!normalized?.screen_name) return;
    const key = normalized.screen_name.toLowerCase();
    const existing = knownUsersRegistry.get(key);
    if (!existing) {
      knownUsersRegistry.set(key, normalized);
    } else {
      // Merge richer fields
      if (!existing.profile_image_url_https && normalized.profile_image_url_https) {
        existing.profile_image_url_https = normalized.profile_image_url_https;
      }
      if (!existing.name && normalized.name) existing.name = normalized.name;
      if (!existing.description && normalized.description) existing.description = normalized.description;
      if (!existing.id_str && normalized.id_str) existing.id_str = normalized.id_str;
      if (!existing.followers_count && normalized.followers_count) existing.followers_count = normalized.followers_count;
      if (!existing.friends_count && normalized.friends_count) existing.friends_count = normalized.friends_count;
    }
  };

  const allNormalizedTweets = [];

  // Register syndication users and collect tweets
  if (syndicationResult?.tweets) {
    for (const normTweet of syndicationResult.tweets) {
      allNormalizedTweets.push(normTweet);
      if (normTweet.user) registerUser(normTweet.user);
      if (normTweet.quoted_tweet?.user) registerUser(normTweet.quoted_tweet.user);
      if (normTweet.retweeted_status?.user) registerUser(normTweet.retweeted_status.user);
    }
  }

  // Register web profile Relay records users and tweets
  if (webProfileResult?.relayRecords) {
    const records = webProfileResult.relayRecords;
    const deref = (obj) => {
      if (!obj) return null;
      if (obj.__ref) return records[obj.__ref] || null;
      return obj;
    };

    // User records in Relay
    for (const k of Object.keys(records)) {
      const rec = records[k];
      if (!rec) continue;

      if (rec.__typename === 'UserCore' && rec.screen_name) {
        registerUser({
          screen_name: rec.screen_name,
          name: rec.name,
        });
      }
      if (rec.__typename === 'User' && rec.rest_id) {
        const core = deref(rec.core);
        const avatar = deref(rec.avatar);
        const relCounts = deref(rec.relationship_counts);
        if (core?.screen_name || rec.screen_name) {
          registerUser({
            id_str: rec.rest_id,
            screen_name: core?.screen_name || rec.screen_name,
            name: core?.name || rec.name,
            profile_image_url_https: avatar?.image_url,
            followers_count: relCounts?.followers,
            friends_count: relCounts?.following,
          });
        }
      }
      if (rec.__typename === 'UserAvatar' && rec.image_url) {
        for (const u of knownUsersRegistry.values()) {
          if (!u.profile_image_url_https && u.id_str && k.includes(u.id_str)) {
            u.profile_image_url_https = rec.image_url;
          }
        }
      }
    }

    // Tweet records in Relay
    for (const k of Object.keys(records)) {
      const rec = records[k];
      if (rec?.__typename === 'Tweet' && rec.rest_id) {
        const legacy = deref(rec.legacy) || {};
        const tweetCore = deref(rec.core);
        const authorUser = deref(tweetCore?.user_results?.result) || deref(rec.user) || null;

        let fullText = legacy.full_text || rec.text || '';
        const noteTweetData = deref(rec.note_tweet);
        const userMentions = [];

        if (noteTweetData) {
          const noteResults = deref(noteTweetData.note_tweet_results);
          const note = deref(noteResults?.result) || deref(noteResults);
          if (note?.text) fullText = note.text;
          const entitySet = deref(note?.entity_set);
          if (entitySet?.user_mentions?.__refs) {
            for (const refId of entitySet.user_mentions.__refs) {
              const m = records[refId];
              if (m?.screen_name) {
                userMentions.push({
                  screen_name: m.screen_name,
                  name: m.name || m.screen_name,
                  id_str: m.id_str || null,
                });
              }
            }
          }
        }

        if (rec.mention_entities?.__refs) {
          for (const refId of rec.mention_entities.__refs) {
            const m = records[refId];
            if (m?.screen_name) {
              userMentions.push({
                screen_name: m.screen_name,
                name: m.name || m.screen_name,
                id_str: m.id_str || null,
              });
            }
          }
        }

        const replyToUserResults = deref(rec.reply_to_user_results);
        const replyUser = deref(replyToUserResults?.result) || deref(replyToUserResults);
        const replyScreenName = legacy.in_reply_to_screen_name || replyUser?.core?.screen_name || replyUser?.screen_name || null;
        const replyUserIdStr = legacy.in_reply_to_user_id_str || replyUser?.rest_id || null;

        const quotedResults = deref(rec.quoted_tweet_results);
        const quotedTweet = deref(quotedResults?.result?.tweet) || deref(quotedResults?.result) || quotedResults;
        const quotedAuthor = quotedTweet ? (deref(deref(quotedTweet.core)?.user_results?.result) || deref(quotedTweet.user)) : null;

        const retweetResults = deref(rec.retweeted_status_results) || deref(legacy.retweeted_status_result);
        const retweetedTweet = deref(retweetResults?.result?.tweet) || deref(retweetResults?.result) || retweetResults;
        const retweetedAuthor = retweetedTweet ? (deref(deref(retweetedTweet.core)?.user_results?.result) || deref(retweetedTweet.user)) : null;

        allNormalizedTweets.push({
          id_str: rec.rest_id,
          text: fullText,
          user: normalizeUser(authorUser),
          in_reply_to_screen_name: replyScreenName,
          in_reply_to_user_id_str: replyUserIdStr,
          entities: {
            user_mentions: userMentions,
          },
          quoted_tweet: quotedAuthor ? { user: normalizeUser(quotedAuthor) } : null,
          retweeted_status: retweetedAuthor ? { user: normalizeUser(retweetedAuthor) } : null,
        });

        if (authorUser) registerUser(authorUser);
        if (quotedAuthor) registerUser(quotedAuthor);
        if (retweetedAuthor) registerUser(retweetedAuthor);
      }
    }
  }

  // Deduplicate tweets by id_str
  const seenTweetIds = new Set();
  const deduplicatedTweets = [];
  for (const t of allNormalizedTweets) {
    if (t.id_str) {
      if (seenTweetIds.has(t.id_str)) continue;
      seenTweetIds.add(t.id_str);
    }
    deduplicatedTweets.push(t);
  }

  // 3. Locate and merge primary profile metadata
  let primaryRawUser = knownUsersRegistry.get(clean.toLowerCase()) || null;
  if (!primaryRawUser && syndicationResult?.pageProps?.user) {
    primaryRawUser = normalizeUser(syndicationResult.pageProps.user);
  }
  if (!primaryRawUser && syndicationResult?.pageProps?.userProfile) {
    primaryRawUser = normalizeUser(syndicationResult.pageProps.userProfile);
  }
  if (!primaryRawUser && syndicationResult?.pageProps?.author) {
    primaryRawUser = normalizeUser(syndicationResult.pageProps.author);
  }
  if (!primaryRawUser && deduplicatedTweets.length > 0 && deduplicatedTweets[0].user) {
    primaryRawUser = deduplicatedTweets[0].user;
  }

  const headerScreenName = syndicationResult?.pageProps?.headerProps?.screenName;
  const webOg = webProfileResult?.og;

  if (!primaryRawUser && !headerScreenName && !webOg?.displayName) {
    const err = new Error("Couldn't find that X account.");
    err.status = 404;
    throw err;
  }

  let primaryAvatar = null;
  let avatarSource = 'unavatar-fallback';

  if (primaryRawUser?.profile_image_url_https) {
    primaryAvatar = primaryRawUser.profile_image_url_https.replace('_normal.', '_400x400.');
    avatarSource = 'x-cdn';
  } else if (webOg?.avatar) {
    primaryAvatar = webOg.avatar;
    avatarSource = 'x-cdn';
  } else {
    primaryAvatar = `https://unavatar.io/x/${encodeURIComponent(clean)}`;
    avatarSource = 'unavatar-fallback';
  }

  const primaryDisplayName = primaryRawUser?.name ||
                             webOg?.displayName ||
                             headerScreenName ||
                             clean;

  const primaryBio = primaryRawUser?.description ||
                     webOg?.bio ||
                     '';

  const profile = {
    id: primaryRawUser?.id_str || (primaryRawUser?.id ? String(primaryRawUser.id) : `x-${clean}`),
    username: primaryRawUser?.screen_name || headerScreenName || clean,
    displayName: primaryDisplayName,
    avatar: primaryAvatar,
    avatarSource,
    banner: primaryRawUser?.profile_banner_url || null,
    bio: primaryBio,
    followersCount: primaryRawUser?.followers_count ?? 0,
    followingCount: primaryRawUser?.friends_count ?? 0,
    verified: !!(primaryRawUser?.verified || primaryRawUser?.is_blue_verified),
    createdDate: primaryRawUser?.created_at ? new Date(primaryRawUser.created_at).getFullYear().toString() : null,
  };

  // 4. Extract genuine observed interactions with evidence deduplication
  const interactionMap = new Map();

  const recordInteraction = (handle, name, avatar, bio, idStr, weight, type, tweetId) => {
    if (!handle) return;
    const normHandle = handle.replace(/^@+/, '').trim();
    if (!normHandle || normHandle.toLowerCase() === clean.toLowerCase()) return;

    // Filter out non-user syntax or URLs
    if (!/^[a-zA-Z0-9_]{1,25}$/.test(normHandle)) return;

    const key = normHandle.toLowerCase();
    const known = knownUsersRegistry.get(key);

    let finalAvatar = avatar;
    let finalAvatarSource = 'x-cdn';
    if (!finalAvatar && known?.profile_image_url_https) {
      finalAvatar = known.profile_image_url_https.replace('_normal.', '_400x400.');
    }
    if (!finalAvatar) {
      finalAvatar = `https://unavatar.io/x/${encodeURIComponent(normHandle)}`;
      finalAvatarSource = 'unavatar-fallback';
    } else if (finalAvatar.includes('twimg.com')) {
      finalAvatarSource = 'x-cdn';
    }

    const finalDisplayName = name || known?.name || normHandle;
    const finalBio = bio || known?.description || '';
    const finalId = idStr || known?.id_str || (known?.id ? String(known.id) : `x-${normHandle}`);

    const existing = interactionMap.get(key) || {
      id: finalId,
      username: normHandle,
      displayName: finalDisplayName,
      avatar: finalAvatar,
      avatarSource: finalAvatarSource,
      bio: finalBio,
      rawScore: 0,
      interactionCount: 0,
      interactionTypesSet: new Set(),
      seenEvidence: new Set(),
    };

    // Deduplicate exact interaction evidence per tweet to prevent double-counting across merged sources
    const evidenceKey = `${type}:${tweetId || 'any'}`;
    if (!existing.seenEvidence.has(evidenceKey)) {
      existing.seenEvidence.add(evidenceKey);
      existing.rawScore += weight;
      existing.interactionCount += 1;
      existing.interactionTypesSet.add(type);
    }

    if (finalDisplayName && (!existing.displayName || existing.displayName === normHandle)) {
      existing.displayName = finalDisplayName;
    }
    if (finalAvatarSource === 'x-cdn' && existing.avatarSource !== 'x-cdn') {
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

  for (const tweet of deduplicatedTweets) {
    const tId = tweet.id_str;

    // Reply: weight 3
    if (tweet.in_reply_to_screen_name) {
      recordInteraction(
        tweet.in_reply_to_screen_name,
        null,
        null,
        null,
        tweet.in_reply_to_user_id_str,
        3,
        'reply',
        tId
      );
    }

    // User mentions in entities: weight 2
    if (tweet.entities?.user_mentions && tweet.entities.user_mentions.length > 0) {
      for (const m of tweet.entities.user_mentions) {
        const screenName = m.screen_name || m.screenName;
        const name = m.name;
        const idStr = m.id_str || (m.id ? String(m.id) : null);
        recordInteraction(screenName, name, null, null, idStr, 2, 'mention', tId);
      }
    } else {
      // Text @mentions fallback: weight 1 (only when structured mentions are absent on this tweet)
      const text = tweet.text || '';
      const matches = text.match(/@([a-zA-Z0-9_]{1,25})/g) || [];
      for (const m of matches) {
        recordInteraction(m.slice(1), null, null, null, null, 1, 'mention', tId);
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
        'quote',
        tId
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
        'repost',
        tId
      );
    }
  }

  // 5. Sort descending by rawScore and normalize to 15-98
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
      connectionStrength: score,
      role: types.length ? `Interacted via ${types.join(' · ')}` : 'X Interaction',
      category: types.includes('reply') ? 'friends' : types.includes('quote') ? 'creators' : 'builders',
    };
  });

  const dataStatus = connections.length > 0 ? 'OK' : 'NO_PUBLIC_INTERACTIONS';
  const reason = connections.length > 0
    ? null
    : 'No usable public X interactions were available from the public sources.';

  return {
    profile,
    connections,
    sourcesUsed,
    isMockData: false,
    dataStatus,
    reason,
    fetchedAt: new Date().toISOString()
  };
}
