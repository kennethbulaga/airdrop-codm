'use client';

import React from 'react';
import { Crosshair, Layout, Lock, SlidersHorizontal } from 'lucide-react';
import type { ItemCategory } from '@/lib/types';
import { triggerHaptic } from '@/lib/clipboard';

interface CategorySwitcherProps {
  currentCategory: ItemCategory;
  onSelectCategory: (category: ItemCategory) => void;
  onOpenStreamers?: () => void;
}

const CATEGORIES: {
  id: ItemCategory;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'graphics', label: 'Graphics', shortLabel: 'Graphics', icon: SlidersHorizontal },
  { id: 'hud', label: 'HUD Layout', shortLabel: 'HUD', icon: Layout },
  { id: 'sensitivity', label: 'Sensitivity', shortLabel: 'Sens', icon: Crosshair },
];

export function CategorySwitcher({
  currentCategory,
  onSelectCategory,
  onOpenStreamers,
}: CategorySwitcherProps) {
  const handleSelect = (cat: ItemCategory) => {
    triggerHaptic(8);
    onSelectCategory(cat);
  };

  return (
    <div
      role="tablist"
      aria-label="CODM Settings Categories: Graphics, HUD Layout Codes, and Sensitivity"
      className="inline-flex w-full items-center justify-between rounded-[14px] bg-[#767680]/12 p-1 shadow-inner sm:w-auto gap-1"
    >
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isActive = currentCategory === cat.id;

        return (
          <button
            key={cat.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => handleSelect(cat.id)}
            className={`flex flex-1 items-center justify-center gap-1 sm:gap-1.5 rounded-[10px] px-2 sm:px-5 py-2 text-xs transition-all duration-150 min-h-[44px] sm:min-h-[38px] active:scale-[0.96] select-none ${
              isActive
                ? 'bg-white font-semibold text-[#1D1D1F] shadow-[0_3px_8px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04]'
                : 'font-medium text-[#6C6C70] hover:text-[#1D1D1F]'
            }`}
          >
            <Icon className={`size-3.5 shrink-0 ${isActive ? 'text-[#0071E3]' : 'text-[#8E8E93]'}`} />
            <span className="sm:hidden">{cat.shortLabel}</span>
            <span className="hidden sm:inline">{cat.label}</span>
          </button>
        );
      })}

      {/* 4th Tab: Locked Streamers Vault */}
      <button
        type="button"
        role="tab"
        aria-selected={false}
        onClick={() => {
          triggerHaptic(6);
          onOpenStreamers?.();
        }}
        className="flex flex-1 items-center justify-center gap-1 sm:gap-1.5 rounded-[10px] px-2 sm:px-5 py-2 text-xs font-medium text-[#6C6C70] hover:text-[#1D1D1F] hover:bg-white/40 transition-all duration-150 min-h-[44px] sm:min-h-[38px] group cursor-pointer active:scale-[0.96] select-none"
        title="Verified Streamer Vault (Coming Soon)"
      >
        <Lock className="size-3 text-amber-500 group-hover:text-amber-600 transition-colors shrink-0" />
        <span>Streamers</span>
      </button>
    </div>
  );
}
