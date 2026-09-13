'use client';

import React, { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, Crosshair, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { UserSessionProfile } from '@/lib/types';
import { updateProfileAction } from '@/app/profile/actions';
import { triggerHaptic } from '@/lib/clipboard';
import { YouTubeIcon, TikTokIcon, FacebookIcon } from './SocialIcons';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSessionProfile;
  onComplete: (updated: UserSessionProfile) => void;
}

export function OnboardingModal({
  isOpen,
  onClose,
  currentUser,
  onComplete,
}: OnboardingModalProps) {
  const [ign, setIgn] = useState(
    currentUser.name !== 'Operator' && !currentUser.name.includes('@') ? currentUser.name : ''
  );
  const [clanTag, setClanTag] = useState(currentUser.clanTag || '');
  const [youtubeUrl, setYoutubeUrl] = useState(currentUser.youtubeUrl || '');
  const [tiktokUrl, setTiktokUrl] = useState(currentUser.tiktokUrl || '');
  const [facebookUrl, setFacebookUrl] = useState(currentUser.facebookUrl || '');
  const [isPending, startTransition] = useTransition();

  const formatLink = (platform: 'YouTube' | 'TikTok' | 'Facebook', val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    const cleanHandle = trimmed.replace(/^@/, '');
    if (platform === 'YouTube') return `https://youtube.com/@${cleanHandle}`;
    if (platform === 'TikTok') return `https://tiktok.com/@${cleanHandle}`;
    if (platform === 'Facebook') return `https://facebook.com/${cleanHandle}`;
    return trimmed;
  };

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic(8);

    if (!ign.trim() || ign.trim().length < 2) {
      toast.error('In-game name must be at least 2 characters');
      return;
    }

    const finalYoutube = formatLink('YouTube', youtubeUrl);
    const finalTiktok = formatLink('TikTok', tiktokUrl);
    const finalFacebook = formatLink('Facebook', facebookUrl);

    startTransition(async () => {
      const res = await updateProfileAction({
        ign: ign.trim(),
        clan_tag: clanTag.trim() || null,
        youtube_url: finalYoutube,
        tiktok_url: finalTiktok,
        facebook_url: finalFacebook,
      });

      if (!res.success || !res.data) {
        toast.error(res.error || 'Failed to complete setup');
        return;
      }

      toast.success(`Welcome to the Vault, ${res.data.name}!`);
      onComplete({
        ...currentUser,
        name: res.data.name,
        clanTag: res.data.clanTag,
        hasCompletedOnboarding: true,
        youtubeUrl: res.data.youtubeUrl,
        tiktokUrl: res.data.tiktokUrl,
        facebookUrl: res.data.facebookUrl,
      });
      onClose();
    });
  };

  const initial = (currentUser.name || 'O').charAt(0).toUpperCase();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center text-center gap-2 pb-1">
          <div className="relative mb-1">
            <Avatar className="size-16 ring-4 ring-[#0071E3]/20 shadow-md">
              {currentUser.avatarUrl && <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />}
              <AvatarFallback className="bg-gradient-to-br from-[#0071E3] to-[#005bb5] text-white font-bold text-xl">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-[#0071E3] text-white ring-2 ring-white">
              <Crosshair className="size-3.5" />
            </div>
          </div>

          <DialogTitle className="text-xl font-bold font-heading text-[#1D1D1F]">
            Welcome, Operator
          </DialogTitle>
          <DialogDescription className="text-xs text-[#86868B] max-w-xs leading-relaxed">
            Set your Call of Duty: Mobile In-Game Name (IGN) once. All your shared layouts, sensitivities, and graphics will be verified under this identity.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleComplete} className="flex flex-col gap-3.5 mt-2">
          {/* IGN Field */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="onboarding-ign" className="text-xs font-semibold text-[#1D1D1F]">
              CODM In-Game Name (IGN) *
            </Label>
            <Input
              id="onboarding-ign"
              value={ign}
              onChange={(e) => setIgn(e.target.value)}
              placeholder="e.g. Aerith, Wooga, Viper"
              maxLength={24}
              required
              autoFocus
              className="h-10 rounded-xl border border-black/10 bg-[#F2F2F7]/70 px-3.5 text-sm font-semibold text-[#1D1D1F] focus-visible:ring-[#0071E3]"
            />
            <span className="text-[11px] text-[#86868B]">
              You can change this later from your profile settings anytime.
            </span>
          </div>

          {/* Clan Tag Field */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="onboarding-clan" className="text-xs font-semibold text-[#1D1D1F]">
                Esports Clan Tag
              </Label>
              <span className="text-[10px] text-[#86868B] font-mono">Optional</span>
            </div>
            <Input
              id="onboarding-clan"
              value={clanTag}
              onChange={(e) => setClanTag(e.target.value.toUpperCase())}
              placeholder="4K, ADMT, IVY"
              maxLength={8}
              className="h-10 rounded-xl border border-black/10 bg-[#F2F2F7]/70 px-3.5 text-sm font-mono font-bold tracking-tight text-[#1D1D1F] focus-visible:ring-[#0071E3]"
            />
          </div>

          {/* 3 Social Media Displays (YouTube, TikTok, Facebook) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-[#1D1D1F]">Creator Channels</Label>
              <span className="text-[10px] text-[#86868B] font-mono">Up to 3 • Optional</span>
            </div>

            {/* YouTube */}
            <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-[#F2F2F7]/70 px-3 py-1.5 focus-within:border-[#0071E3] focus-within:ring-2 focus-within:ring-[#0071E3]/20 transition-all">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#FF0000]/10 text-[#FF0000]">
                <YouTubeIcon className="size-3.5" />
              </div>
              <Input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="YouTube handle or URL (e.g. @WoogaCODM)"
                className="h-7 border-0 bg-transparent px-0 text-xs text-[#1D1D1F] focus-visible:ring-0 placeholder:text-[#86868B]"
              />
            </div>

            {/* TikTok */}
            <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-[#F2F2F7]/70 px-3 py-1.5 focus-within:border-[#0071E3] focus-within:ring-2 focus-within:ring-[#0071E3]/20 transition-all">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-black/10 text-[#1D1D1F]">
                <TikTokIcon className="size-3.5" />
              </div>
              <Input
                type="text"
                value={tiktokUrl}
                onChange={(e) => setTiktokUrl(e.target.value)}
                placeholder="TikTok handle or URL (e.g. @woogagaming)"
                className="h-7 border-0 bg-transparent px-0 text-xs text-[#1D1D1F] focus-visible:ring-0 placeholder:text-[#86868B]"
              />
            </div>

            {/* Facebook */}
            <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-[#F2F2F7]/70 px-3 py-1.5 focus-within:border-[#0071E3] focus-within:ring-2 focus-within:ring-[#0071E3]/20 transition-all">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#1877F2]/10 text-[#1877F2]">
                <FacebookIcon className="size-3.5" />
              </div>
              <Input
                type="text"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="Facebook page link or username"
                className="h-7 border-0 bg-transparent px-0 text-xs text-[#1D1D1F] focus-visible:ring-0 placeholder:text-[#86868B]"
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-11 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-bold shadow-[0_2px_10px_rgba(0,113,227,0.3)] transition-all active:scale-[0.98]"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  <span>Enlisting Operator...</span>
                </>
              ) : (
                <div className="flex items-center justify-center gap-1.5">
                  <span>Enter Settings Vault</span>
                  <ArrowRight className="size-3.5" />
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
