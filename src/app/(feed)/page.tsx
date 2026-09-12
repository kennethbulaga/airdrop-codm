import React, { Suspense } from 'react';
import { VaultFeed } from './_components/VaultFeed';
import { getPresets, getUserVotedPresetIds } from '@/lib/queries';
import { getCurrentUserProfile } from '@/app/auth/actions';

export const metadata = {
  title: 'Airdrop | CODM Battle Royale Community Settings Vault',
  description:
    'Sub-second discovery, multi-dimensional filtering, and 1-tap clipboard copying of CODM Season 8 Battle Royale community setups, HUD layouts, and sensitivity codes.',
};

export default async function HomePage() {
  // RSC read operations in parallel without waterfalls (async-parallel)
  const [presets, votedIds, currentUser] = await Promise.all([
    getPresets(),
    getUserVotedPresetIds(),
    getCurrentUserProfile(),
  ]);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="font-mono text-xs tracking-wider">LOADING AIRDROP VAULT...</span>
          </div>
        </div>
      }
    >
      <VaultFeed
        initialPresets={presets}
        initialVotedIds={votedIds}
        currentUser={currentUser}
      />
    </Suspense>
  );
}
