'use client';

import React from 'react';
import { Clock, Flame, Trophy } from 'lucide-react';
import type { SortOption } from '@/lib/types';
import { triggerHaptic } from '@/lib/clipboard';

interface SortSwitcherProps {
  currentSort: SortOption;
  onSelectSort: (sort: SortOption) => void;
}

const SORTS: { id: SortOption; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'trending', label: 'Trending', icon: Flame },
  { id: 'top', label: 'Top Rated', icon: Trophy },
  { id: 'latest', label: 'Latest', icon: Clock },
];

export function SortSwitcher({ currentSort, onSelectSort }: SortSwitcherProps) {
  const handleSelect = (sort: SortOption) => {
    triggerHaptic(6);
    onSelectSort(sort);
  };

  return (
    <div
      role="group"
      aria-label="Feed sorting options"
      className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar"
    >
      {SORTS.map((s) => {
        const Icon = s.icon;
        const isActive = currentSort === s.id;

        return (
          <button
            key={s.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => handleSelect(s.id)}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs transition-all min-h-[36px] whitespace-nowrap ${
              isActive
                ? 'bg-[#1D1D1F] text-white font-semibold shadow-[0_2px_6px_rgba(0,0,0,0.15)]'
                : 'bg-white border border-black/[0.08] text-[#6C6C70] hover:text-[#1D1D1F] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
            }`}
          >
            <Icon className={`size-3.5 ${isActive ? 'text-white' : 'text-[#8E8E93]'}`} />
            <span>{s.label}</span>
          </button>
        );
      })}
    </div>
  );
}
