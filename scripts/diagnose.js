import {
  fetchSyndicationSource,
  fetchPublicWebSource
} from '../api/_lib/xPublic.js';
import { getOrFetchUserData } from '../api/_lib/cache.js';

async function diagnoseAccount(username) {
  const clean = username.replace(/^@+/, '').trim();
  console.log(`\n=============================================================`);
  console.log(`ACCOUNT: @${clean}`);
  console.log(`=============================================================`);

  // 1. Probe Individual Sources for Raw Diagnostic Stats
  const [syndication, webProfile] = await Promise.all([
    fetchSyndicationSource(clean).catch(e => ({ error: e.message })),
    fetchPublicWebSource(clean).catch(e => ({ error: e.message }))
  ]);

  const rawSizes = [];
  let rawTimelineItemsCount = 0;
  const sourcesDetected = [];

  if (syndication && !syndication.error) {
    rawSizes.push(`Syndication: ${syndication.rawSize}b`);
    rawTimelineItemsCount += syndication.rawEntriesCount || 0;
    if (syndication.tweets?.length > 0) {
      sourcesDetected.push('X Syndication');
    } else {
      sourcesDetected.push('X Syndication (empty timeline)');
    }
  } else if (syndication?.error) {
    rawSizes.push(`Syndication: error (${syndication.error})`);
  }

  if (webProfile && !webProfile.error) {
    rawSizes.push(`Public Web: ${webProfile.rawSize}b`);
    sourcesDetected.push('Public Web Profile (x.com)');
  } else if (webProfile?.error) {
    rawSizes.push(`Public Web: error (${webProfile.error})`);
  }

  // 2. Full Cache & Pipeline Execution
  let pipelineResult = null;
  let cacheStatus = 'LIVE';
  let pipelineError = null;

  try {
    const res = await getOrFetchUserData(clean);
    pipelineResult = res.data;
    cacheStatus = res.cacheStatus;
  } catch (err) {
    pipelineError = err.message;
  }

  const profile = pipelineResult?.profile;
  const connections = pipelineResult?.connections || [];
  const profileFound = !!(profile && (profile.displayName || profile.username));
  const sourcesUsed = pipelineResult?.sourcesUsed || sourcesDetected;

  // Compute interaction breakdown across connections
  let repliesCount = 0;
  let mentionsCount = 0;
  let quotesCount = 0;
  let repostsCount = 0;

  for (const c of connections) {
    const types = c.interactionTypes || [];
    if (types.includes('reply')) repliesCount++;
    if (types.includes('mention')) mentionsCount++;
    if (types.includes('quote')) quotesCount++;
    if (types.includes('repost')) repostsCount++;
  }

  // Count normalized posts available across sources
  const syndTweets = syndication?.tweets?.length || 0;
  let webTweetsCount = 0;
  if (webProfile?.relayRecords) {
    for (const k of Object.keys(webProfile.relayRecords)) {
      if (webProfile.relayRecords[k]?.__typename === 'Tweet') {
        webTweetsCount++;
      }
    }
  }
  const normalizedPosts = syndTweets + webTweetsCount;
  const publicTimelineAvailable = normalizedPosts > 0;

  console.log(`Profile found               : ${profileFound ? `YES (@${profile?.username || clean}, "${profile?.displayName || clean}")` : 'NO'}`);
  console.log(`Public timeline available   : ${publicTimelineAvailable ? 'YES' : 'NO'}`);
  console.log(`Source(s) used              : ${sourcesUsed.join(', ')}`);
  console.log(`Raw response size           : ${rawSizes.join(' | ')}`);
  console.log(`Raw timeline items          : ${rawTimelineItemsCount}`);
  console.log(`Normalized posts            : ${normalizedPosts}`);
  console.log(`Replies                     : ${repliesCount}`);
  console.log(`Mentions                    : ${mentionsCount}`);
  console.log(`Quotes                      : ${quotesCount}`);
  console.log(`Reposts                     : ${repostsCount}`);
  console.log(`Unique users                : ${connections.length}`);
  console.log(`Final connections           : ${connections.length}`);
  console.log(`Cache status                : ${cacheStatus}`);
  console.log(`Data status                 : ${pipelineResult?.dataStatus || (pipelineError ? 'ERROR' : 'UNKNOWN')}`);
  console.log(`Reason                      : ${pipelineResult?.reason || pipelineError || 'None'}`);

  if (connections.length > 0) {
    console.log(`-------------------------------------------------------------`);
    console.log(`Top 3 Connections:`);
    for (const c of connections.slice(0, 3)) {
      console.log(`  • @${c.username} (${c.displayName}) - Score: ${c.interactionScore} [${c.interactionTypes.join(', ')}]`);
    }
  }
}

async function main() {
  await diagnoseAccount('RohitDeshmane7');
  await diagnoseAccount('batman');
  await diagnoseAccount('karpathy');
}

main();
