'use client';

import React, { memo, useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  Eye,
  Flag,
  Heart,
  Smartphone,
  Tablet,
  Trash2,
} from 'lucide-react';
import { copyToClipboard, triggerHaptic } from '@/lib/clipboard';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { PostRecord } from '@/lib/types';
import { YouTubeIcon, TikTokIcon, FacebookIcon } from './SocialIcons';
import { PlaystyleBadge } from './PlaystyleBadge';
import { ReportDialog } from '@/components/ReportDialog';
import { DeleteDialog } from '@/components/DeleteDialog';

interface PresetCardProps {
  post: PostRecord;
  currentUserId?: string | null;
  hasVoted?: boolean;
  onToggleVote?: (postId: string) => void;
  onInspectImage?: (post: PostRecord) => void;
}

export const PresetCard = memo(function PresetCard({
  post,
  currentUserId,
  hasVoted = false,
  onToggleVote,
  onInspectImage,
}: PresetCardProps) {
  const [copied, setCopied] = useState(false);
  const [localVoted, setLocalVoted] = useState(hasVoted);
  const [localUpvotes, setLocalUpvotes] = useState(post.upvotes);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const isOwner = Boolean(currentUserId && post.user_id && post.user_id === currentUserId);

  const handleCopy = async () => {
    const success = await copyToClipboard(post.code);
    if (success) {
      setCopied(true);
      toast.custom(() => (
        <div className="flex items-center gap-3 rounded-full bg-white/95 px-4 py-2.5 text-[#1D1D1F] shadow-[0_12px_32px_rgba(0,0,0,0.15)] border border-black/10 backdrop-blur-xl">
          <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
            <Check className="size-3.5 stroke-[3]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold">{post.creator_name}&apos;s code copied!</span>
            <span className="font-mono text-[10px] text-[#86868B]">{post.code}</span>
          </div>
          <span className="ml-2 rounded-full bg-[#0071E3]/10 px-2 py-0.5 font-mono text-[9px] font-bold text-[#0071E3]">
            1-TAP
          </span>
        </div>
      ));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleVote = () => {
    const nextVoted = !localVoted;
    setLocalVoted(nextVoted);
    const newVotes = nextVoted ? localUpvotes + 1 : Math.max(0, localUpvotes - 1);
    setLocalUpvotes(newVotes);
    onToggleVote?.(post.id);

    if (nextVoted) {
      triggerHaptic(12);
      toast.custom(() => (
        <div className="flex items-center gap-3 rounded-full bg-white/95 px-4 py-2.5 text-[#1D1D1F] shadow-[0_12px_32px_rgba(0,0,0,0.15)] border border-black/10 backdrop-blur-xl">
          <div className="flex size-6 items-center justify-center rounded-full bg-[#FF2D55]/15 text-[#FF2D55] shrink-0">
            <Heart className="size-3.5 fill-[#FF2D55] text-[#FF2D55]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-[#1D1D1F]">
              Sent +1 Charisma to {post.creator_name}!
            </span>
            <span className="font-mono text-[10px] text-[#6E6E73] tabular-nums">
              {newVotes.toLocaleString()} community charisma
            </span>
          </div>
          <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-[#FF2D55] px-2.5 py-0.5 font-mono text-[10px] font-bold text-white shadow-sm shrink-0">
            <Heart className="size-2.5 fill-white text-white stroke-[2]" />
            <span>+1</span>
          </span>
        </div>
      ));
    } else {
      triggerHaptic(6);
      toast.custom(() => (
        <div className="flex items-center gap-2.5 rounded-full bg-white/95 px-4 py-2 text-[#1D1D1F] shadow-[0_12px_32px_rgba(0,0,0,0.12)] border border-black/10 backdrop-blur-xl">
          <div className="flex size-5 items-center justify-center rounded-full bg-black/5 text-[#86868B]">
            <Heart className="size-3 stroke-[2]" />
          </div>
          <span className="text-xs font-medium text-[#6E6E73]">
            Removed charisma for {post.creator_name}
          </span>
        </div>
      ));
    }
  };

  const isTablet = post.device_type === 'iPad / Tablet';

  return (
    <div
      className="group relative flex flex-col justify-between overflow-hidden rounded-[22px] border border-black/[0.06] bg-white p-5 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04),0_2px_6px_-1px_rgba(0,0,0,0.02)] transition-all duration-200 ease-out hover:-translate-y-1 hover:border-black/[0.14] hover:shadow-[0_14px_36px_-4px_rgba(0,0,0,0.08)] hover:z-10"
    >

      <div className="flex flex-col gap-3.5 relative z-10">
        {/* App Store Product Top Bar - Creator Identity & Ownership/Moderation Action */}
        <div className="flex items-start justify-between gap-2.5 min-w-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Creator App Squircle Icon with Hairline Ring */}
            <div className="relative flex size-11 items-center justify-center rounded-[14px] overflow-hidden bg-gradient-to-br from-[#0071E3] to-[#0055b3] text-white font-bold text-base shadow-[0_2px_8px_rgba(0,113,227,0.2)] ring-1 ring-black/5 shrink-0">
              {post.creator_avatar_url ? (
                <img
                  src={post.creator_avatar_url}
                  alt={post.creator_name}
                  className="size-full object-cover"
                />
              ) : (
                <span>{post.creator_name.charAt(0)}</span>
              )}
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Authentic Esports Clan Tag Badge */}
                {post.team_name && (
                  <span className="inline-flex items-center rounded-md bg-[#0071E3]/10 px-2 py-0.5 font-mono text-[11px] font-bold text-[#0071E3] tracking-tight border border-[#0071E3]/20">
                    {post.team_name}
                  </span>
                )}
                <span className="font-heading text-sm font-bold tracking-tight text-[#1D1D1F]">
                  {post.creator_name}
                </span>
              </div>

              {/* Creator Social Link Pill */}
              {post.social_platform && post.social_url && (
                <div className="mt-1 flex items-center">
                  <a
                    href={post.social_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="group/social inline-flex items-center gap-1 rounded-full bg-[#F2F2F7] hover:bg-[#E5E5EA] px-2.5 py-0.5 text-[10px] font-medium text-[#1D1D1F] transition-colors"
                    aria-label={`${post.creator_name} on ${post.social_platform}`}
                  >
                    {post.social_platform === 'TikTok' ? (
                      <TikTokIcon className="size-2.5 text-[#1D1D1F]" />
                    ) : post.social_platform === 'YouTube' ? (
                      <YouTubeIcon className="size-2.5 text-[#FF0000]" />
                    ) : (
                      <FacebookIcon className="size-2.5 text-[#1877F2]" />
                    )}
                    <span className="truncate max-w-[130px] font-medium">
                      {post.social_handle || post.social_platform}
                    </span>
                    <ExternalLink className="size-2 text-[#86868B] group-hover/social:text-[#0071E3]" />
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isOwner ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleteOpen(true);
                }}
                className="flex size-8 items-center justify-center rounded-full text-[#86868B] hover:text-red-600 hover:bg-red-500/10 border border-black/[0.08] bg-[#F2F2F7] transition-colors"
                title="Delete your setup"
                aria-label="Delete setup"
              >
                <Trash2 className="size-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsReportOpen(true);
                }}
                className="flex size-8 items-center justify-center rounded-full text-[#6E6E73] hover:text-red-500 hover:bg-red-500/10 border border-black/[0.08] bg-[#F2F2F7] transition-colors"
                title="Report inappropriate content"
                aria-label="Report preset"
              >
                <Flag className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Hardware & Specs Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs">
          {post.category !== 'graphics' && post.playstyle && (
            <PlaystyleBadge playstyle={post.playstyle} />
          )}

          <span className="inline-flex items-center gap-1 rounded-md bg-[#F2F2F7] px-2.5 py-0.5 text-[11px] font-medium text-[#1D1D1F]">
            {isTablet ? <Tablet className="size-3 text-[#86868B]" /> : <Smartphone className="size-3 text-[#86868B]" />}
            {post.device_name || post.device_type}
          </span>

          {post.grip && (
            <span className="rounded-md bg-[#F2F2F7] px-2.5 py-0.5 text-[11px] font-medium text-[#1D1D1F]">
              {post.grip}
            </span>
          )}

          {post.gyro !== null && post.gyro !== undefined && (
            <span className="rounded-md bg-[#F2F2F7] px-2.5 py-0.5 text-[11px] font-medium text-[#1D1D1F]">
              {post.gyro ? 'Gyro ON' : 'Gyro OFF'}
            </span>
          )}

          {post.fps_target && (
            <span className="rounded-md bg-emerald-500/10 text-emerald-700 px-2.5 py-0.5 text-[11px] font-semibold">
              {post.fps_target}
            </span>
          )}
        </div>

        {/* Custom Player Note / Banter (Optional) */}
        {(post.description || post.layout_highlight) && (
          <div className="rounded-[12px] bg-[#F2F2F7]/70 px-3 py-2 border border-black/[0.04]">
            <p className="text-xs text-[#1D1D1F] font-medium leading-snug line-clamp-2 italic">
              &ldquo;{post.description || post.layout_highlight}&rdquo;
            </p>
          </div>
        )}

        {/* HUD / Graphics Screenshot Thumbnail (Only when screenshot is available) */}
        {(post.category === 'hud' || post.category === 'graphics') && post.image_url && (
          <div
            onClick={() => onInspectImage?.(post)}
            className="group/img relative aspect-video w-full cursor-pointer overflow-hidden rounded-[16px] border border-black/[0.06] bg-black/5"
          >
            <img
              src={post.image_url}
              alt={`${post.creator_name}'s configuration`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover/img:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity">
              <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#1D1D1F] shadow-sm backdrop-blur-md">
                <Eye className="size-3.5" />
                Inspect Layout
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Card Action Footbar */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-black/[0.05] pt-3">
        {/* Apple Capsule Primary Action Button (Bottom Left) */}
        <button
          type="button"
          onClick={handleCopy}
          className={`group/copy flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-[transform,background-color,color,box-shadow] duration-150 min-h-[36px] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]/50 ${
            copied
              ? 'bg-[#34C759] text-white shadow-[0_2px_8px_rgba(52,199,89,0.25)]'
              : 'bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#0071E3]'
          }`}
          aria-label={`Copy share code for ${post.creator_name}`}
        >
          {copied ? (
            <>
              <Check className="size-3.5 stroke-[3] text-white" />
              <span className="tracking-tight">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5 stroke-[2.5] text-[#0071E3] transition-transform group-hover/copy:scale-110" />
              <span className="tracking-tight">Copy Code</span>
            </>
          )}
        </button>

        {/* Charisma Heart Capsule Button (Bottom Right) */}
        <button
          type="button"
          onClick={handleVote}
          className={`group/vote flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-[transform,background-color,border-color,box-shadow,color] duration-150 min-h-[36px] shrink-0 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2D55]/50 ${
            localVoted
              ? 'bg-gradient-to-r from-[#FF2D55] to-[#E02447] text-white shadow-[0_3px_12px_rgba(255,45,85,0.35)] ring-2 ring-[#FF2D55]/20'
              : 'bg-white border border-black/[0.1] text-[#1D1D1F] hover:border-[#FF2D55]/40 hover:bg-[#FF2D55]/5 hover:text-[#FF2D55] shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
          }`}
          aria-label={`Give Charisma to ${post.creator_name}, current charisma: ${localUpvotes}`}
        >
          <Heart
            className={`size-3.5 stroke-[2.5] transition-transform duration-200 group-hover/vote:scale-125 ${
              localVoted
                ? 'fill-white text-white'
                : 'text-[#FF2D55] group-hover/vote:fill-[#FF2D55]/20'
            }`}
          />
          <span className="tracking-tight font-semibold">
            {localVoted ? 'Liked' : 'Like'}
          </span>
          <span
            className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] tabular-nums font-bold transition-colors ${
              localVoted
                ? 'bg-white/20 text-white'
                : 'bg-[#F2F2F7] text-[#1D1D1F] group-hover/vote:bg-[#FF2D55]/10 group-hover/vote:text-[#FF2D55]'
            }`}
          >
            {localUpvotes.toLocaleString()}
          </span>
        </button>
      </div>

      {isOwner && (
        <DeleteDialog
          presetId={post.id}
          creatorName={post.creator_name}
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
        />
      )}

      <ReportDialog
        presetId={post.id}
        creatorName={post.creator_name}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
});
