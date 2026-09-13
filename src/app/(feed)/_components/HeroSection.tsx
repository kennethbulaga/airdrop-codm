'use client';

import React from 'react';
import {
  Crosshair,
  Search,
  Shield,
  Smartphone,
  Users,
  X,
} from 'lucide-react';
import { triggerHaptic } from '@/lib/clipboard';
import { CURRENT_SEASON } from '@/lib/season-config';
import { Announcement } from '@/components/ui/announcement';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  playerCount?: number;
  clanCount?: number;
  presetCount?: number;
  deviceCount?: number;
}

export function HeroSection({
  searchQuery,
  onSearchChange,
  playerCount = 0,
  clanCount = 0,
  presetCount = 0,
  deviceCount = 0,
}: HeroSectionProps) {
  const handleClear = () => {
    triggerHaptic(6);
    onSearchChange('');
  };

  return (
    <section
      aria-label="CODM Battle Royale Community Settings Vault"
      className="relative w-full overflow-hidden rounded-[24px] border border-black/[0.06] bg-white p-4 sm:p-6 lg:p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.02)]"
    >
      {/* Subtle Apple Ambient Glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-[500px] rounded-full bg-gradient-to-b from-[#0071E3]/8 via-[#0071E3]/2 to-transparent blur-3xl" />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        {/* 21st.dev Style Season 8 Announcement Pill */}
        <div className="mb-3 sm:mb-3.5 flex justify-center w-full max-w-full">
          <Announcement
            href={CURRENT_SEASON.blogUrl}
            badge="Season 8"
            variant="brand"
            pulse
            title="Read Call of Duty: Mobile Season 8 official patch notes"
            aria-label="Call of Duty: Mobile Season 8 Against All Fate and Honkai Impact 3rd Collaboration Intel"
          >
            <span className="inline sm:hidden">Against All Fate × Honkai</span>
            <span className="hidden sm:inline">Against All Fate • Honkai Impact 3rd Collab</span>
          </Announcement>
        </div>

        {/* Main Authority Headline - Balanced Typography */}
        <h1 className="font-heading text-xl sm:text-3xl md:text-[32px] md:leading-tight font-extrabold tracking-tight text-[#1D1D1F] max-w-2xl text-balance">
          <span className="sm:hidden">CODM Battle Royale Settings Vault</span>
          <span className="hidden sm:inline">CODM Battle Royale Settings Vault: Season 8 HUD Codes &amp; Sensitivity</span>
        </h1>

        {/* Subtitle - Readable & Concise */}
        <p className="mt-2 max-w-xl text-xs sm:text-sm text-[#6E6E73] leading-relaxed text-pretty">
          <span className="sm:hidden">
            Season 8 HUD codes, sensitivity curves, and graphics setups. 1-tap copy directly into CODM.
          </span>
          <span className="hidden sm:inline">
            Discover 4-finger claw CODM HUD codes, iPad and phone sensitivity settings, and graphics configurations shared by Garena and Global players. 1-tap copy directly into Call of Duty: Mobile.
          </span>
        </p>

        {/* Spotlight Search Bar */}
        <div className="relative mt-3.5 sm:mt-5 w-full max-w-xl">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 size-4 text-[#86868B] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search player, clan, claw, iPad, or code..."
              className="h-10 sm:h-12 w-full rounded-2xl border border-black/[0.08] bg-[#F2F2F7]/80 pl-10 pr-9 text-xs sm:text-sm text-[#1D1D1F] placeholder:text-[#86868B] transition-all shadow-inner focus:border-[#0071E3] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0071E3]/12 font-medium"
              aria-label="Search players, clan tags, 4-finger claw layouts, devices, or share codes"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 flex size-5 items-center justify-center rounded-full bg-[#86868B]/20 text-[#1D1D1F] hover:bg-[#86868B]/30 transition-colors"
                aria-label="Clear search query"
              >
                <X className="size-3 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>

        {/* Clean Streamlined Telemetry Line: 2x2 Grid on Mobile, Flex Row on Desktop */}
        <div className="mt-4 grid grid-cols-2 gap-y-2.5 gap-x-4 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-6 border-t border-black/[0.05] pt-3 text-[11px] font-medium text-[#86868B]">
          <div className="flex items-center justify-center gap-1.5">
            <Crosshair className="size-3 text-[#0071E3]" />
            <span><strong className="font-mono font-bold text-[#1D1D1F] tabular-nums">{presetCount}</strong> {presetCount === 1 ? 'Setup' : 'Setups'}</span>
          </div>
          <span className="hidden sm:inline text-black/20">•</span>
          <div className="flex items-center justify-center gap-1.5">
            <Users className="size-3 text-[#0071E3]" />
            <span><strong className="font-mono font-bold text-[#1D1D1F] tabular-nums">{playerCount}</strong> {playerCount === 1 ? 'Player' : 'Players'}</span>
          </div>
          <span className="hidden sm:inline text-black/20">•</span>
          <div className="flex items-center justify-center gap-1.5">
            <Shield className="size-3 text-[#0071E3]" />
            <span><strong className="font-mono font-bold text-[#1D1D1F] tabular-nums">{clanCount}</strong> {clanCount === 1 ? 'Clan' : 'Clans'}</span>
          </div>
          <span className="hidden sm:inline text-black/20">•</span>
          <div className="flex items-center justify-center gap-1.5">
            <Smartphone className="size-3 text-[#0071E3]" />
            <span><strong className="font-mono font-bold text-[#1D1D1F] tabular-nums">{deviceCount}</strong> {deviceCount === 1 ? 'Device' : 'Devices'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
