'use client';

import React from 'react';
import {
  Crosshair,
  Search,
  Shield,
  Smartphone,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { triggerHaptic } from '@/lib/clipboard';
import { CURRENT_SEASON } from '@/lib/season-config';

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
      className="relative w-full overflow-hidden rounded-[24px] border border-black/[0.06] bg-white p-5 sm:p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.02)]"
    >
      {/* Subtle Apple Ambient Glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-[500px] rounded-full bg-gradient-to-b from-[#0071E3]/8 via-[#0071E3]/2 to-transparent blur-3xl" />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        {/* Editorial Pill Badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#0071E3]/10 border border-[#0071E3]/20 px-3 py-0.5 text-xs font-bold text-[#0071E3] shadow-sm mb-3">
          <Zap className="size-3 fill-[#0071E3] text-[#0071E3]" />
          <span>{CURRENT_SEASON.badgeText}</span>
        </div>

        {/* Main Authority Headline - Compact & Punchy */}
        <h1 className="font-heading text-xl font-extrabold tracking-tight text-[#1D1D1F] sm:text-3xl md:text-[32px] md:leading-tight max-w-2xl">
          The community settings vault for CODM Battle Royale.
        </h1>

        {/* Subtitle */}
        <p className="mt-2 max-w-xl text-xs sm:text-sm text-[#6E6E73] leading-relaxed">
          HUD layouts, graphics configurations, and sensitivity codes shared by players. The best setups rise to the top.
        </p>

        {/* Spotlight Search Bar */}
        <div className="relative mt-4 sm:mt-5 w-full max-w-xl">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 size-4 text-[#86868B] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by player, clan tag, device, or share code..."
              className="h-11 sm:h-12 w-full rounded-2xl border border-black/[0.08] bg-[#F2F2F7]/80 pl-10 pr-9 text-xs sm:text-sm text-[#1D1D1F] placeholder:text-[#86868B] transition-all shadow-inner focus:border-[#0071E3] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0071E3]/12 font-medium"
              aria-label="Search players, clan tags, devices, or share codes"
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

        {/* Clean Streamlined Telemetry Line */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6 border-t border-black/[0.05] pt-3 text-[11px] font-medium text-[#86868B]">
          <div className="flex items-center gap-1">
            <Crosshair className="size-3 text-[#0071E3]" />
            <span><strong className="font-mono font-bold text-[#1D1D1F]">{presetCount}</strong> {presetCount === 1 ? 'Setup' : 'Setups'}</span>
          </div>
          <span className="text-black/20">•</span>
          <div className="flex items-center gap-1">
            <Users className="size-3 text-[#0071E3]" />
            <span><strong className="font-mono font-bold text-[#1D1D1F]">{playerCount}</strong> {playerCount === 1 ? 'Player' : 'Players'}</span>
          </div>
          <span className="text-black/20">•</span>
          <div className="flex items-center gap-1">
            <Shield className="size-3 text-[#0071E3]" />
            <span><strong className="font-mono font-bold text-[#1D1D1F]">{clanCount}</strong> {clanCount === 1 ? 'Clan' : 'Clans'}</span>
          </div>
          <span className="text-black/20">•</span>
          <div className="flex items-center gap-1">
            <Smartphone className="size-3 text-[#0071E3]" />
            <span><strong className="font-mono font-bold text-[#1D1D1F]">{deviceCount}</strong> {deviceCount === 1 ? 'Device' : 'Devices'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
