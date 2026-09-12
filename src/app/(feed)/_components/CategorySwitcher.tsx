'use client';

import React from 'react';
import { Crosshair, Layout, SlidersHorizontal } from 'lucide-react';
import type { ItemCategory } from '@/lib/types';
import { triggerHaptic } from '@/lib/clipboard';

interface CategorySwitcherProps {
  currentCategory: ItemCategory;
  onSelectCategory: (category: ItemCategory) => void;
}

const CATEGORIES: { id: ItemCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'graphics', label: 'Graphics', icon: SlidersHorizontal },
  { id: 'hud', label: 'HUD Layout', icon: Layout },
  { id: 'sensitivity', label: 'Sensitivity', icon: Crosshair },
];

export function CategorySwitcher({ currentCategory, onSelectCategory }: CategorySwitcherProps) {
  const handleSelect = (cat: ItemCategory) => {
    triggerHaptic(8);
    onSelectCategory(cat);
  };

  return (
    <div
      role="tablist"
      aria-label="CODM Setup Categories"
      className="inline-flex w-full items-center justify-between rounded-[14px] bg-[#767680]/12 p-1 shadow-inner sm:w-auto"
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
            className={`flex flex-1 items-center justify-center gap-2 rounded-[10px] px-4 py-2 text-xs transition-all duration-150 min-h-[38px] sm:flex-initial sm:px-6 ${
              isActive
                ? 'bg-white font-semibold text-[#1D1D1F] shadow-[0_3px_8px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04]'
                : 'font-medium text-[#6C6C70] hover:text-[#1D1D1F]'
            }`}
          >
            <Icon className={`size-3.5 ${isActive ? 'text-[#0071E3]' : 'text-[#8E8E93]'}`} />
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
