/**
 * Airdrop Ranking Algorithms
 *
 * Implements the Hacker News / Reddit Gravity Time-Decay Formula:
 * Score = Upvotes / (AgeInHours + 2)^1.5
 *
 * This matches the Supabase PostgreSQL view `posts_with_decay` defined in the architecture blueprint.
 */

export function calculateTrendingScore(upvotes: number, createdAt: string): number {
  const postTime = new Date(createdAt).getTime();
  const now = Date.now();
  const hoursSinceCreation = Math.max(0, (now - postTime) / (1000 * 60 * 60));

  // Gravity exponent: 1.5, Buffer: 2 hours to normalize fresh submissions
  const gravity = 1.5;
  const buffer = 2;

  const score = upvotes / Math.pow(hoursSinceCreation + buffer, gravity);
  return Number(score.toFixed(4));
}
