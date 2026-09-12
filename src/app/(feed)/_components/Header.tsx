'use client';

import React from 'react';
import type { UserSessionProfile } from '@/lib/types';
import { Crosshair, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserNav } from './UserNav';

interface HeaderProps {
  onOpenSubmit: () => void;
  currentUser?: UserSessionProfile | null;
}

export function Header({ onOpenSubmit, currentUser }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/[0.06] bg-white/80 backdrop-blur-xl supports-backdrop-filter:bg-white/70">
      <div className="flex h-16 w-full items-center justify-between gap-4 px-4 sm:px-8 lg:px-10">
        {/* Brand & App Store Title */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-[12px] bg-gradient-to-br from-[#0071E3] to-[#005bb5] text-white shadow-[0_2px_8px_rgba(0,113,227,0.25)]">
            <Crosshair className="size-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-bold tracking-tight text-[#1D1D1F]">
                Airdrop
              </span>
              <span className="rounded-md bg-[#0071E3]/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#0071E3]">
                S8 META
              </span>
            </div>
            <span className="hidden text-[11px] font-medium text-[#86868B] sm:inline-block">
              CODM Battle Royale Vault
            </span>
          </div>
        </div>

        {/* Action Buttons, User Nav & Community Badge */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="hidden md:flex items-center gap-1.5 rounded-full bg-[#F2F2F7] px-3 py-1 text-[11px] font-medium text-[#86868B]">
            <span className="size-1.5 rounded-full bg-[#34C759] animate-pulse" />
            <span>Community Vault</span>
          </div>

          <Button
            onClick={onOpenSubmit}
            size="sm"
            className="h-9 gap-1.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold px-4 shadow-[0_2px_8px_rgba(0,113,227,0.25)] transition-transform active:scale-95 min-h-[36px]"
          >
            <Plus className="size-3.5 stroke-[2.5]" />
            <span>Share Setup</span>
          </Button>

          <UserNav initialUser={currentUser} />
        </div>
      </div>
    </header>
  );
}
