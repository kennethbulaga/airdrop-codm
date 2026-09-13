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
import { Loader2, UserCog } from 'lucide-react';
import { toast } from 'sonner';
import type { UserSessionProfile } from '@/lib/types';
import { updateProfileAction } from '@/app/profile/actions';
import { triggerHaptic } from '@/lib/clipboard';
import { YouTubeIcon, TikTokIcon, FacebookIcon } from './SocialIcons';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSessionProfile;
  onProfileUpdated: (updated: UserSessionProfile) => void;
}

export function ProfileSettingsModal({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated,
}: ProfileSettingsModalProps) {
  const [ign, setIgn] = useState(currentUser.name || '');
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

  const handleSave = (e: React.FormEvent) => {
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
        toast.error(res.error || 'Failed to update profile');
        return;
      }

      toast.success('Player profile updated! All setups synced.');
      onProfileUpdated({
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col gap-1.5 pb-2">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-xl bg-[#0071E3]/10 text-[#0071E3]">
              <UserCog className="size-4" />
            </div>
            <DialogTitle className="text-lg font-bold font-heading text-[#1D1D1F]">
              Player Identity Settings
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-[#86868B] leading-relaxed">
            Manage your verified Call of Duty: Mobile In-Game Name (IGN) and esports clan. Changing your IGN automatically syncs across all your existing shared presets.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="flex flex-col gap-3.5 mt-2">
          {/* IGN Field */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="player-ign" className="text-xs font-semibold text-[#1D1D1F]">
              CODM In-Game Name (IGN) *
            </Label>
            <Input
              id="player-ign"
              value={ign}
              onChange={(e) => setIgn(e.target.value)}
              placeholder="e.g. Aerith, Wooga, Viper"
              maxLength={24}
              required
              className="h-10 rounded-xl border border-black/10 bg-[#F2F2F7]/60 px-3 text-sm font-semibold text-[#1D1D1F] focus-visible:ring-[#0071E3]"
            />
            <span className="text-[11px] text-[#86868B]">
              This is the name displayed as author on all your setups.
            </span>
          </div>

          {/* Clan Tag Field */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="clan-tag" className="text-xs font-semibold text-[#1D1D1F]">
                Esports Clan Tag
              </Label>
              <span className="text-[10px] text-[#86868B] font-mono">Optional</span>
            </div>
            <Input
              id="clan-tag"
              value={clanTag}
              onChange={(e) => setClanTag(e.target.value.toUpperCase())}
              placeholder="4K, ADMT, IVY"
              maxLength={8}
              className="h-10 rounded-xl border border-black/10 bg-[#F2F2F7]/60 px-3 text-sm font-mono font-bold tracking-tight text-[#1D1D1F] focus-visible:ring-[#0071E3]"
            />
            <span className="text-[11px] text-[#86868B]">
              Brackets are omitted automatically to adhere to clean esports badges.
            </span>
          </div>

          {/* 3 Social Media Displays (YouTube, TikTok, Facebook) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-[#1D1D1F]">Creator Channels</Label>
              <span className="text-[10px] text-[#86868B] font-mono">Up to 3 • Optional</span>
            </div>

            {/* YouTube */}
            <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-[#F2F2F7]/60 px-3 py-1.5 focus-within:border-[#0071E3] focus-within:ring-2 focus-within:ring-[#0071E3]/20 transition-all">
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
            <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-[#F2F2F7]/60 px-3 py-1.5 focus-within:border-[#0071E3] focus-within:ring-2 focus-within:ring-[#0071E3]/20 transition-all">
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
            <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-[#F2F2F7]/60 px-3 py-1.5 focus-within:border-[#0071E3] focus-within:ring-2 focus-within:ring-[#0071E3]/20 transition-all">
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

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/[0.06]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl border-black/10 text-xs font-semibold hover:bg-[#F2F2F7]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold shadow-[0_2px_8px_rgba(0,113,227,0.25)] min-w-[120px]"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  <span>Syncing...</span>
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
