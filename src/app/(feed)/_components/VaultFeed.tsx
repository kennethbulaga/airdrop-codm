'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Header } from './Header';
import { HeroSection } from './HeroSection';
import { CategorySwitcher } from './CategorySwitcher';
import { SortSwitcher } from './SortSwitcher';
import { FilterChipBar } from './FilterChipBar';
import { PresetGrid } from './PresetGrid';
import type { FilterState, ItemCategory, PostRecord, SortOption, UserSessionProfile } from '@/lib/types';

const LightboxModal = dynamic(
  () => import('./LightboxModal').then((mod) => mod.LightboxModal),
  { ssr: false }
);

const OnboardingModal = dynamic(
  () => import('./OnboardingModal').then((mod) => mod.OnboardingModal),
  { ssr: false }
);

const SubmissionDrawer = dynamic(
  () => import('./SubmissionDrawer').then((mod) => mod.SubmissionDrawer),
  { ssr: false }
);

const FeedbackModal = dynamic(
  () => import('./FeedbackModal').then((mod) => mod.FeedbackModal),
  { ssr: false }
);

const VaultBriefingModal = dynamic(
  () => import('./VaultBriefingModal').then((mod) => mod.VaultBriefingModal),
  { ssr: false }
);

const StreamerVaultModal = dynamic(
  () => import('./StreamerVaultModal').then((mod) => mod.StreamerVaultModal),
  { ssr: false }
);

interface VaultFeedProps {
  initialPresets: PostRecord[];
  initialVotedIds?: string[];
  currentUser?: UserSessionProfile | null;
  currentUserId?: string | null;
  featuredPreset?: PostRecord;
  initialAutoOpen?: 'submit' | 'feedback' | null;
}

const DEFAULT_FILTERS: FilterState = {
  category: 'graphics',
  sort: 'trending',
  device: null,
  mode: null,
  playstyle: null,
  grip: null,
  gyro: null,
  graphicQuality: null,
  fpsTarget: null,
  searchQuery: '',
};

export function VaultFeed({
  initialPresets,
  initialVotedIds = [],
  currentUser,
  currentUserId: currentUserIdProp,
  initialAutoOpen,
}: VaultFeedProps) {
  const [localUser, setLocalUser] = useState(currentUser ?? null);
  const [prevUser, setPrevUser] = useState(currentUser);
  if (currentUser !== undefined && currentUser !== prevUser) {
    setPrevUser(currentUser);
    setLocalUser(currentUser);
  }

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(
    initialAutoOpen === 'submit' && Boolean(currentUser && !currentUser.hasCompletedOnboarding)
  );

  const activeUserId = localUser?.id ?? currentUser?.id ?? currentUserIdProp;
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isSubmitOpen, setIsSubmitOpen] = useState(
    initialAutoOpen === 'submit' && (!currentUser || Boolean(currentUser.hasCompletedOnboarding))
  );
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(initialAutoOpen === 'feedback');
  const [isBriefingOpen, setIsBriefingOpen] = useState(false);
  const [isStreamerModalOpen, setIsStreamerModalOpen] = useState(false);
  const [inspectedPost, setInspectedPost] = useState<PostRecord | null>(null);

  const handleOpenSubmit = () => {
    if (!localUser) {
      setIsSubmitOpen(true);
      return;
    }
    if (!localUser.hasCompletedOnboarding) {
      setIsOnboardingOpen(true);
      return;
    }
    setIsSubmitOpen(true);
  };

  // Clean up URL query parameters (?submit=true or ?feedback=true) from address bar
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    const hasSubmit = url.searchParams.get('submit') === 'true';
    const hasFeedback = url.searchParams.get('feedback') === 'true';

    if (hasSubmit || hasFeedback) {
      url.searchParams.delete('submit');
      url.searchParams.delete('feedback');
      const cleanPath =
        url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : '');
      window.history.replaceState({}, '', cleanPath);
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
      playstyle: null,
      grip: null,
      gyro: null,
      graphicQuality: null,
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
      <Header
        onOpenSubmit={handleOpenSubmit}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        onOpenBriefing={() => setIsBriefingOpen(true)}
        currentUser={localUser}
        onProfileUpdated={(updated) => setLocalUser(updated)}
      />

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
            onOpenStreamers={() => setIsStreamerModalOpen(true)}
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
          onOpenSubmit={handleOpenSubmit}
        />
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-border/50 bg-card/40 py-8 text-xs text-muted-foreground">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/airdrop-logo.webp"
              alt="Airdrop"
              width={20}
              height={20}
              className="size-5 rounded-[6px] object-cover shadow-2xs"
            />
            <p>© 2026 Airdrop • Tactical CODM Settings Vault for Garena &amp; Global</p>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-medium text-[#6E6E73]">
            <button
              type="button"
              onClick={() => setIsBriefingOpen(true)}
              className="hover:text-[#0071E3] transition-colors cursor-pointer"
            >
              Vault Briefing
            </button>
            <span className="text-black/15">•</span>
            <button
              type="button"
              onClick={() => setIsFeedbackOpen(true)}
              className="hover:text-[#0071E3] transition-colors cursor-pointer"
            >
              Community Feedback
            </button>
            <span className="text-black/15">•</span>
            <span className="font-mono text-[#86868B]">Season 8 Active Meta</span>
          </div>
        </div>
      </footer>

      {/* 6. Dynamic Overlays */}
      {inspectedPost && (
        <LightboxModal
          post={inspectedPost}
          isOpen={Boolean(inspectedPost)}
          onClose={() => setInspectedPost(null)}
          currentUserId={activeUserId}
        />
      )}

      {isSubmitOpen && (
        <SubmissionDrawer
          isOpen={isSubmitOpen}
          onClose={() => setIsSubmitOpen(false)}
          currentUser={localUser}
        />
      )}

      {isOnboardingOpen && localUser && (
        <OnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
          currentUser={localUser}
          onComplete={(updated) => {
            setLocalUser(updated);
            setIsOnboardingOpen(false);
            setIsSubmitOpen(true);
          }}
        />
      )}

      {isFeedbackOpen && (
        <FeedbackModal
          isOpen={isFeedbackOpen}
          onClose={() => setIsFeedbackOpen(false)}
          currentUser={localUser}
        />
      )}

      {isBriefingOpen && (
        <VaultBriefingModal
          isOpen={isBriefingOpen}
          onClose={() => setIsBriefingOpen(false)}
          onOpenFeedback={() => setIsFeedbackOpen(true)}
        />
      )}

      {isStreamerModalOpen && (
        <StreamerVaultModal
          isOpen={isStreamerModalOpen}
          onClose={() => setIsStreamerModalOpen(false)}
          onOpenFeedback={() => setIsFeedbackOpen(true)}
        />
      )}
    </div>
  );
}
