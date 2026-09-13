import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const hasUpstash =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

export const redis = hasUpstash
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Ephemeral in-memory cache to deny blocked requests at 0 Redis command cost
const ephemeralCache = new Map<string, number>();

/**
 * Rate limiter for sensitive authentication endpoints (OAuth callbacks, login triggers).
 * Sliding window: 10 requests per 60 seconds per IP address.
 */
export const authRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '60s'),
      prefix: 'airdrop:ratelimit:auth',
      ephemeralCache,
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
      ephemeralCache,
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
      ephemeralCache,
    })
  : null;

/**
 * Rate limiter for profile updates: 10 updates per 60 seconds.
 */
export const profileRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '60s'),
      prefix: 'airdrop:ratelimit:profile',
      ephemeralCache,
    })
  : null;

/**
 * Rate limiter for feedback submissions: 3 submissions per 60 seconds.
 */
export const feedbackRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '60s'),
      prefix: 'airdrop:ratelimit:feedback',
      ephemeralCache,
    })
  : null;

/**
 * Rate limiter for setup reports: 5 reports per 60 seconds.
 */
export const reportRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '60s'),
      prefix: 'airdrop:ratelimit:report',
      ephemeralCache,
    })
  : null;

