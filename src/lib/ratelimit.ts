import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const hasUpstash =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

const redis = hasUpstash
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

/**
 * Rate limiter for sensitive authentication endpoints (OAuth callbacks, login triggers).
 * Sliding window: 10 requests per 60 seconds per IP address.
 */
export const authRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '60s'),
      prefix: 'airdrop:ratelimit:auth',
    })
  : null;

/**
 * Rate limiter for setup submissions: 5 submissions per 60 seconds.
 */
export const submitRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '60s'),
      prefix: 'airdrop:ratelimit:submit',
    })
  : null;

/**
 * Rate limiter for voting: 15 votes per 10 seconds.
 */
export const voteRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(15, '10s'),
      prefix: 'airdrop:ratelimit:vote',
    })
  : null;
