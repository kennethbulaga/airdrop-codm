'use client';

import React from 'react';
import { Filter, Hand, RotateCcw, Smartphone, Tablet } from 'lucide-react';
import type {
  FilterState,
  DeviceType,
  GripType,
  GraphicQuality,
  GraphicFrameRate,
} from '@/lib/types';
import { triggerHaptic } from '@/lib/clipboard';
import { cn } from '@/lib/utils';

interface FilterChipBarProps {
  filters: FilterState;
  onChangeFilters: (filters: FilterState) => void;
  onResetFilters: () => void;
}

const GRIP_TYPES: GripType[] = ['2-Finger', '3-Finger', '4-Finger', '5+ Finger'];
const GRAPHIC_QUALITIES: GraphicQuality[] = ['Low', 'Medium', 'High', 'Very High'];
const FRAME_RATES: GraphicFrameRate[] = ['Low', 'Medium', 'High', 'Very High', 'Max', 'Ultra'];

export function FilterChipBar({ filters, onChangeFilters, onResetFilters }: FilterChipBarProps) {
  const isSensitivity = filters.category === 'sensitivity';
  const isHud = filters.category === 'hud';
  const isGraphics = filters.category === 'graphics';

  const update = (partial: Partial<FilterState>) => {
    triggerHaptic(6);
    onChangeFilters({ ...filters, ...partial });
  };

  const hasActiveFilters = Boolean(
    ((isSensitivity || isHud) && (filters.device !== null || filters.grip !== null || filters.gyro !== null)) ||
    (isGraphics && (filters.graphicQuality !== null || filters.fpsTarget !== null))
  );

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#86868B] uppercase tracking-wider">
          <Filter className="size-3.5" />
          <span>Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              onResetFilters();
            }}
            className="flex items-center gap-1 text-xs font-semibold text-[#0071E3] hover:underline"
          >
            <RotateCcw className="size-3" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* 1. Category-Specific: Sensitivity & HUD (Two-Tiered Concentric Segmented Rails) */}
      {(isSensitivity || isHud) && (
        <div className="flex flex-col gap-2.5 w-full pt-2 border-t border-black/[0.06]">
          {/* Tier 1: Device & Gyro */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
            <span className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider shrink-0 sm:w-28">
              Device &amp; Gyro
            </span>
            <div className="flex items-center gap-2 w-full sm:max-w-lg">
              {/* Device Selector */}
              <div className="grid grid-cols-2 flex-1 p-1 rounded-[14px] bg-black/[0.04] border border-black/[0.04] gap-1">
                {(['Phone', 'iPad / Tablet'] as DeviceType[]).map((device) => {
                  const isSelected = filters.device === device;
                  return (
                    <button
                      key={device}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => update({ device: isSelected ? null : device })}
                      className={cn(
                        'flex items-center justify-center gap-1.5 rounded-[10px] px-2 py-1.5 text-xs font-semibold transition-all duration-150 min-h-[34px] select-none active:scale-[0.96] text-center',
                        isSelected
                          ? 'bg-[#0071E3] text-white shadow-[0_2px_6px_rgba(0,113,227,0.25)]'
                          : 'text-[#1D1D1F] hover:bg-white/80 hover:text-[#0071E3] font-medium'
                      )}
                    >
                      {device === 'iPad / Tablet' ? (
                        <Tablet className="size-3 shrink-0" />
                      ) : (
                        <Smartphone className="size-3 shrink-0" />
                      )}
                      <span>{device === 'iPad / Tablet' ? 'iPad' : 'Phone'}</span>
                    </button>
                  );
                })}
              </div>

              {/* Gyro Selector */}
              <div className="grid grid-cols-2 w-36 sm:w-44 p-1 rounded-[14px] bg-black/[0.04] border border-black/[0.04] gap-1">
                {[
                  { label: 'Gyro ON', val: true },
                  { label: 'Gyro OFF', val: false },
                ].map(({ label, val }) => {
                  const isSelected = filters.gyro === val;
                  return (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => update({ gyro: isSelected ? null : val })}
                      className={cn(
                        'flex items-center justify-center rounded-[10px] px-2 py-1.5 text-xs font-semibold transition-all duration-150 min-h-[34px] select-none active:scale-[0.96] text-center',
                        isSelected
                          ? 'bg-[#0071E3] text-white shadow-[0_2px_6px_rgba(0,113,227,0.25)]'
                          : 'text-[#1D1D1F] hover:bg-white/80 hover:text-[#0071E3] font-medium'
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tier 2: Finger Grip Rail */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
            <span className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider shrink-0 sm:w-28">
              Finger Grip
            </span>
            <div className="grid grid-cols-4 w-full sm:max-w-lg p-1 rounded-[14px] bg-black/[0.04] border border-black/[0.04] gap-1">
              {GRIP_TYPES.map((grip) => {
                const isSelected = filters.grip === grip;
                return (
                  <button
                    key={grip}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => update({ grip: isSelected ? null : grip })}
                    className={cn(
                      'flex items-center justify-center gap-1 rounded-[10px] px-1.5 py-1.5 text-xs font-semibold transition-all duration-150 min-h-[34px] select-none active:scale-[0.96] text-center',
                      isSelected
                        ? 'bg-[#0071E3] text-white shadow-[0_2px_6px_rgba(0,113,227,0.25)]'
                        : 'text-[#1D1D1F] hover:bg-white/80 hover:text-[#0071E3] font-medium'
                    )}
                    title={grip}
                  >
                    <Hand className="size-2.5 shrink-0 opacity-70" />
                    <span className="truncate">{grip}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. Category-Specific: Graphics (Concentric Equal-Width Segmented Rails) */}
      {isGraphics && (
        <div className="flex flex-col gap-2.5 w-full pt-2 border-t border-black/[0.06]">
          {/* Rail 1: Graphic Quality */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
            <span className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider shrink-0 sm:w-28">
              Graphic Quality
            </span>
            <div className="grid grid-cols-4 w-full sm:max-w-lg p-1 rounded-[14px] bg-black/[0.04] border border-black/[0.04] gap-1">
              {GRAPHIC_QUALITIES.map((quality) => {
                const isSelected = filters.graphicQuality === quality;
                return (
                  <button
                    key={quality}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => update({ graphicQuality: isSelected ? null : quality })}
                    className={cn(
                      'flex items-center justify-center rounded-[10px] px-2 py-1.5 text-xs font-semibold transition-all duration-150 min-h-[34px] select-none active:scale-[0.96] text-center',
                      isSelected
                        ? 'bg-[#0071E3] text-white shadow-[0_2px_6px_rgba(0,113,227,0.25)]'
                        : 'text-[#1D1D1F] hover:bg-white/80 hover:text-[#0071E3] font-medium'
                    )}
                  >
                    {quality}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rail 2: Frame Rate */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
            <span className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider shrink-0 sm:w-28">
              Frame Rate
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-6 w-full sm:max-w-lg p-1 rounded-[14px] bg-black/[0.04] border border-black/[0.04] gap-1">
              {FRAME_RATES.map((fps) => {
                const isSelected = filters.fpsTarget === fps;
                return (
                  <button
                    key={fps}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => update({ fpsTarget: isSelected ? null : fps })}
                    className={cn(
                      'flex items-center justify-center rounded-[10px] px-1.5 py-1.5 text-xs font-semibold transition-all duration-150 min-h-[38px] sm:min-h-[34px] select-none active:scale-[0.96] text-center',
                      isSelected
                        ? 'bg-[#0071E3] text-white shadow-[0_2px_6px_rgba(0,113,227,0.25)]'
                        : 'text-[#1D1D1F] hover:bg-white/80 hover:text-[#0071E3] font-medium'
                    )}
                  >
                    {fps}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
