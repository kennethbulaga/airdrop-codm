'use client';

import React from 'react';
import Image from 'next/image';
import {
  CheckCircle2,
  Lock,
  MessageSquare,
  Radio,
  Sparkles,
  Tv2,
  Zap,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { triggerHaptic } from '@/lib/clipboard';

interface StreamerVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFeedback?: () => void;
}

const UPCOMING_PERKS = [
  {
    icon: Tv2,
    title: 'All-in-One Streamer Kits',
    description:
      'HUD layout, sensitivity codes, device model, and graphics settings bundled into a single shareable card.',
  },
  {
    icon: Radio,
    title: 'Live Channel Badges',
    description:
      'Direct links to verified Facebook Gaming, YouTube Live, and TikTok live broadcasts.',
  },
  {
    icon: Zap,
    title: '1-Tap In-Game Codes',
    description:
      'Instantly copy tested Alcatraz 1v4 and tournament loadouts without hunting across multiple posts.',
  },
];

export function StreamerVaultModal({
  isOpen,
  onClose,
  onOpenFeedback,
}: StreamerVaultModalProps) {
  const handleNominate = () => {
    triggerHaptic(8);
    onClose();
    onOpenFeedback?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center text-center gap-1.5 pb-2">
          {/* Lock & Streamer Broadcast Icon Lockup */}
          <div className="relative mb-2 flex items-center justify-center">
            <div className="relative flex size-14 items-center justify-center rounded-[18px] overflow-hidden bg-black/5 shadow-[0_4px_16px_rgba(0,113,227,0.2)] ring-1 ring-black/5">
              <Image
                src="/airdrop-logo.webp"
                alt="Airdrop"
                width={56}
                height={56}
                className="size-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-[#1D1D1F] text-white ring-2 ring-white shadow-sm">
              <Lock className="size-3 text-amber-400" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-0.5 text-[10px] font-bold font-mono text-amber-700">
            <Sparkles className="size-3 text-amber-500" />
            <span>IN DEVELOPMENT • S8 ROADMAP</span>
          </div>

          <DialogTitle className="text-xl font-bold font-heading text-[#1D1D1F] pt-1">
            Verified Streamer Vault
          </DialogTitle>
          <DialogDescription className="text-xs text-[#6E6E73] max-w-xs leading-relaxed">
            We are curating all-in-one setup kits directly from top Call of Duty: Mobile Battle Royale streamers.
          </DialogDescription>
        </DialogHeader>

        {/* Feature Preview Cards */}
        <div className="flex flex-col gap-2.5 my-2">
          {UPCOMING_PERKS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex items-start gap-3 rounded-2xl bg-[#F2F2F7]/70 p-3 border border-black/[0.04]"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white shadow-xs text-[#0071E3] ring-1 ring-black/5">
                <Icon className="size-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#1D1D1F]">{title}</span>
                <span className="text-[11px] text-[#6E6E73] leading-relaxed mt-0.5">
                  {description}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-black/[0.05]">
          <div className="flex items-center gap-1.5 text-[11px] text-[#86868B] font-medium">
            <CheckCircle2 className="size-3.5 text-[#34C759]" />
            <span>Facebook • YouTube • TikTok</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onOpenFeedback && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleNominate}
                className="flex-1 sm:flex-initial rounded-full text-xs font-semibold gap-1.5 border-black/10 text-[#0071E3] hover:bg-[#0071E3]/5 min-h-[38px]"
              >
                <MessageSquare className="size-3.5" />
                <span>Nominate Streamer</span>
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={onClose}
              className="flex-1 sm:flex-initial rounded-full bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold px-4 min-h-[38px]"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
