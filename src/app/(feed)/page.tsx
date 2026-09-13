import React, { Suspense } from 'react';
import Image from 'next/image';
import { VaultFeed } from './_components/VaultFeed';
import { getPresets, getUserVotedPresetIds, getCurrentUserProfile } from '@/lib/queries';
import {
  getWebSiteJsonLd,
  getWebApplicationJsonLd,
  getCollectionPageJsonLd,
  getFaqJsonLd,
} from '@/lib/seo-schema';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function VaultLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <div className="relative flex size-12 items-center justify-center rounded-[14px] overflow-hidden bg-black/5 shadow-md ring-1 ring-black/5 animate-pulse">
          <Image
            src="/airdrop-logo.webp"
            alt="Airdrop"
            width={48}
            height={48}
            className="size-full object-cover"
            priority
          />
        </div>
        <span className="font-mono text-xs tracking-wider">LOADING AIRDROP VAULT...</span>
      </div>
    </div>
  );
}

async function VaultFeedContainer({ searchParams }: PageProps) {
  // RSC read operations in parallel without waterfalls
  const [presets, votedIds, currentUser, resolvedParams] = await Promise.all([
    getPresets(),
    getUserVotedPresetIds(),
    getCurrentUserProfile(),
    searchParams,
  ]);

  const initialAutoOpen =
    resolvedParams?.feedback === 'true'
      ? 'feedback'
      : resolvedParams?.submit === 'true'
      ? 'submit'
      : null;

  const websiteSchema = getWebSiteJsonLd();
  const webAppSchema = getWebApplicationJsonLd();
  const collectionSchema = getCollectionPageJsonLd(presets);
  const faqSchema = getFaqJsonLd();

  return (
    <>
      {/* Search engine structured data (SSR rendered for Google Rich Snippets) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <VaultFeed
        initialPresets={presets}
        initialVotedIds={votedIds}
        currentUser={currentUser}
        initialAutoOpen={initialAutoOpen}
      />
    </>
  );
}

export default function HomePage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<VaultLoadingFallback />}>
      <VaultFeedContainer searchParams={searchParams} />
    </Suspense>
  );
}
