'use client';

import React from 'react';
import { Compass, Crosshair, Filter, RotateCcw, Zap } from 'lucide-react';
import type { FilterState, DeviceType, GripType, Playstyle } from '@/lib/types';
import { triggerHaptic } from '@/lib/clipboard';

interface FilterChipBarProps {
  filters: FilterState;
  onChangeFilters: (filters: FilterState) => void;
  onResetFilters: () => void;
}

const PLAYSTYLES: { type: Playstyle; label: string; icon: typeof Zap }[] = [
  { type: 'Rusher', label: 'Rusher', icon: Zap },
  { type: 'Sniper', label: 'Sniper', icon: Crosshair },
  { type: 'All-Rounder', label: 'All-Rounder', icon: Compass },
];

export function FilterChipBar({ filters, onChangeFilters, onResetFilters }: FilterChipBarProps) {
  const isSensitivityOrHud = filters.category === 'sensitivity' || filters.category === 'hud';
  const isGraphics = filters.category === 'graphics';

  const update = (partial: Partial<FilterState>) => {
    triggerHaptic(6);
    onChangeFilters({ ...filters, ...partial });
  };

  const hasActiveFilters = Boolean(
    filters.device !== null ||
    (isSensitivityOrHud && (filters.playstyle !== null || filters.grip !== null || filters.gyro !== null)) ||
    (isGraphics && (filters.tier !== null || filters.fpsTarget !== null))
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

      <div className="flex flex-wrap items-center gap-2">
        {/* 1. Device Form Factor (Universal) */}
        {(['Phone', 'iPad / Tablet'] as DeviceType[]).map((device) => {
          const isSelected = filters.device === device;
          return (
            <button
              key={device}
              type="button"
              aria-pressed={isSelected}
              onClick={() => update({ device: isSelected ? null : device })}
              className={`rounded-full px-3.5 py-1.5 text-xs transition-all min-h-[34px] ${
                isSelected
                  ? 'bg-[#0071E3] text-white font-semibold shadow-[0_2px_6px_rgba(0,113,227,0.25)]'
                  : 'bg-white border border-black/[0.08] text-[#1D1D1F] hover:bg-[#F2F2F7] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
              }`}
            >
              {device}
            </button>
          );
        })}

        {/* 2. Category-Specific: Sensitivity & HUD (Playstyles, Grip & Gyro) */}
        {isSensitivityOrHud && (
          <>
            {/* Playstyle Filter Chips (Rusher, Sniper, All-Rounder) */}
            {PLAYSTYLES.map(({ type, label, icon: Icon }) => {
              const isSelected = filters.playstyle === type;
              return (
                <button
                  key={type}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => update({ playstyle: isSelected ? null : type })}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs transition-all min-h-[34px] select-none ${
                    isSelected
                      ? 'bg-[#0071E3] text-white font-semibold shadow-[0_2px_6px_rgba(0,113,227,0.25)]'
                      : 'bg-white border border-black/[0.08] text-[#1D1D1F] hover:bg-[#F2F2F7] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
                  }`}
                >
                  <Icon className={`size-3 stroke-[2.2] ${isSelected ? 'text-white' : 'text-[#86868B]'}`} />
                  <span>{label}</span>
                </button>
              );
            })}

            {(['2-Finger Thumbs', '3-Finger', '4-Finger Claw', '5+ Finger'] as GripType[]).map((grip) => {
              const isSelected = filters.grip === grip;
              return (
                <button
                  key={grip}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => update({ grip: isSelected ? null : grip })}
                  className={`rounded-full px-3.5 py-1.5 text-xs transition-all min-h-[34px] ${
                    isSelected
                      ? 'bg-[#0071E3] text-white font-semibold shadow-[0_2px_6px_rgba(0,113,227,0.25)]'
                      : 'bg-white border border-black/[0.08] text-[#1D1D1F] hover:bg-[#F2F2F7] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
                  }`}
                >
                  {grip}
                </button>
              );
            })}

            {/* Gyroscope toggle */}
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
                  className={`rounded-full px-3.5 py-1.5 text-xs transition-all min-h-[34px] ${
                    isSelected
                      ? 'bg-[#0071E3] text-white font-semibold shadow-[0_2px_6px_rgba(0,113,227,0.25)]'
                      : 'bg-white border border-black/[0.08] text-[#1D1D1F] hover:bg-[#F2F2F7] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </>
        )}

        {/* 5. Category-Specific: Graphics (FPS & Tier) */}
        {isGraphics && (
          <>
            {(['Max 90 FPS', 'Ultra 120 FPS']).map((fps) => {
              const isSelected = filters.fpsTarget === fps;
              return (
                <button
                  key={fps}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => update({ fpsTarget: isSelected ? null : fps })}
                  className={`rounded-full px-3.5 py-1.5 text-xs transition-all min-h-[34px] ${
                    isSelected
                      ? 'bg-[#0071E3] text-white font-semibold shadow-[0_2px_6px_rgba(0,113,227,0.25)]'
                      : 'bg-white border border-black/[0.08] text-[#1D1D1F] hover:bg-[#F2F2F7] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
                  }`}
                >
                  {fps}
                </button>
              );
            })}

            {(['Budget / Mid-tier', 'Flagship']).map((tier) => {
              const isSelected = filters.tier === tier;
              return (
                <button
                  key={tier}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => update({ tier: isSelected ? null : tier })}
                  className={`rounded-full px-3.5 py-1.5 text-xs transition-all min-h-[34px] ${
                    isSelected
                      ? 'bg-[#0071E3] text-white font-semibold shadow-[0_2px_6px_rgba(0,113,227,0.25)]'
                      : 'bg-white border border-black/[0.08] text-[#1D1D1F] hover:bg-[#F2F2F7] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
                  }`}
                >
                  {tier}
                </button>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
