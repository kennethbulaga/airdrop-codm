'use client';

import React, { useState, useEffect, useTransition } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { signInWithGoogle } from '@/app/auth/actions';
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
import {
  CheckCircle2,
  ChevronRight,
  Compass,
  Crosshair,
  ImagePlus,
  Info,
  Loader2,
  Trash2,
  UploadCloud,
  Zap,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { toast } from 'sonner';
import type { ItemCategory, DeviceType, GripType, GameMode, Playstyle, UserSessionProfile } from '@/lib/types';
import { triggerHaptic } from '@/lib/clipboard';
import { presetSubmissionSchema } from '@/lib/validations';
import { createPresetAction } from '@/app/presets/actions';
import { compressImageToWebP } from '@/lib/image-compression';
import { cn } from '@/lib/utils';

interface SubmissionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
  currentUser?: UserSessionProfile | null;
}

export function SubmissionDrawer({
  isOpen,
  onClose,
  onPostCreated,
  currentUser: initialCurrentUser,
}: SubmissionDrawerProps) {
  const [user, setUser] = useState<UserSessionProfile | null>(initialCurrentUser ?? null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(initialCurrentUser === undefined);
  const [category, setCategory] = useState<ItemCategory>('graphics');
  const [creatorName, setCreatorName] = useState(() => initialCurrentUser?.name || '');
  const [teamName, setTeamName] = useState('');
  const [socialPlatform, setSocialPlatform] = useState('YouTube');
  const [socialUrl, setSocialUrl] = useState('');
  const [code, setCode] = useState('');
  const [mode, setMode] = useState<GameMode>('Battle Royale');
  const [playstyle, setPlaystyle] = useState<Playstyle>('Rusher');
  const [deviceType, setDeviceType] = useState<DeviceType>('Phone');
  const [deviceName, setDeviceName] = useState('');
  const [grip, setGrip] = useState<GripType>('4-Finger Claw');
  const [gyro, setGyro] = useState(true);
  const [description, setDescription] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSigningIn, startSignInTransition] = useTransition();

  const handleGoogleSignIn = () => {
    startSignInTransition(async () => {
      await signInWithGoogle('/?submit=true');
    });
  };

  // Synchronize when initialCurrentUser prop changes
  useEffect(() => {
    if (initialCurrentUser !== undefined) {
      setUser(initialCurrentUser);
      setIsAuthLoading(false);
      if (initialCurrentUser) {
        setCreatorName((prev: string) => prev || initialCurrentUser.name || '');
      }
    }
  }, [initialCurrentUser]);

  // Real-time client session listener & fallback client verification
  useEffect(() => {
    const supabase = createClient();

    if (initialCurrentUser === undefined) {
      supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
        if (currentUser) {
          const profile: UserSessionProfile = {
            id: currentUser.id,
            email: currentUser.email,
            name:
              currentUser.user_metadata?.full_name ||
              currentUser.user_metadata?.name ||
              currentUser.email?.split('@')[0] ||
              'Operator',
            avatarUrl: (currentUser.user_metadata?.avatar_url ||
              currentUser.user_metadata?.picture) as string | undefined,
          };
          setUser(profile);
          setIsAuthLoading(false);
          setCreatorName((prev: string) => prev || profile.name);
        } else {
          setUser(null);
          setIsAuthLoading(false);
        }
      });
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const profile: UserSessionProfile = {
          id: session.user.id,
          email: session.user.email,
          name:
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            session.user.email?.split('@')[0] ||
            'Operator',
          avatarUrl: (session.user.user_metadata?.avatar_url ||
            session.user.user_metadata?.picture) as string | undefined,
        };
        setUser(profile);
        setIsAuthLoading(false);
        setCreatorName((prev: string) => prev || profile.name);
      } else {
        setUser(null);
        setIsAuthLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialCurrentUser]);

  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, WebP)');
      return;
    }
    setIsCompressing(true);
    try {
      const result = await compressImageToWebP(file);
      setScreenshotFile(result.file);
      setScreenshotPreview(result.previewUrl);
      setCompressedSize(result.formattedSize);
      toast.success(
        `Screenshot optimized to ${result.formattedSize} WebP (${result.savingsPercentage}% saved)`
      );
    } catch (err) {
      console.error('Image compression failed:', err);
      toast.error('Failed to process image. Please try another file.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemoveScreenshot = () => {
    if (screenshotPreview) {
      URL.revokeObjectURL(screenshotPreview);
    }
    setScreenshotFile(null);
    setScreenshotPreview(null);
    setCompressedSize(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic(10);

    // Validate category screenshot requirements before starting upload
    if ((category === 'graphics' || category === 'hud') && !screenshotFile) {
      toast.error(
        `A screenshot is required for ${
          category === 'graphics' ? 'Graphics' : 'HUD Layout'
        } setups.`
      );
      return;
    }

    setIsSubmitting(true);

    let uploadedImageUrl: string | null = null;
    if (screenshotFile && user) {
      try {
        const supabase = createClient();
        const fileExt = 'webp';
        const filePath = `${user.id}/${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 8)}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('presets')
          .upload(filePath, screenshotFile, {
            contentType: 'image/webp',
            cacheControl: '31536000',
            upsert: false,
          });

        if (uploadError) {
          setIsSubmitting(false);
          toast.error(`Screenshot upload failed: ${uploadError.message}`);
          return;
        }

        const { data: urlData } = supabase.storage
          .from('presets')
          .getPublicUrl(uploadData.path);
        uploadedImageUrl = urlData.publicUrl;
      } catch (uploadErr) {
        setIsSubmitting(false);
        toast.error('Failed to upload screenshot to storage.');
        return;
      }
    }

    const parsed = presetSubmissionSchema.safeParse({
      user_id: user?.id,
      creator_name: creatorName,
      team_name: teamName || undefined,
      code,
      description: description || undefined,
      category,
      mode,
      playstyle: category !== 'graphics' ? playstyle : undefined,
      device_type: deviceType,
      device_name: deviceName || undefined,
      social_platform: socialPlatform,
      social_handle: socialUrl || undefined,
      grip: category !== 'graphics' ? grip : undefined,
      gyro: category !== 'graphics' ? gyro : undefined,
      image_url: uploadedImageUrl,
    });

    if (!parsed.success) {
      setIsSubmitting(false);
      toast.error(parsed.error.issues[0]?.message || 'Please check your inputs');
      return;
    }

    const res = await createPresetAction(parsed.data);
    setIsSubmitting(false);

    if (!res.success) {
      toast.error(res.error || 'Failed to share setup.');
      return;
    }

    toast.success('Setup shared with the community vault!');
    handleRemoveScreenshot();
    onClose();
    // Reset form
    setCode('');
    setDescription('');
    setDeviceName('');
    setTeamName('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          "w-full rounded-[28px] border border-black/10 bg-white p-6 sm:p-8 shadow-[0_24px_64px_rgba(0,0,0,0.18)] transition-all",
          !isAuthLoading && user ? "sm:max-w-2xl max-h-[90vh] overflow-y-auto" : "sm:max-w-md"
        )}
      >
        {isAuthLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
            <DialogTitle className="sr-only">Checking Authentication</DialogTitle>
            <DialogDescription className="sr-only">
              Verifying your session...
            </DialogDescription>
            <Loader2 className="size-8 animate-spin text-[#0071E3]" />
            <span className="text-xs text-[#86868B] font-medium font-mono">Verifying session...</span>
          </div>
        ) : !user ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            {/* Accessible screen-reader dialog title and description */}
            <DialogTitle className="sr-only">Sign in to Share Setup</DialogTitle>
            <DialogDescription className="sr-only">
              Sign in with Google to publish your setup to the vault.
            </DialogDescription>

            <div className="flex size-14 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#0071E3] to-[#005bb5] text-white shadow-[0_4px_16px_rgba(0,113,227,0.25)] mb-3.5">
              <Crosshair className="size-7 stroke-[2.5]" />
            </div>

            <h3 className="text-xl font-bold font-heading text-[#1D1D1F]">
              Sign in to Share
            </h3>
            <p className="mt-1 text-xs text-[#6E6E73] max-w-xs">
              Connect with Google to publish your setup to the vault.
            </p>

            <div className="mt-6 w-full max-w-xs">
              <Button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="w-full min-h-[44px] h-11 gap-3 rounded-full border border-black/10 bg-white hover:bg-[#F2F2F7] px-5 text-xs font-semibold text-[#1D1D1F] shadow-[0_1px_4px_rgba(0,0,0,0.06)] active:scale-[0.99] transition-all"
              >
                <svg className="size-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isSigningIn ? 'Connecting...' : 'Continue with Google'}</span>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader className="text-left pb-2">
              <DialogTitle className="text-xl font-bold tracking-tight text-[#1D1D1F]">
                Share Setup
              </DialogTitle>
              <DialogDescription className="text-xs text-[#6E6E73]">
                Publish your settings to the vault.
              </DialogDescription>
              <div className="mt-2 flex items-center justify-between gap-2 rounded-xl bg-[#0071E3]/5 border border-[#0071E3]/15 px-3 py-1.5 text-xs text-[#0071E3]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="size-1.5 rounded-full bg-[#0071E3] animate-pulse shrink-0" />
                  <span className="truncate">
                    Publishing as{' '}
                    <strong className="font-semibold">
                      {teamName.trim() ? `${teamName.trim()} ` : ''}
                      {creatorName.trim() || user.name || user.email || 'Operator'}
                    </strong>
                  </span>
                </div>
                {user.email && (
                  <span className="hidden sm:inline text-[10px] text-[#0071E3]/60 font-mono shrink-0">
                    ({user.email})
                  </span>
                )}
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
            {/* Category Selector */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold">Category</Label>
              <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-muted p-1">
                {(['graphics', 'hud', 'sensitivity'] as ItemCategory[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`rounded-lg py-1.5 text-xs font-semibold capitalize transition-all ${
                      category === cat
                        ? 'bg-background text-foreground shadow-apple-pill'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Playstyle Selector (Sensitivity & HUD only) */}
            {category !== 'graphics' && (
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold">Playstyle / Combat Role</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'Rusher' as Playstyle, label: 'Rusher', icon: Zap },
                    { type: 'Sniper' as Playstyle, label: 'Sniper', icon: Crosshair },
                    { type: 'All-Rounder' as Playstyle, label: 'All-Rounder', icon: Compass },
                  ].map(({ type, label, icon: Icon }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPlaystyle(type)}
                      className={`inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-all border ${
                        playstyle === type
                          ? 'bg-[#0071E3] text-white border-[#0071E3] shadow-sm'
                          : 'bg-muted/60 text-muted-foreground border-transparent hover:bg-muted'
                      }`}
                    >
                      <Icon className="size-3.5 stroke-[2.2]" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Creator & Clan */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="creator_name" className="text-xs font-semibold">
                  Player / In-Game Name (IGN) *
                </Label>
                <Input
                  id="creator_name"
                  placeholder="Your in-game name (e.g. Ghost)"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  className="h-10 rounded-xl"
                  maxLength={24}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="team_name" className="text-xs font-semibold">
                  Clan Tag (Optional)
                </Label>
                <Input
                  id="team_name"
                  placeholder="e.g. SQUAD (leave blank if solo)"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="h-10 rounded-xl font-mono text-xs uppercase"
                  maxLength={12}
                />
              </div>
            </div>

            {/* Social Media Link (YouTube / TikTok) */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold">Social Platform (Optional)</Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['YouTube', 'TikTok'] as const).map((plat) => (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => setSocialPlatform(plat)}
                      className={`rounded-xl py-2 text-xs font-semibold transition-all ${
                        socialPlatform === plat
                          ? 'bg-primary text-primary-foreground shadow-apple-pill'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {plat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="social_handle" className="text-xs font-semibold">
                  Channel Handle (Optional)
                </Label>
                <Input
                  id="social_handle"
                  placeholder={socialPlatform === 'TikTok' ? '@handle' : '@channel'}
                  value={socialUrl}
                  onChange={(e) => setSocialUrl(e.target.value)}
                  className="h-10 rounded-xl text-xs"
                  maxLength={32}
                />
              </div>
            </div>

            {/* Share Code */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="code" className="text-xs font-semibold">
                  CODM Share Code *
                </Label>
                {category === 'graphics' && (
                  <span className="text-[11px] text-[#86868B] font-medium">
                    BR Mode Graphic Style
                  </span>
                )}
              </div>
              <Input
                id="code"
                placeholder="e.g. 7123-8941-2041-3921-102"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="h-10 rounded-xl font-mono text-xs"
                maxLength={48}
                required
              />
              {category === 'graphics' && (
                <Collapsible defaultOpen={false} className="mt-0.5">
                  <CollapsibleTrigger className="flex items-center gap-1.5 text-[11px] text-[#0071E3] hover:underline font-medium cursor-pointer">
                    <Info className="size-3" />
                    <span>How to find your graphics share code in CODM</span>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-1.5">
                    <ol className="flex flex-wrap items-center gap-1 text-[10px] sm:text-[11px] text-[#6E6E73] bg-[#F2F2F7] rounded-xl p-2.5 border border-black/[0.04]">
                      <li className="font-semibold text-[#1D1D1F]">1. Settings</li>
                      <ChevronRight className="size-2.5 text-[#86868B]" />
                      <li className="font-semibold text-[#1D1D1F]">2. Audio and Graphics</li>
                      <ChevronRight className="size-2.5 text-[#86868B]" />
                      <li className="font-semibold text-[#1D1D1F]">3. BR Mode Graphic Style</li>
                      <ChevronRight className="size-2.5 text-[#86868B]" />
                      <li className="font-semibold text-[#1D1D1F]">4. Unfold</li>
                      <ChevronRight className="size-2.5 text-[#86868B]" />
                      <li className="font-bold text-[#0071E3]">5. Share (Copy Code)</li>
                    </ol>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>

            {/* Mode & Device Type */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold">Game Mode</Label>
                <div className="flex h-10 items-center justify-between rounded-xl bg-[#0071E3]/5 px-3 text-xs font-semibold text-[#0071E3] border border-[#0071E3]/15">
                  <span>Battle Royale</span>
                  <span className="rounded bg-[#0071E3]/10 px-1.5 py-0.5 font-mono text-[10px] font-bold">ACTIVE META</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold">Device</Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['Phone', 'iPad / Tablet'] as DeviceType[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDeviceType(d)}
                      className={`rounded-xl py-2 text-xs font-semibold transition-all ${
                        deviceType === d
                          ? 'bg-primary text-primary-foreground shadow-apple-pill'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {d === 'iPad / Tablet' ? 'iPad' : 'Phone'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Grip & Gyro (Sensitivity/HUD only) */}
            {category !== 'graphics' && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold">Grip Mechanics</Label>
                  <select
                    value={grip}
                    onChange={(e) => setGrip(e.target.value as GripType)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="2-Finger Thumbs">2-Finger Thumbs</option>
                    <option value="3-Finger">3-Finger</option>
                    <option value="4-Finger Claw">4-Finger Claw</option>
                    <option value="5+ Finger">5+ Finger</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold">Gyroscope</Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { label: 'Gyro ON', val: true },
                      { label: 'Gyro OFF', val: false },
                    ].map((g) => (
                      <button
                        key={g.label}
                        type="button"
                        onClick={() => setGyro(g.val)}
                        className={`rounded-xl py-2 text-xs font-semibold transition-all ${
                          gyro === g.val
                            ? 'bg-primary text-primary-foreground shadow-apple-pill'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Screenshot Upload Dropzone */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <span>Screenshot</span>
                  {category === 'graphics' || category === 'hud' ? (
                    <span className="text-[11px] font-bold text-red-500">* Required</span>
                  ) : (
                    <span className="text-[11px] font-normal text-[#86868B]">(Optional)</span>
                  )}
                </Label>
                {compressedSize && (
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="size-3" />
                    WebP • {compressedSize}
                  </span>
                )}
              </div>

              {/* Hidden native input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageFile(file);
                }}
              />

              {screenshotPreview ? (
                /* Preview Container */
                <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-black/5 p-2 flex flex-col items-center">
                  <div className="relative w-full max-h-52 overflow-hidden rounded-xl flex items-center justify-center bg-black/10">
                    <img
                      src={screenshotPreview}
                      alt="Uploaded setup preview"
                      className="max-h-52 w-auto object-contain rounded-lg shadow-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between w-full mt-2 px-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold text-[#0071E3] hover:underline"
                    >
                      Change screenshot
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveScreenshot}
                      className="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="size-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Dropzone Container */
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleImageFile(file);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-5 text-center cursor-pointer transition-all min-h-[120px]',
                    isDragging
                      ? 'border-[#0071E3] bg-[#0071E3]/5'
                      : 'border-black/[0.12] hover:border-[#0071E3]/50 bg-[#F2F2F7]/40 hover:bg-[#F2F2F7]/70'
                  )}
                >
                  {isCompressing ? (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground py-2">
                      <Loader2 className="size-6 animate-spin text-[#0071E3]" />
                      <span className="text-xs font-medium">Optimizing WebP...</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex size-10 items-center justify-center rounded-xl bg-white text-[#0071E3] shadow-sm border border-black/[0.06]">
                        <ImagePlus className="size-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-[#1D1D1F]">
                          Upload Game Screenshot
                        </span>
                        <span className="text-[11px] text-[#86868B] mt-0.5">
                          Tap to select or drag & drop • Auto-optimized to WebP (&lt;150 KB)
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Player Note / Description (Optional) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="description" className="text-xs font-semibold">
                  Setup Note (Optional)
                </Label>
                <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                  {description.length}/120
                </span>
              </div>
              <Input
                id="description"
                placeholder='e.g. Guaranteed 120 FPS on Alcatraz, zero frame drop'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-10 rounded-xl text-xs"
                maxLength={120}
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-center gap-2.5 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-11 w-full sm:w-auto rounded-full text-xs font-semibold px-6 min-h-[44px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 flex-1 w-full rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-xs min-h-[44px] shadow-[0_2px_8px_rgba(0,113,227,0.25)]"
              >
                {isSubmitting ? 'Sharing...' : 'Share Setup'}
              </Button>
            </div>
          </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
