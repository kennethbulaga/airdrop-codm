'use client';

import React from 'react';
import { Clock, Flame, Trophy } from 'lucide-react';
import type { SortOption } from '@/lib/types';
import { triggerHaptic } from '@/lib/clipboard';

interface SortSwitcherProps {
  currentSort: SortOption;
  onSelectSort: (sort: SortOption) => void;
}

interface SortConfig {
  id: SortOption;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  activeClasses: string;
  inactiveClasses: string;
  iconActiveClasses: string;
  iconInactiveClasses: string;
}

const SORTS: SortConfig[] = [
  {
    id: 'trending',
    label: 'Trending',
    icon: Flame,
    // Vibrant Flame / Orange-Red (#FF3B30 / #FF9500)
    activeClasses:
      'bg-[#FF3B30]/10 border border-[#FF3B30]/30 text-[#D70015] font-semibold shadow-[0_2px_8px_rgba(255,59,48,0.14)]',
    inactiveClasses:
      'bg-white border border-black/[0.08] text-[#6C6C70] hover:text-[#D70015] hover:border-[#FF3B30]/30 hover:bg-[#FF3B30]/5 font-medium shadow-[0_1px_2px_rgba(0,0,0,0.03)]',
    iconActiveClasses: 'text-[#FF3B30] fill-[#FF3B30]/20',
    iconInactiveClasses: 'text-[#8E8E93] group-hover:text-[#FF3B30]',
  },
  {
    id: 'top',
    label: 'Top Rated',
    icon: Trophy,
    // Prestige Gold / Amber (#FFCC00 / #D97706)
    activeClasses:
      'bg-[#FFCC00]/15 border border-[#FFCC00]/40 text-[#B45309] font-semibold shadow-[0_2px_8px_rgba(217,119,6,0.14)]',
    inactiveClasses:
      'bg-white border border-black/[0.08] text-[#6C6C70] hover:text-[#B45309] hover:border-[#FFCC00]/40 hover:bg-[#FFCC00]/8 font-medium shadow-[0_1px_2px_rgba(0,0,0,0.03)]',
    iconActiveClasses: 'text-[#D97706] fill-[#FFCC00]/40',
    iconInactiveClasses: 'text-[#8E8E93] group-hover:text-[#D97706]',
  },
  {
    id: 'latest',
    label: 'Latest',
    icon: Clock,
    // Electric Cyan / Ice Blue (#00C7BE / #06B6D4)
    activeClasses:
      'bg-[#00C7BE]/15 border border-[#00C7BE]/35 text-[#007A75] font-semibold shadow-[0_2px_8px_rgba(0,199,190,0.14)]',
    inactiveClasses:
      'bg-white border border-black/[0.08] text-[#6C6C70] hover:text-[#007A75] hover:border-[#00C7BE]/35 hover:bg-[#00C7BE]/5 font-medium shadow-[0_1px_2px_rgba(0,0,0,0.03)]',
    iconActiveClasses: 'text-[#00A29A]',
    iconInactiveClasses: 'text-[#8E8E93] group-hover:text-[#00A29A]',
  },
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
            className={`group flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs transition-all duration-150 min-h-[36px] whitespace-nowrap select-none ${
              isActive ? s.activeClasses : s.inactiveClasses
            }`}
          >
            <Icon
              className={`size-3.5 transition-colors ${
                isActive ? s.iconActiveClasses : s.iconInactiveClasses
              }`}
            />
            <span>{s.label}</span>
          </button>
        );
      })}
    </div>
  );
}
