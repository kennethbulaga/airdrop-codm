'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { User } from '@supabase/supabase-js';
import { Header } from './Header';
import { HeroSection } from './HeroSection';
import { CategorySwitcher } from './CategorySwitcher';
import { SortSwitcher } from './SortSwitcher';
import { FilterChipBar } from './FilterChipBar';
import { PresetGrid } from './PresetGrid';
import { LightboxModal } from './LightboxModal';
import type { FilterState, ItemCategory, PostRecord, SortOption, UserSessionProfile } from '@/lib/types';

const SubmissionDrawer = dynamic(
  () => import('./SubmissionDrawer').then((mod) => mod.SubmissionDrawer),
  { ssr: false }
);

interface VaultFeedProps {
  initialPresets: PostRecord[];
  initialVotedIds?: string[];
  currentUser?: UserSessionProfile | null;
  currentUserId?: string | null;
  featuredPreset?: PostRecord;
}

const DEFAULT_FILTERS: FilterState = {
  category: 'graphics',
  sort: 'trending',
  device: null,
  mode: null,
  playstyle: null,
  grip: null,
  gyro: null,
  tier: null,
  fpsTarget: null,
  searchQuery: '',
};

export function VaultFeed({
  initialPresets,
  initialVotedIds = [],
  currentUser,
  currentUserId: currentUserIdProp,
}: VaultFeedProps) {
  const activeUserId = currentUser?.id ?? currentUserIdProp;
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [inspectedPost, setInspectedPost] = useState<PostRecord | null>(null);

  // Auto-open submission drawer upon returning from Google Auth (?submit=true)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('submit') === 'true') {
        setIsSubmitOpen(true);
        const url = new URL(window.location.href);
        url.searchParams.delete('submit');
        window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
      }
    }
  }, []);

  const uniquePlayers = useMemo(
    () => new Set(initialPresets.map((p) => p.creator_name)).size,
    [initialPresets]
  );
  const uniqueClans = useMemo(
    () => new Set(initialPresets.map((p) => p.team_name).filter(Boolean)).size,
    [initialPresets]
  );
  const uniqueDevices = useMemo(
    () => new Set(initialPresets.map((p) => p.device_name).filter(Boolean)).size,
    [initialPresets]
  );

  const handleSelectCategory = (cat: ItemCategory) => {
    // Retain universal filters, clear category-specific ones to prevent 0-results bug
    setFilters((prev) => ({
      ...prev,
      category: cat,
      playstyle: cat === 'graphics' ? null : prev.playstyle,
      grip: null,
      gyro: null,
      tier: null,
      fpsTarget: null,
    }));
  };

  const handleSelectSort = (sort: SortOption) => {
    setFilters((prev) => ({ ...prev, sort }));
  };

  const handleSearchChange = (searchQuery: string) => {
    setFilters((prev) => ({ ...prev, searchQuery }));
  };

  const handleResetFilters = () => {
    setFilters((prev) => ({
      ...DEFAULT_FILTERS,
      category: prev.category,
      sort: prev.sort,
    }));
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* 1. Header */}
      <Header onOpenSubmit={() => setIsSubmitOpen(true)} currentUser={currentUser} />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        {/* 2. ProSettings-Style Hero Section */}
        <HeroSection
          searchQuery={filters.searchQuery}
          onSearchChange={handleSearchChange}
          playerCount={uniquePlayers}
          clanCount={uniqueClans}
          presetCount={initialPresets.length}
          deviceCount={uniqueDevices}
        />

        {/* 3. Navigation Controls: Segmented Control & Sort Switcher */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
          <CategorySwitcher
            currentCategory={filters.category}
            onSelectCategory={handleSelectCategory}
          />
          <SortSwitcher currentSort={filters.sort} onSelectSort={handleSelectSort} />
        </div>

        {/* 4. Multi-Dimensional Filter Chip Bar */}
        <FilterChipBar
          filters={filters}
          onChangeFilters={setFilters}
          onResetFilters={handleResetFilters}
        />

        {/* 5. Preset Cards Grid */}
        <PresetGrid
          initialPosts={initialPresets}
          initialVotedIds={initialVotedIds}
          currentUserId={activeUserId}
          filters={filters}
          onResetFilters={handleResetFilters}
          onInspectImage={(post) => setInspectedPost(post)}
          onOpenSubmit={() => setIsSubmitOpen(true)}
        />
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-border/50 bg-card/40 py-8 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Airdrop • Tactical CODM Settings Vault for Garena & Global</p>
          <p className="font-mono text-[11px]">Season 8 Active Meta</p>
        </div>
      </footer>

      {/* 6. Dynamic Overlays */}
      <LightboxModal
        post={inspectedPost}
        isOpen={Boolean(inspectedPost)}
        onClose={() => setInspectedPost(null)}
        currentUserId={activeUserId}
      />

      <SubmissionDrawer
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}
