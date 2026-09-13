'use client';

import React, { memo, useState } from 'react';
import {
  Check,
  ChevronRight,
  Compass,
  Copy,
  ExternalLink,
  Eye,
  Flag,
  Hand,
  Heart,
  Info,
  SlidersHorizontal,
  Smartphone,
  Tablet,
  Trash2,
  Zap,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import Image from 'next/image';
import { copyToClipboard, triggerHaptic } from '@/lib/clipboard';
import { toast } from 'sonner';
import type { PostRecord } from '@/lib/types';
import { YouTubeIcon, TikTokIcon, FacebookIcon } from './SocialIcons';

interface PresetCardProps {
  post: PostRecord;
  currentUserId?: string | null;
  hasVoted?: boolean;
  onToggleVote?: (postId: string) => void;
  onInspectImage?: (post: PostRecord) => void;
  onRequestReport?: (post: PostRecord) => void;
  onRequestDelete?: (post: PostRecord) => void;
}

export const PresetCard = memo(function PresetCard({
  post,
  currentUserId,
  hasVoted = false,
  onToggleVote,
  onInspectImage,
  onRequestReport,
  onRequestDelete,
}: PresetCardProps) {
  const [copied, setCopied] = useState(false);
  const [localVoted, setLocalVoted] = useState(hasVoted);
  const [localUpvotes, setLocalUpvotes] = useState(post.upvotes);

  const isOwner = Boolean(currentUserId && post.user_id && post.user_id === currentUserId);

  const handleCopy = async () => {
    const success = await copyToClipboard(post.code);
    if (success) {
      setCopied(true);
      toast.custom(() => (
        <div className="flex items-center gap-3 rounded-2xl bg-white/95 px-4 py-2.5 text-[#1D1D1F] shadow-[0_12px_32px_rgba(0,0,0,0.15)] border border-black/10 backdrop-blur-xl max-w-sm">
          <div className="flex size-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 shrink-0">
            <Check className="size-3.5 stroke-[3]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold truncate">{post.creator_name}&apos;s code copied!</span>
            <span className="text-[10px] text-[#6E6E73] truncate">Ready to paste into CODM</span>
          </div>
          <span className="ml-auto rounded-full bg-[#0071E3]/10 px-2 py-0.5 font-mono text-[9px] font-bold text-[#0071E3] shrink-0">
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
      className="group relative flex flex-col justify-between overflow-hidden rounded-[22px] border border-black/[0.06] bg-white p-4 sm:p-5 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.04),0_2px_6px_-1px_rgba(0,0,0,0.02)] transition-all duration-200 ease-out hover:-translate-y-1 hover:border-black/[0.14] hover:shadow-[0_14px_36px_-4px_rgba(0,0,0,0.08)] hover:z-10"
    >

      <div className="flex flex-col gap-3.5 relative z-10">
        {/* App Store Product Top Bar - Creator Identity & Ownership/Moderation Action */}
        <div className="flex items-start justify-between gap-2.5 min-w-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Creator App Squircle Icon with Hairline Ring */}
            <div className="relative flex size-11 items-center justify-center rounded-[14px] overflow-hidden bg-gradient-to-br from-[#0071E3] to-[#0055b3] text-white font-bold text-base shadow-[0_2px_8px_rgba(0,113,227,0.2)] ring-1 ring-black/5 shrink-0">
              {post.creator_avatar_url ? (
                <Image
                  src={post.creator_avatar_url}
                  alt={post.creator_name}
                  width={44}
                  height={44}
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
                <h3 className="font-heading text-sm font-bold tracking-tight text-[#1D1D1F]">
                  {post.creator_name}
                </h3>
              </div>

              {/* Creator Social Link Badges (YouTube, TikTok, Facebook) */}
              {(post.youtube_url || post.tiktok_url || post.facebook_url || (post.social_platform && post.social_url)) && (
                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                  {post.youtube_url && (
                    <a
                      href={post.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="group/social inline-flex items-center gap-1 rounded-full bg-[#FF0000]/[0.08] hover:bg-[#FF0000]/[0.15] border border-[#FF0000]/25 px-2 py-0.5 text-[10px] font-semibold text-[#C40000] dark:text-[#FF4E45] transition-all duration-150 active:scale-[0.96] shadow-2xs"
                      aria-label={`${post.creator_name} on YouTube`}
                    >
                      <YouTubeIcon className="size-2.5 shrink-0" />
                      <span>YouTube</span>
                      <ExternalLink className="size-2 opacity-60 group-hover/social:opacity-100 transition-opacity" />
                    </a>
                  )}

                  {post.tiktok_url && (
                    <a
                      href={post.tiktok_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="group/social inline-flex items-center gap-1 rounded-full bg-black/[0.05] hover:bg-black/10 border border-black/10 px-2 py-0.5 text-[10px] font-semibold text-[#1D1D1F] transition-all duration-150 active:scale-[0.96] shadow-2xs"
                      aria-label={`${post.creator_name} on TikTok`}
                    >
                      <TikTokIcon className="size-2.5 shrink-0" />
                      <span>TikTok</span>
                      <ExternalLink className="size-2 opacity-60 group-hover/social:opacity-100 transition-opacity" />
                    </a>
                  )}

                  {post.facebook_url && (
                    <a
                      href={post.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="group/social inline-flex items-center gap-1 rounded-full bg-[#1877F2]/[0.08] hover:bg-[#1877F2]/[0.15] border border-[#1877F2]/25 px-2 py-0.5 text-[10px] font-semibold text-[#125EC7] dark:text-[#4599FF] transition-all duration-150 active:scale-[0.96] shadow-2xs"
                      aria-label={`${post.creator_name} on Facebook`}
                    >
                      <FacebookIcon className="size-2.5 shrink-0" />
                      <span>Facebook</span>
                      <ExternalLink className="size-2 opacity-60 group-hover/social:opacity-100 transition-opacity" />
                    </a>
                  )}

                  {/* Fallback for legacy single social platform link */}
                  {!post.youtube_url && !post.tiktok_url && !post.facebook_url && post.social_platform && post.social_url && (
                    <a
                      href={post.social_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="group/social inline-flex items-center gap-1 rounded-full bg-[#F2F2F7] hover:bg-[#E5E5EA] border border-black/10 px-2 py-0.5 text-[10px] font-semibold text-[#1D1D1F] transition-all duration-150 active:scale-[0.96]"
                      aria-label={`${post.creator_name} on ${post.social_platform}`}
                    >
                      {post.social_platform === 'TikTok' ? (
                        <TikTokIcon className="size-2.5 text-[#1D1D1F]" />
                      ) : post.social_platform === 'YouTube' ? (
                        <YouTubeIcon className="size-2.5 text-[#C40000]" />
                      ) : (
                        <FacebookIcon className="size-2.5 text-[#125EC7]" />
                      )}
                      <span>{post.social_handle || post.social_platform}</span>
                      <ExternalLink className="size-2 opacity-60 group-hover/social:opacity-100 transition-opacity" />
                    </a>
                  )}
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
                  onRequestDelete?.(post);
                }}
                className="flex size-9 sm:size-8 items-center justify-center rounded-full text-[#86868B] hover:text-red-600 hover:bg-red-500/10 border border-black/[0.08] bg-[#F2F2F7] transition-all active:scale-[0.95]"
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
                  onRequestReport?.(post);
                }}
                className="flex size-9 sm:size-8 items-center justify-center rounded-full text-[#6E6E73] hover:text-red-500 hover:bg-red-500/10 border border-black/[0.08] bg-[#F2F2F7] transition-all active:scale-[0.95]"
                title="Report inappropriate content"
                aria-label="Report setup"
              >
                <Flag className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Hardware & Specs Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs">
          <span className="inline-flex items-center gap-1 rounded-md bg-[#F2F2F7] px-2.5 py-0.5 text-[11px] font-medium text-[#1D1D1F]">
            {isTablet ? <Tablet className="size-3 text-[#86868B]" /> : <Smartphone className="size-3 text-[#86868B]" />}
            {post.device_name || post.device_type}
          </span>

          {post.grip && (
            <span className="inline-flex items-center gap-1 rounded-md bg-[#F2F2F7] px-2.5 py-0.5 text-[11px] font-medium text-[#1D1D1F]">
              <Hand className="size-2.5 text-[#86868B] shrink-0" />
              <span>{post.grip}</span>
            </span>
          )}

          {post.gyro !== null && post.gyro !== undefined && (
            <span className="inline-flex items-center gap-1 rounded-md bg-[#F2F2F7] px-2.5 py-0.5 text-[11px] font-medium text-[#1D1D1F]">
              <Compass className="size-2.5 text-[#86868B] shrink-0" />
              <span>{post.gyro ? 'Gyro ON' : 'Gyro OFF'}</span>
            </span>
          )}

          {post.category === 'graphics' && post.graphic_quality && (
            <span className="inline-flex items-center gap-1 rounded-md bg-[#F2F2F7] px-2.5 py-0.5 text-[11px] font-medium text-[#1D1D1F]">
              <SlidersHorizontal className="size-2.5 text-[#86868B] shrink-0" />
              <span>{post.graphic_quality} Quality</span>
            </span>
          )}

          {post.fps_target && (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 text-emerald-700 px-2.5 py-0.5 text-[11px] font-semibold font-mono tabular-nums">
              <Zap className="size-2.5 text-emerald-600 fill-emerald-600/30 shrink-0" />
              <span>
                {post.category === 'graphics'
                  ? post.fps_target === 'Ultra' || post.fps_target === 'Max'
                    ? `${post.fps_target} FPS`
                    : `${post.fps_target} Frame Rate`
                  : post.fps_target}
              </span>
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

        {/* In-Game Import Guide (Sensitivity) */}
        {post.category === 'sensitivity' && (
          <Collapsible defaultOpen={false} className="mt-0.5">
            <CollapsibleTrigger className="flex items-center gap-1.5 text-[11px] text-[#86868B] hover:text-[#0071E3] font-medium transition-colors cursor-pointer group select-none">
              <Info className="size-3 text-[#86868B] group-hover:text-[#0071E3] transition-colors shrink-0" />
              <span>How to import in CODM</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-1.5">
              <ol className="flex flex-wrap items-center gap-1 text-[10px] sm:text-[11px] text-[#6E6E73] bg-[#F2F2F7] rounded-xl p-2.5 border border-black/[0.04]">
                <li className="font-semibold text-[#1D1D1F]">1. Settings</li>
                <ChevronRight className="size-2.5 text-[#86868B] shrink-0" />
                <li className="font-semibold text-[#1D1D1F]">2. Sensitivity</li>
                <ChevronRight className="size-2.5 text-[#86868B] shrink-0" />
                <li className="font-semibold text-[#1D1D1F]">3. Manage (bottom right)</li>
                <ChevronRight className="size-2.5 text-[#86868B] shrink-0" />
                <li className="font-semibold text-[#1D1D1F]">4. Search tab</li>
                <ChevronRight className="size-2.5 text-[#86868B] shrink-0" />
                <li className="font-bold text-[#0071E3]">5. Paste code &amp; Preview</li>
              </ol>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* HUD / Graphics Screenshot Thumbnail (Only when screenshot is available) */}
        {(post.category === 'hud' || post.category === 'graphics') && post.image_url && (
          <div
            onClick={() => onInspectImage?.(post)}
            className="group/img relative aspect-video w-full cursor-pointer overflow-hidden rounded-[16px] border border-black/10 bg-black/5 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]"
          >
            <Image
              src={post.image_url}
              alt={`${post.creator_name}'s CODM ${post.category.toUpperCase()} layout for ${post.device_name || post.device_type} (${post.grip || 'Touch'} grip)`}
              fill
              unoptimized
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover/img:scale-105"
            />
            {/* Ambient vignette gradient for bottom badge legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none opacity-60 group-hover/img:opacity-80 transition-opacity" />

            {/* Persistent Mobile & Desktop Eye Inspect Badge */}
            <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-black/65 backdrop-blur-md px-2.5 py-1 text-[10px] font-medium text-white shadow-sm transition-transform duration-150 group-hover/img:scale-105">
              <Eye className="size-3 text-white/90" />
              <span>Inspect</span>
            </span>
          </div>
        )}
      </div>

      {/* Card Action Footbar */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-black/[0.05] pt-3">
        {/* Apple Filled Primary Action Button (Bottom Left) */}
        <button
          type="button"
          onClick={handleCopy}
          className={`group/copy flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all duration-150 min-h-[44px] sm:min-h-[40px] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]/50 ${
            copied
              ? 'bg-[#34C759] text-white shadow-[0_2px_8px_rgba(52,199,89,0.3)]'
              : 'bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-[0_2px_8px_rgba(0,113,227,0.25)]'
          }`}
          aria-label={`Copy share code for ${post.creator_name}`}
        >
          {copied ? (
            <>
              <Check className="size-3.5 stroke-[3] text-white" />
              <span className="tracking-tight">Copied</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5 stroke-[2.2] text-white/90 transition-transform group-hover/copy:scale-110" />
              <span className="tracking-tight">Copy Code</span>
            </>
          )}
        </button>

        {/* Charisma Heart Capsule Button (Bottom Right) */}
        <button
          type="button"
          onClick={handleVote}
          className={`group/vote flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-all duration-150 min-h-[44px] sm:min-h-[40px] shrink-0 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2D55]/50 ${
            localVoted
              ? 'bg-[#FF2D55]/10 border border-[#FF2D55]/30 text-[#FF2D55] shadow-[0_1px_4px_rgba(255,45,85,0.15)]'
              : 'bg-white border border-black/[0.1] text-[#1D1D1F] hover:border-[#FF2D55]/40 hover:bg-[#FF2D55]/5 hover:text-[#FF2D55] shadow-[0_1px_3px_rgba(0,0,0,0.03)]'
          }`}
          aria-label={`Send Charisma to ${post.creator_name}'s setup, current Charisma: ${localUpvotes.toLocaleString()}`}
        >
          <Heart
            className={`size-4 stroke-[2.2] transition-transform duration-200 group-hover/vote:scale-115 ${
              localVoted
                ? 'fill-[#FF2D55] text-[#FF2D55]'
                : 'text-[#86868B] group-hover/vote:text-[#FF2D55] group-hover/vote:fill-[#FF2D55]/20'
            }`}
          />
          <span
            className={`font-mono text-xs tabular-nums font-bold transition-colors ${
              localVoted
                ? 'text-[#FF2D55]'
                : 'text-[#1D1D1F] group-hover/vote:text-[#FF2D55]'
            }`}
          >
            {localUpvotes.toLocaleString()}
          </span>
        </button>
      </div>
    </div>
  );
});
