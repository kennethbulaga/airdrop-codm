'use client';

import React from 'react';
import Image from 'next/image';
import {
  CheckCircle2,
  ChevronDown,
  Compass,
  Copy,
  Flame,
  MessageSquare,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';

interface VaultBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFeedback?: () => void;
}

const FAQ_ITEMS = [
  {
    id: 'about',
    question: 'What is Airdrop?',
    icon: Compass,
    answer:
      'Airdrop is a community vault for Call of Duty: Mobile Battle Royale settings. It offers sub-second discovery, multi-dimensional hardware filtering (Phone vs Tablet, 2-Finger to 5+ Finger, Gyroscope), and 1-tap clipboard copying of battle-tested settings.',
  },
  {
    id: 'codes',
    question: 'How do in-game share codes work?',
    icon: Copy,
    answer:
      'CODM allows players to export and import cloud layout strings. For Sensitivity, go to Settings → Sensitivity → Manage → Search tab to paste and preview. For HUDs, go to Settings → Controls → Custom Layout [Go] → Cloud Layout to import. Codes are compatible across both Garena and Global servers.',
  },
  {
    id: 'verified',
    question: 'How do I become a Verified Operator?',
    icon: ShieldCheck,
    answer:
      'Complete your operator enlistment with your genuine CODM In-Game Name, Clan Tag (e.g. 4K, ADMT, IVY), and link your active YouTube, TikTok, or Facebook channels. Operators who consistently publish quality configurations and receive community Charisma earn verified standing.',
  },
  {
    id: 'graphics',
    question: 'Why Medium Graphics + Ultra Frame Rate?',
    icon: Zap,
    answer:
      'Competitive BR players prioritize frame stability and thermal performance. Medium Graphics paired with Ultra (120 FPS) or Max (60 FPS) minimizes device overheating, eliminates frame-drops during intense final-circle gunfights, and maintains optimal visibility through smoke and dense foliage.',
  },
  {
    id: 'charisma',
    question: 'How does Community Charisma work?',
    icon: Flame,
    answer:
      'Tapping the heart gives +1 Charisma to the setup creator. Our trending algorithm evaluates copy frequency, Charisma votes, and recency to promote the most effective setups to the top. There are zero paid placements—ranking is purely community-driven.',
  },
];

export function VaultBriefingModal({
  isOpen,
  onClose,
  onOpenFeedback,
}: VaultBriefingModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="flex flex-col items-center text-center gap-1.5 pb-2 border-b border-black/[0.05]">
          <div className="relative flex size-12 items-center justify-center rounded-[16px] overflow-hidden bg-black/5 shadow-sm ring-1 ring-black/5 mb-1">
            <Image
              src="/airdrop-logo.webp"
              alt="Airdrop"
              width={48}
              height={48}
              className="size-full object-cover"
            />
          </div>
          <DialogTitle className="text-xl font-bold font-heading text-[#1D1D1F]">
            Vault Briefing &amp; Intel
          </DialogTitle>
          <DialogDescription className="text-xs text-[#6E6E73] max-w-sm leading-relaxed">
            Everything you need to know about Airdrop, share codes, and competitive setups.
          </DialogDescription>
        </DialogHeader>

        {/* FAQ Accordion List */}
        <div className="flex flex-col gap-2.5 py-3">
          {FAQ_ITEMS.map(({ id, question, icon: Icon, answer }) => (
            <Collapsible key={id} defaultOpen={id === 'about'}>
              <div className="rounded-2xl border border-black/[0.06] bg-[#F2F2F7]/50 overflow-hidden transition-colors hover:bg-[#F2F2F7]/80">
                <CollapsibleTrigger className="flex w-full items-center justify-between p-3.5 text-left text-xs font-bold text-[#1D1D1F] cursor-pointer group select-none">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-6 items-center justify-center rounded-lg bg-[#0071E3]/10 text-[#0071E3] shrink-0">
                      <Icon className="size-3.5" />
                    </div>
                    <span>{question}</span>
                  </div>
                  <ChevronDown className="size-3.5 text-[#86868B] transition-transform duration-200 group-data-[panel-open]:rotate-180 group-aria-expanded:rotate-180 shrink-0" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-3.5 pb-3.5 pt-0">
                  <p className="text-xs text-[#6E6E73] leading-relaxed pl-8">
                    {answer}
                  </p>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>

        {/* Footer Support / Feedback Prompt */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-black/[0.05] text-xs text-[#86868B]">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-[#34C759]" />
            <span>Season 8 Active Protocols</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenFeedback && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenFeedback();
                }}
                className="rounded-full text-xs font-semibold gap-1.5 border-black/10 text-[#0071E3] hover:bg-[#0071E3]/5"
              >
                <MessageSquare className="size-3" />
                <span>Give Feedback</span>
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={onClose}
              className="rounded-full bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold px-4"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
