'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Check, Copy, ExternalLink, Flame, ShieldCheck, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { copyToClipboard } from '@/lib/clipboard';
import { toast } from 'sonner';
import type { PostRecord } from '@/lib/types';
import { YouTubeIcon, TikTokIcon, FacebookIcon } from './SocialIcons';

interface HeroSpotlightProps {
  post: PostRecord;
}

export function HeroSpotlight({ post }: HeroSpotlightProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(post.code);
    if (success) {
      setCopied(true);
      toast.custom(() => (
        <div className="flex items-center gap-3 rounded-full bg-white/95 px-4 py-2.5 text-[#1D1D1F] shadow-[0_12px_32px_rgba(0,0,0,0.15)] border border-black/10 backdrop-blur-xl">
          <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
            <Check className="size-3.5 stroke-[3]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold truncate">{post.creator_name}&apos;s code copied!</span>
            <span className="text-[10px] text-[#6E6E73] truncate">Ready to paste into CODM</span>
          </div>
          <span className="ml-2 rounded-full bg-[#0071E3]/10 px-2 py-0.5 font-mono text-[9px] font-bold text-[#0071E3]">
            1-TAP
          </span>
        </div>
      ));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section aria-label="Featured Season Setup" className="w-full">
      {/* App Store "Today" Editorial Story Card */}
      <div className="relative overflow-hidden rounded-[26px] border border-black/[0.06] bg-white shadow-[0_10px_36px_-4px_rgba(0,0,0,0.06),0_2px_8px_-2px_rgba(0,0,0,0.03)]">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-4">
            {/* Editorial Category Tag */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#86868B]">
                Season 8 • Battle Royale Pro
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FF3B30]/10 border border-[#FF3B30]/25 px-2.5 py-0.5 text-[10px] font-bold text-[#D70015]">
                <Flame className="size-3 fill-[#FF3B30] text-[#FF3B30]" />
                Trending Setup
              </span>
            </div>

            {/* Creator Title & Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="relative flex size-14 items-center justify-center rounded-[16px] overflow-hidden bg-gradient-to-br from-[#0071E3] to-[#005bb5] text-white font-bold text-xl shadow-[0_4px_12px_rgba(0,113,227,0.25)] ring-1 ring-black/5 shrink-0">
                  {post.creator_avatar_url ? (
                    <Image
                      src={post.creator_avatar_url}
                      alt={post.creator_name}
                      width={56}
                      height={56}
                      className="size-full object-cover"
                    />
                  ) : (
                    <span>{post.creator_name.charAt(0)}</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap">
                    {post.team_name && (
                      <span className="inline-flex items-center rounded-md bg-[#0071E3]/10 border border-[#0071E3]/25 px-2.5 py-0.5 font-mono text-xs font-bold text-[#0071E3] tracking-tight shadow-[0_1px_2px_rgba(0,113,227,0.08)]">
                        {post.team_name}
                      </span>
                    )}
                    <h2 className="font-heading text-2xl font-bold tracking-tight text-[#1D1D1F] sm:text-3xl">
                      {post.creator_name}
                    </h2>
                    {post.is_verified && (
                      <ShieldCheck className="size-5 text-[#0071E3] shrink-0" aria-label="Verified Pro" />
                    )}
                  </div>
                  {post.social_platform && post.social_url ? (
                    <a
                      href={post.social_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/social inline-flex items-center gap-1.5 rounded-full bg-[#F2F2F7] hover:bg-[#E5E5EA] px-3 py-1 text-xs font-medium text-[#1D1D1F] transition-colors mt-1 self-start"
                    >
                      {post.social_platform === 'TikTok' ? (
                        <TikTokIcon className="size-3 text-[#1D1D1F]" />
                      ) : post.social_platform === 'YouTube' ? (
                        <YouTubeIcon className="size-3 text-[#FF0000]" />
                      ) : (
                        <FacebookIcon className="size-3 text-[#1877F2]" />
                      )}
                      <span>{post.social_handle || `${post.social_platform} Channel`}</span>
                      <ExternalLink className="size-3 text-[#86868B] group-hover/social:text-[#0071E3]" />
                    </a>
                  ) : post.social_handle ? (
                    <span className="text-xs text-[#86868B] mt-0.5">{post.social_handle}</span>
                  ) : null}
                </div>
              </div>

              {/* Share Code & 1-Tap Copy Action */}
              <div className="flex items-center gap-2.5 self-start sm:self-auto">
                <div className="rounded-full bg-[#F2F2F7] px-4 py-2 font-mono text-xs font-bold text-[#1D1D1F] border border-black/[0.04]">
                  <span className="select-all">{post.code}</span>
                </div>
                <Button
                  onClick={handleCopy}
                  className={`h-9 min-h-[38px] min-w-[100px] gap-1.5 rounded-full px-5 text-xs font-bold uppercase tracking-wider transition-all ${
                    copied
                      ? 'bg-[#34C759] text-white hover:bg-[#2fb350]'
                      : 'bg-[#0071E3] text-white hover:bg-[#0077ED] shadow-[0_2px_8px_rgba(0,113,227,0.3)]'
                  }`}
                  aria-label={`Copy share code for ${post.creator_name}`}
                >
                  {copied ? (
                    <>
                      <Check className="size-3.5 stroke-[3]" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Tactical hardware & mechanics tags */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs border-t border-black/[0.05]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F2F2F7] px-3 py-1 font-semibold text-[#1D1D1F]">
                <Smartphone className="size-3 text-[#86868B]" />
                {post.device_name || post.device_type}
              </span>
              {post.grip && (
                <span className="rounded-full bg-[#F2F2F7] px-3 py-1 font-semibold text-[#1D1D1F]">
                  {post.grip}
                </span>
              )}
              {post.gyro !== null && (
                <span className="rounded-full bg-[#F2F2F7] px-3 py-1 font-semibold text-[#1D1D1F]">
                  {post.gyro ? 'Gyro ON' : 'Gyro OFF'}
                </span>
              )}
              {post.category === 'graphics' && post.graphic_quality && (
                <span className="rounded-full bg-[#F2F2F7] px-3 py-1 font-semibold text-[#1D1D1F]">
                  {post.graphic_quality} Quality
                </span>
              )}
              {post.category === 'graphics' && post.fps_target && (
                <span className="rounded-full bg-emerald-500/10 text-emerald-700 px-3 py-1 font-semibold font-mono tabular-nums">
                  {post.fps_target === 'Ultra' || post.fps_target === 'Max' ? `${post.fps_target} FPS` : `${post.fps_target} Frame Rate`}
                </span>
              )}
              <span className="rounded-full bg-[#F2F2F7] text-[#86868B] px-3 py-1 font-mono font-medium">
                {post.season.startsWith('Season') ? post.season : `Season ${post.season.replace(/^S/i, '')}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
