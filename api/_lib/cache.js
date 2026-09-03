import NodeCache from 'node-cache';

// 10-minute cache TTL (600s) for warm serverless invocations
export const cache = new NodeCache({ stdTTL: 600, checkperiod: 60 });
