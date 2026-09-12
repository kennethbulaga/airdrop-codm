'use client';

import React from 'react';
import { Zap, Crosshair, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Playstyle } from '@/lib/types';

interface PlaystyleBadgeProps {
  playstyle: Playstyle;
  size?: 'sm' | 'md';
  className?: string;
}

export const PLAYSTYLE_CONFIG: Record<
  Playstyle,
  {
    label: string;
    icon: typeof Zap;
    badgeClass: string;
    iconClass: string;
    description: string;
  }
> = {
  Rusher: {
    label: 'Rusher',
    icon: Zap,
    badgeClass: 'bg-amber-500/10 text-amber-800 border-amber-500/20',
    iconClass: 'text-amber-600 fill-amber-500/30',
    description: 'Close-quarters flicking, SMG & Shotgun Alcatraz rusher',
  },
  Sniper: {
    label: 'Sniper',
    icon: Crosshair,
    badgeClass: 'bg-rose-500/10 text-rose-800 border-rose-500/20',
    iconClass: 'text-rose-600',
    description: 'Precision long-range scope & quickscope overwatch',
  },
  'All-Rounder': {
    label: 'All-Rounder',
    icon: Compass,
    badgeClass: 'bg-blue-500/10 text-blue-800 border-blue-500/20',
    iconClass: 'text-blue-600',
    description: 'Balanced AR beamer recoil control & versatile flex',
  },
};

export function PlaystyleBadge({ playstyle, size = 'sm', className }: PlaystyleBadgeProps) {
  const config = PLAYSTYLE_CONFIG[playstyle];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <span
      title={config.description}
      className={cn(
        'inline-flex items-center gap-1 rounded-md border font-medium tracking-tight select-none',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        config.badgeClass,
        className
      )}
    >
      <Icon className={cn('stroke-[2.2]', size === 'sm' ? 'size-3' : 'size-3.5', config.iconClass)} />
      <span>{config.label}</span>
    </span>
  );
}
