'use client';

import React, { useDeferredValue, useMemo, useState } from 'react';
import { PlusCircle, RotateCcw, SearchX } from 'lucide-react';
import { PresetCard } from './PresetCard';
import { Button } from '@/components/ui/button';
import { ReportDialog } from '@/components/ReportDialog';
import { DeleteDialog } from '@/components/DeleteDialog';
import type { PostRecord, FilterState } from '@/lib/types';
import { calculateTrendingScore } from '@/lib/algorithms';
import { togglePresetVoteAction } from '@/app/presets/actions';
import { toast } from 'sonner';

interface PresetGridProps {
  initialPosts: PostRecord[];
  initialVotedIds?: string[];
  currentUserId?: string | null;
  filters: FilterState;
  onResetFilters: () => void;
  onInspectImage: (post: PostRecord) => void;
  onOpenSubmit?: () => void;
}

export function PresetGrid({
  initialPosts,
  initialVotedIds = [],
  currentUserId,
  filters,
  onResetFilters,
  onInspectImage,
  onOpenSubmit,
}: PresetGridProps) {
  // Defer high-frequency search query to prevent typing latency
  const deferredSearch = useDeferredValue(filters.searchQuery);
  const [votedPostIds, setVotedPostIds] = useState<Set<string>>(
    () => new Set(initialVotedIds)
  );

  // Hoisted modal states to avoid duplicating dialog instances per card in DOM
  const [reportingPost, setReportingPost] = useState<PostRecord | null>(null);
  const [deletingPost, setDeletingPost] = useState<PostRecord | null>(null);

  const handleToggleVote = async (postId: string) => {
    // 1. Optimistic toggle
    setVotedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });

    // 2. Atomic Server Action
    const res = await togglePresetVoteAction(postId);
    if (!res.success) {
      // Revert optimistic update on failure
      setVotedPostIds((prev) => {
        const next = new Set(prev);
        if (next.has(postId)) {
          next.delete(postId);
        } else {
          next.add(postId);
        }
        return next;
      });
      toast.error(res.error || 'Failed to update vote.');
    }
  };

  // Intersecting multi-dimensional filter and sorting engine
  const filteredPosts = useMemo(() => {
    const isSensitivityOrHud = filters.category === 'sensitivity' || filters.category === 'hud';
    const isGraphics = filters.category === 'graphics';

    const results = initialPosts.filter((post) => {
      // 1. Mandatory Category Match
      if (post.category !== filters.category) return false;

      // 2. Universal Filters
      if (filters.device && post.device_type !== filters.device) return false;
      if (filters.mode && post.mode !== filters.mode) return false;

      // 3. Contextual Filters
      if (isSensitivityOrHud) {
        if (filters.grip && post.grip !== filters.grip) return false;
        if (filters.gyro !== null && post.gyro !== filters.gyro) return false;
      } else if (isGraphics) {
        if (filters.graphicQuality && post.graphic_quality !== filters.graphicQuality) return false;
        if (filters.fpsTarget && post.fps_target !== filters.fpsTarget) return false;
      }

      // 4. Normalized Search Query
      if (deferredSearch.trim() !== '') {
        const q = deferredSearch.toLowerCase().trim();
        const matchesQuery =
          post.creator_name.toLowerCase().includes(q) ||
          (post.team_name?.toLowerCase().includes(q) ?? false) ||
          (post.playstyle?.toLowerCase().includes(q) ?? false) ||
          (post.social_handle?.toLowerCase().includes(q) ?? false) ||
          post.code.toLowerCase().includes(q) ||
          (post.device_name?.toLowerCase().includes(q) ?? false);

        if (!matchesQuery) return false;
      }

      return true;
    });

    // Sort Ordering (precompute scores in O(N) instead of O(N log N) during sort)
    if (filters.sort === 'trending') {
      const scoreMap = new Map(
        results.map((p) => [p.id, calculateTrendingScore(p.upvotes, p.created_at)])
      );
      return [...results].sort((a, b) => (scoreMap.get(b.id) ?? 0) - (scoreMap.get(a.id) ?? 0));
    }
    if (filters.sort === 'top') {
      return [...results].sort((a, b) => b.upvotes - a.upvotes);
    }
    if (filters.sort === 'latest') {
      return [...results].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    return results;
  }, [initialPosts, filters, deferredSearch]);

  const categoryLabel =
    filters.category === 'hud'
      ? 'HUD'
      : filters.category === 'graphics'
      ? 'Graphics'
      : 'Sensitivity';

  return (
    <div className="flex flex-col gap-4">
      {/* Accessible Section Heading for Screen Readers & Search Crawlers */}
      <h2 className="sr-only">
        CODM Season 8 Battle Royale Community Setups, HUD Codes &amp; Sensitivity Presets
      </h2>

      {/* Results Count Header */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          Showing <strong className="text-foreground font-mono tabular-nums">{filteredPosts.length}</strong>{' '}
          {filteredPosts.length === 1 ? 'setup' : 'setups'}
        </span>
        <span className="font-medium text-[11px]">
          Category: <span className="text-foreground font-semibold">{categoryLabel}</span>
        </span>
      </div>

      {/* Grid of cards */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" style={{ contentVisibility: 'auto' }}>
          {filteredPosts.map((post) => (
            <PresetCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              hasVoted={votedPostIds.has(post.id)}
              onToggleVote={handleToggleVote}
              onInspectImage={onInspectImage}
              onRequestReport={(p) => setReportingPost(p)}
              onRequestDelete={(p) => setDeletingPost(p)}
            />
          ))}
        </div>
      ) : initialPosts.length === 0 ? (
        /* Empty Vault State */
        <div className="flex flex-col items-center justify-center rounded-[24px] border border-black/[0.06] bg-white p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-[#0071E3]/10 text-[#0071E3] mb-3.5 shadow-sm">
            <PlusCircle className="size-7 stroke-[2]" />
          </div>
          <h3 className="text-lg font-bold font-heading text-[#1D1D1F]">The vault is waiting for its first setup</h3>
          <p className="mt-1.5 max-w-md text-xs sm:text-sm text-[#6E6E73] leading-relaxed">
            Be the first player to share your sensitivity code, HUD layout, or graphics configuration with the community.
          </p>
          {onOpenSubmit && (
            <Button
              size="sm"
              onClick={onOpenSubmit}
              className="mt-5 gap-2 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold shadow-apple-pill min-h-[40px] px-5"
            >
              <PlusCircle className="size-4" />
              <span>Share Setup</span>
            </Button>
          )}
        </div>
      ) : (
        /* Filtered Empty State */
        <div className="flex flex-col items-center justify-center rounded-[24px] border border-black/[0.06] bg-white p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#F2F2F7] text-[#86868B] mb-3 shadow-inner">
            <SearchX className="size-6" />
          </div>
          <h3 className="text-base font-bold font-heading text-[#1D1D1F]">No setups found</h3>
          <p className="mt-1 max-w-sm text-xs text-[#6E6E73]">
            No configurations match your current filter combination. Try adjusting or clearing your active filters.
          </p>
          <Button
            size="sm"
            onClick={onResetFilters}
            className="mt-4 gap-1.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold shadow-apple-pill min-h-[38px] px-4"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset filters</span>
          </Button>
        </div>
      )}

      {/* Single Hoisted Dialog Instances */}
      {deletingPost && (
        <DeleteDialog
          presetId={deletingPost.id}
          creatorName={deletingPost.creator_name}
          isOpen={Boolean(deletingPost)}
          onClose={() => setDeletingPost(null)}
        />
      )}

      {reportingPost && (
        <ReportDialog
          presetId={reportingPost.id}
          creatorName={reportingPost.creator_name}
          isOpen={Boolean(reportingPost)}
          onClose={() => setReportingPost(null)}
        />
      )}
    </div>
  );
}
