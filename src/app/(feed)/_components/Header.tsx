'use client';

import React from 'react';
import Image from 'next/image';
import type { UserSessionProfile } from '@/lib/types';
import { HelpCircle, MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserNav } from './UserNav';

interface HeaderProps {
  onOpenSubmit: () => void;
  onOpenFeedback?: () => void;
  onOpenBriefing?: () => void;
  currentUser?: UserSessionProfile | null;
  onProfileUpdated?: (updated: UserSessionProfile) => void;
}

export function Header({
  onOpenSubmit,
  onOpenFeedback,
  onOpenBriefing,
  currentUser,
  onProfileUpdated,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/[0.06] bg-white/80 backdrop-blur-xl supports-backdrop-filter:bg-white/70">
      <div className="flex h-16 w-full items-center justify-between gap-4 px-4 sm:px-8 lg:px-10">
        {/* Brand & App Store Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex size-10 items-center justify-center rounded-[12px] overflow-hidden bg-black/5 shadow-[0_2px_8px_rgba(0,113,227,0.15)] ring-1 ring-black/5 shrink-0">
            <Image
              src="/airdrop-logo.webp"
              alt="Airdrop"
              width={40}
              height={40}
              className="size-full object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-bold tracking-tight text-[#1D1D1F]">
                Airdrop
              </span>
              <span className="rounded-md bg-[#0071E3]/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#0071E3]">
                S8
              </span>
            </div>
            <span className="hidden text-[11px] font-medium text-[#86868B] sm:inline-block">
              CODM Battle Royale Vault
            </span>
          </div>
        </div>

        {/* Action Buttons, User Nav & Community Badge */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-[#F2F2F7] px-3 py-1 text-[11px] font-medium text-[#86868B]">
            <span className="size-1.5 rounded-full bg-[#34C759] animate-pulse" />
            <span>Community Vault</span>
          </div>

          {onOpenBriefing && (
            <button
              type="button"
              onClick={onOpenBriefing}
              className="flex size-10 sm:size-9 min-h-[40px] min-w-[40px] items-center justify-center rounded-full text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F2F2F7] transition-colors border border-black/[0.06] active:scale-[0.96]"
              title="Vault Briefing & Intel"
              aria-label="Vault Briefing and FAQ"
            >
              <HelpCircle className="size-4" />
            </button>
          )}

          {onOpenFeedback && (
            <button
              type="button"
              onClick={onOpenFeedback}
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-semibold text-[#6E6E73] hover:text-[#0071E3] hover:bg-[#0071E3]/5 transition-colors border border-black/[0.08] active:scale-[0.96]"
              title="Give Community Feedback"
            >
              <MessageSquare className="size-3.5" />
              <span>Feedback</span>
            </button>
          )}

          <Button
            onClick={onOpenSubmit}
            size="sm"
            className="h-10 sm:h-9 gap-1.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold px-3.5 sm:px-4 shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-transform active:scale-[0.96] min-h-[40px] sm:min-h-[36px]"
          >
            <Plus className="size-3.5 stroke-[2.5]" />
            <span className="sm:hidden">Share</span>
            <span className="hidden sm:inline">Share Setup</span>
          </Button>

          <UserNav initialUser={currentUser} onProfileUpdated={onProfileUpdated} />
        </div>
      </div>
    </header>
  );
}
