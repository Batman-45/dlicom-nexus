import { extractTimelineEntries, extractTweetFromEntry, normalizeTweet } from '../api/_lib/xPublic.js';
import { getOrFetchUserData } from '../api/_lib/cache.js';
import https from 'https';

function fetchRawSyndication(username) {
  return new Promise((resolve) => {
    const url = `https://syndication.twitter.com/srv/timeline-profile/screen-name/${encodeURIComponent(username)}`;
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout: 10000
    }, (res) => {
      let html = '';
      res.on('data', chunk => html += chunk);
      res.on('end', () => {
        try {
          const match = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/);
          if (!match) return resolve({ status: res.statusCode, pageProps: null });
          const json = JSON.parse(match[1]);
          resolve({ status: res.statusCode, pageProps: json.props?.pageProps });
        } catch (e) {
          resolve({ status: res.statusCode, error: e.message });
        }
      });
    }).on('error', (e) => resolve({ error: e.message }));
  });
}

async function diagnoseAccount(username) {
  console.log(`\n=============================================================`);
  console.log(`DIAGNOSTIC REPORT FOR: @${username}`);
  console.log(`=============================================================`);

  // 1. Raw Syndication Deep Dive
  const raw = await fetchRawSyndication(username);
  const rawItems = extractTimelineEntries(raw.pageProps);
  
  let repliesCount = 0;
  let mentionsCount = 0;
  let quotesCount = 0;
  let repostsCount = 0;
  const observedUsers = new Set();

  for (const entry of rawItems) {
    const tweet = extractTweetFromEntry(entry);
    if (!tweet) continue;
    const norm = normalizeTweet(tweet);
    if (!norm) continue;

    if (norm.user?.screen_name) {
      observedUsers.add(norm.user.screen_name.toLowerCase());
    }
    if (norm.in_reply_to_screen_name) {
      repliesCount++;
      observedUsers.add(norm.in_reply_to_screen_name.toLowerCase());
    }
    if (norm.entities?.user_mentions) {
      for (const m of norm.entities.user_mentions) {
        const sn = m.screen_name || m.screenName;
        if (sn) {
          mentionsCount++;
          observedUsers.add(sn.toLowerCase());
        }
      }
    }
    if (norm.quoted_tweet?.user) {
      quotesCount++;
      if (norm.quoted_tweet.user.screen_name) {
        observedUsers.add(norm.quoted_tweet.user.screen_name.toLowerCase());
      }
    }
    if (norm.retweeted_status?.user) {
      repostsCount++;
      if (norm.retweeted_status.user.screen_name) {
        observedUsers.add(norm.retweeted_status.user.screen_name.toLowerCase());
      }
    }
    const textMatches = (norm.text || '').match(/@([a-zA-Z0-9_]{1,25})/g) || [];
    for (const m of textMatches) {
      observedUsers.add(m.slice(1).toLowerCase());
    }
  }

  // Remove the author themselves from observed external interactions
  observedUsers.delete(username.toLowerCase());

  // 2. Full Cache & Profile Pipeline Execution
  let pipelineResult = null;
  let cacheStatus = 'UNKNOWN';
  let errorMsg = null;

  try {
    const res = await getOrFetchUserData(username);
    pipelineResult = res.data;
    cacheStatus = res.cacheStatus;
  } catch (err) {
    errorMsg = err.message;
  }

  const profile = pipelineResult?.profile;
  const connections = pipelineResult?.connections || [];
  const profileFound = !!(profile && (profile.displayName || profile.username));
  const tweetsFound = rawItems.length > 0;
  const dataSource = (cacheStatus === 'PERSISTENT-HIT' || cacheStatus === 'STALE') ? 'Cache' : 'X Syndication';

  console.log(`1.  Profile found?                  : ${profileFound ? `YES (@${profile?.username || username})` : 'NO'}`);
  console.log(`2.  Timeline/tweets found?           : ${tweetsFound ? 'YES' : 'NO'}`);
  console.log(`3.  Number of raw timeline items     : ${rawItems.length}`);
  console.log(`4.  Number of replies                : ${repliesCount}`);
  console.log(`5.  Number of mentions               : ${mentionsCount}`);
  console.log(`6.  Number of quotes                 : ${quotesCount}`);
  console.log(`7.  Number of reposts/retweets       : ${repostsCount}`);
  console.log(`8.  Number of unique observed users  : ${observedUsers.size}`);
  console.log(`9.  Number of final connections      : ${connections.length}`);
  console.log(`10. Supabase cache status            : ${cacheStatus}`);
  console.log(`11. Result came from                 : ${dataSource}`);
  if (pipelineResult?.dataStatus) {
    console.log(`    Data Status                      : ${pipelineResult.dataStatus}`);
  }
  if (pipelineResult?.reason) {
    console.log(`    Reason                           : ${pipelineResult.reason}`);
  }
  if (errorMsg) {
    console.log(`    Pipeline Error                   : ${errorMsg}`);
  }
  console.log(`-------------------------------------------------------------`);
  if (connections.length > 0) {
    console.log(`Sample connection: @${connections[0].username} (score: ${connections[0].interactionScore}, types: ${connections[0].interactionTypes?.join(', ')})`);
  }
}

async function main() {
  await diagnoseAccount('RohitDeshmane7');
  await diagnoseAccount('batman');
}

main();
