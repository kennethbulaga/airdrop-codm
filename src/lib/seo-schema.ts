import type { PostRecord } from './types';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://airdropcodm.com');

/**
 * Generates Schema.org WebSite JSON-LD with Sitelinks Searchbox action.
 */
export function getWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: 'Airdrop',
    alternateName: ['Hotdrop', 'Hotdrop CODM', 'Airdrop CODM Vault'],
    url: SITE_URL,
    description:
      'Community settings vault for CODM Season 8 Battle Royale HUD codes, sensitivity curves, and graphics configurations.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generates Schema.org WebApplication JSON-LD indicating a free gaming utility.
 */
export function getWebApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': `${SITE_URL}/#webapp`,
    name: 'Airdrop CODM Settings Vault',
    applicationCategory: 'GameApplication',
    operatingSystem: 'iOS, iPadOS, Android, Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    description:
      'Sub-second discovery and 1-tap copying of Call of Duty: Mobile Battle Royale HUD codes, sensitivity curves, and graphics configurations for Garena and Global servers.',
    featureList: [
      '1-Tap In-Game Battle Royale Share Code Copying',
      'Multi-Dimensional Hardware Filtering (Phone, Tablet, 2-to-5+ Finger Grip, Gyroscope)',
      'Client-Side Lossless Canvas WebP Image Compression',
      'Community Charisma Heart System and Anti-Cheat Quarantine',
    ],
  };
}

/**
 * Generates Schema.org CollectionPage and ItemList JSON-LD for Google Carousels.
 */
export function getCollectionPageJsonLd(presets: PostRecord[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'CODM Season 8 Battle Royale Settings Vault',
    url: SITE_URL,
    description:
      'Trending CODM HUD codes, 4-finger claw setups, iPad sensitivity, and low-latency graphics presets shared by competitive players.',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: presets.length,
      itemListElement: presets.slice(0, 30).map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: `${post.creator_name} - CODM ${post.category.toUpperCase()} Setup`,
        description:
          post.description ||
          `${post.creator_name}'s CODM ${post.category} configuration for ${
            post.device_name || post.device_type
          } (${post.grip || 'Touch'} grip). Share code: ${post.code}`,
        url: `${SITE_URL}/#${post.id}`,
      })),
    },
  };
}

/**
 * Generates Schema.org FAQPage JSON-LD from authentic in-app briefings.
 */
export function getFaqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Airdrop?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Airdrop is a community vault for Call of Duty: Mobile Battle Royale settings. It offers sub-second discovery, multi-dimensional hardware filtering (Phone vs Tablet, 2-Finger to 5+ Finger, Gyroscope), and 1-tap clipboard copying of battle-tested settings.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do in-game CODM share codes work for Sensitivity and HUD?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'CODM allows players to export and import cloud layout strings. For Sensitivity, navigate to Settings → Sensitivity → Manage → Search tab to paste and preview. For HUDs, navigate to Settings → Controls → Custom Layout [Go] → Cloud Layout to import. Codes are compatible across both Garena and Global servers.',
        },
      },
      {
        '@type': 'Question',
        name: 'Why do competitive CODM players use Medium Graphics + Ultra Frame Rate?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Competitive BR players prioritize frame stability and thermal performance. Medium Graphics paired with Ultra (120 FPS) or Max (60 FPS) minimizes device overheating, eliminates frame-drops during intense final-circle gunfights, and maintains optimal visibility through smoke and dense foliage.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does Community Charisma work on Airdrop?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Tapping the heart awards +1 Charisma to the setup creator. Our trending algorithm evaluates copy frequency, Charisma votes, and recency to promote the most effective setups to the top without paid promotions.',
        },
      },
    ],
  };
}
