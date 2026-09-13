'use client';

import React from 'react';
import Image from 'next/image';
import { Check, ChevronDown, ChevronRight, Copy, Flag, Info, Trash2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { copyToClipboard } from '@/lib/clipboard';
import { toast } from 'sonner';
import type { PostRecord } from '@/lib/types';
import { ReportDialog } from '@/components/ReportDialog';
import { DeleteDialog } from '@/components/DeleteDialog';

interface LightboxModalProps {
  post: PostRecord | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string | null;
}

export function LightboxModal({
  post,
  isOpen,
  onClose,
  currentUserId,
}: LightboxModalProps) {
  const [copied, setCopied] = React.useState(false);
  const [isReportOpen, setIsReportOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  if (!post) return null;

  const isOwner = Boolean(currentUserId && post.user_id && post.user_id === currentUserId);

  const handleCopy = async () => {
    const success = await copyToClipboard(post.code);
    if (success) {
      setCopied(true);
      toast.custom(() => (
        <div className="flex items-center gap-3 rounded-2xl bg-white/95 px-4 py-2.5 text-[#1D1D1F] shadow-[0_12px_32px_rgba(0,0,0,0.15)] border border-black/10 backdrop-blur-xl max-w-sm">
          <div className="flex size-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 shrink-0">
            <Check className="size-3.5 stroke-[3]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold truncate">{post.creator_name}&apos;s code copied!</span>
            <span className="text-[10px] text-[#6E6E73] truncate">Ready to paste into CODM</span>
          </div>
          <span className="ml-auto rounded-full bg-[#0071E3]/10 px-2 py-0.5 font-mono text-[9px] font-bold text-[#0071E3] shrink-0">
            1-TAP
          </span>
        </div>
      ));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="flex flex-col sm:max-w-3xl max-w-full w-full p-0 overflow-hidden max-h-[92dvh] sm:max-h-[88vh]"
        showCloseButton={false}
        showHandle={false}
      >
        {/* Modal Header */}
        <DialogHeader className="border-b border-border/40 p-3.5 sm:p-5 shrink-0 w-full min-w-0 bg-white">
          <div className="flex items-center justify-between gap-2 sm:gap-4 min-w-0 w-full">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <div className="relative flex size-10 items-center justify-center rounded-[12px] overflow-hidden bg-gradient-to-br from-[#0071E3] to-[#005bb5] text-white font-bold text-sm shadow-[0_2px_8px_rgba(0,113,227,0.2)] ring-1 ring-black/5 shrink-0">
                {post.creator_avatar_url ? (
                  <Image
                    src={post.creator_avatar_url}
                    alt={post.creator_name}
                    width={40}
                    height={40}
                    className="size-full object-cover"
                  />
                ) : (
                  <span>{post.creator_name.charAt(0)}</span>
                )}
              </div>
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <DialogTitle className="text-sm sm:text-base font-bold font-heading truncate">
                    {post.creator_name}&apos;s {post.category === 'hud' ? 'HUD Layout' : 'Graphics Spec'}
                  </DialogTitle>
                  {post.team_name && (
                    <Badge variant="outline" className="font-mono text-[10px] shrink-0">
                      {post.team_name}
                    </Badge>
                  )}
                </div>
                <DialogDescription className="text-[11px] sm:text-xs text-muted-foreground leading-normal line-clamp-2 sm:line-clamp-none">
                  {post.device_name || post.device_type}
                  {post.category === 'hud' && post.grip ? ` • ${post.grip}` : ''}
                  {post.category === 'hud' && post.gyro !== null && post.gyro !== undefined ? (post.gyro ? ' • Gyro ON' : ' • Gyro OFF') : ''}
                  {post.category === 'graphics' && post.graphic_quality ? ` • ${post.graphic_quality} Quality` : ''}
                  {post.category === 'graphics' && post.fps_target ? ` • ${post.fps_target} Frame Rate` : ''}
                  {` • ${post.mode} • ${post.season.startsWith('Season') ? post.season : `Season ${post.season.replace(/^S/i, '')}`}`}
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {isOwner ? (
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(true)}
                  className="flex size-9 sm:size-auto sm:px-3 sm:py-1.5 items-center justify-center gap-1.5 text-xs text-red-600 hover:text-red-700 transition-all rounded-full border border-red-500/20 bg-red-500/10 hover:bg-red-500/15 font-semibold active:scale-[0.96]"
                  title="Delete your setup"
                  aria-label="Delete setup"
                >
                  <Trash2 className="size-3.5" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsReportOpen(true)}
                  className="flex size-9 sm:size-auto sm:px-3 sm:py-1.5 items-center justify-center gap-1.5 text-xs text-[#6E6E73] hover:text-red-500 transition-all rounded-full border border-black/[0.08] bg-[#F2F2F7] hover:bg-red-500/10 font-medium active:scale-[0.96]"
                  title="Report inappropriate content"
                  aria-label="Report setup"
                >
                  <Flag className="size-3.5" />
                  <span className="hidden sm:inline">Report</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="flex size-9 sm:size-8 items-center justify-center rounded-full text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/5 transition-all active:scale-[0.96]"
                title="Close"
                aria-label="Close dialog"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Body (Media + Collapsibles) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 w-full overscroll-contain bg-black/[0.02]">
          {/* Screenshot Viewport */}
          <div className="relative w-full bg-black/5 flex items-center justify-center overflow-hidden">
            {post.image_url ? (
              <Image
                src={post.image_url}
                alt={`${post.creator_name}'s CODM ${post.category} configuration`}
                width={1920}
                height={1080}
                unoptimized
                className="w-full h-auto max-h-[50vh] sm:max-h-[60vh] object-contain select-none"
                priority
              />
            ) : (
              <div className="py-16 text-center text-xs text-muted-foreground">
                No screenshot attached for this configuration.
              </div>
            )}
          </div>

          {/* How to Import in CODM (Graphics Section) */}
          {post.category === 'graphics' && (
            <div className="border-t border-border/40 bg-[#F2F2F7]/70 px-3.5 py-2.5 sm:px-6 w-full min-w-0 overflow-hidden">
              <Collapsible defaultOpen={false}>
                <CollapsibleTrigger className="flex w-full items-center justify-between text-xs font-semibold text-[#1D1D1F] hover:text-[#0071E3] transition-colors group cursor-pointer min-w-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                    <div className="flex size-5 items-center justify-center rounded-full bg-[#0071E3]/10 text-[#0071E3] shrink-0">
                      <Info className="size-3" />
                    </div>
                    <span className="truncate">How to import this graphics code in CODM</span>
                  </div>
                  <ChevronDown className="size-3.5 text-[#86868B] shrink-0 transition-transform duration-200 group-data-[panel-open]:rotate-180 group-aria-expanded:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <ol className="flex flex-wrap items-center gap-1.5 text-xs text-[#6E6E73] bg-white rounded-xl p-2.5 border border-black/[0.06] shadow-sm">
                    <li className="flex items-center gap-1 font-medium text-[#1D1D1F]">
                      <span className="flex size-4 items-center justify-center rounded-full bg-[#F2F2F7] text-[10px] font-bold shrink-0">1</span>
                      Settings
                    </li>
                    <ChevronRight className="size-3 text-[#86868B] shrink-0" />
                    <li className="flex items-center gap-1 font-medium text-[#1D1D1F]">
                      <span className="flex size-4 items-center justify-center rounded-full bg-[#F2F2F7] text-[10px] font-bold shrink-0">2</span>
                      Audio and Graphics
                    </li>
                    <ChevronRight className="size-3 text-[#86868B] shrink-0" />
                    <li className="flex items-center gap-1 font-medium text-[#1D1D1F]">
                      <span className="flex size-4 items-center justify-center rounded-full bg-[#F2F2F7] text-[10px] font-bold shrink-0">3</span>
                      BR Mode Graphic Style
                    </li>
                    <ChevronRight className="size-3 text-[#86868B] shrink-0" />
                    <li className="flex items-center gap-1 font-medium text-[#1D1D1F]">
                      <span className="flex size-4 items-center justify-center rounded-full bg-[#F2F2F7] text-[10px] font-bold shrink-0">4</span>
                      Unfold
                    </li>
                    <ChevronRight className="size-3 text-[#86868B] shrink-0" />
                    <li className="flex items-center gap-1 font-bold text-[#0071E3]">
                      <span className="flex size-4 items-center justify-center rounded-full bg-[#0071E3] text-white text-[10px] font-bold shrink-0">5</span>
                      <span>Import then Paste Code</span>
                    </li>
                  </ol>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {/* How to Import in CODM (HUD Layout Section) */}
          {post.category === 'hud' && (
            <div className="border-t border-border/40 bg-[#F2F2F7]/70 px-3.5 py-2.5 sm:px-6 w-full min-w-0 overflow-hidden">
              <Collapsible defaultOpen={false}>
                <CollapsibleTrigger className="flex w-full items-center justify-between text-xs font-semibold text-[#1D1D1F] hover:text-[#0071E3] transition-colors group cursor-pointer min-w-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                    <div className="flex size-5 items-center justify-center rounded-full bg-[#0071E3]/10 text-[#0071E3] shrink-0">
                      <Info className="size-3" />
                    </div>
                    <span className="truncate">How to import this HUD code in CODM</span>
                  </div>
                  <ChevronDown className="size-3.5 text-[#86868B] shrink-0 transition-transform duration-200 group-data-[panel-open]:rotate-180 group-aria-expanded:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <ol className="flex flex-wrap items-center gap-1.5 text-xs text-[#6E6E73] bg-white rounded-xl p-2.5 border border-black/[0.06] shadow-sm">
                    <li className="flex items-center gap-1 font-medium text-[#1D1D1F]">
                      <span className="flex size-4 items-center justify-center rounded-full bg-[#F2F2F7] text-[10px] font-bold shrink-0">1</span>
                      Settings
                    </li>
                    <ChevronRight className="size-3 text-[#86868B] shrink-0" />
                    <li className="flex items-center gap-1 font-medium text-[#1D1D1F]">
                      <span className="flex size-4 items-center justify-center rounded-full bg-[#F2F2F7] text-[10px] font-bold shrink-0">2</span>
                      Controls
                    </li>
                    <ChevronRight className="size-3 text-[#86868B] shrink-0" />
                    <li className="flex items-center gap-1 font-medium text-[#1D1D1F]">
                      <span className="flex size-4 items-center justify-center rounded-full bg-[#F2F2F7] text-[10px] font-bold shrink-0">3</span>
                      Custom Layout [Go]
                    </li>
                    <ChevronRight className="size-3 text-[#86868B] shrink-0" />
                    <li className="flex items-center gap-1 font-medium text-[#1D1D1F]">
                      <span className="flex size-4 items-center justify-center rounded-full bg-[#F2F2F7] text-[10px] font-bold shrink-0">4</span>
                      Cloud Layout
                    </li>
                    <ChevronRight className="size-3 text-[#86868B] shrink-0" />
                    <li className="flex items-center gap-1 font-medium text-[#1D1D1F]">
                      <span className="flex size-4 items-center justify-center rounded-full bg-[#F2F2F7] text-[10px] font-bold shrink-0">5</span>
                      Search / Paste Code
                    </li>
                    <ChevronRight className="size-3 text-[#86868B] shrink-0" />
                    <li className="flex items-center gap-1 font-bold text-[#0071E3]">
                      <span className="flex size-4 items-center justify-center rounded-full bg-[#0071E3] text-white text-[10px] font-bold shrink-0">6</span>
                      <span>Preview & Apply</span>
                    </li>
                  </ol>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {/* How to Import in CODM (Sensitivity Section) */}
          {post.category === 'sensitivity' && (
            <div className="border-t border-border/40 bg-[#F2F2F7]/70 px-3.5 py-2.5 sm:px-6 w-full min-w-0 overflow-hidden">
              <Collapsible defaultOpen={false}>
                <CollapsibleTrigger className="flex w-full items-center justify-between text-xs font-semibold text-[#1D1D1F] hover:text-[#0071E3] transition-colors group cursor-pointer min-w-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                    <div className="flex size-5 items-center justify-center rounded-full bg-[#0071E3]/10 text-[#0071E3] shrink-0">
                      <Info className="size-3" />
                    </div>
                    <span className="truncate">How to import this sensitivity code in CODM</span>
                  </div>
                  <ChevronDown className="size-3.5 text-[#86868B] shrink-0 transition-transform duration-200 group-data-[panel-open]:rotate-180 group-aria-expanded:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <ol className="flex flex-wrap items-center gap-1.5 text-xs text-[#6E6E73] bg-white rounded-xl p-2.5 border border-black/[0.06] shadow-sm">
                    <li className="flex items-center gap-1 font-medium text-[#1D1D1F]">
                      <span className="flex size-4 items-center justify-center rounded-full bg-[#F2F2F7] text-[10px] font-bold shrink-0">1</span>
                      Settings
                    </li>
                    <ChevronRight className="size-3 text-[#86868B] shrink-0" />
                    <li className="flex items-center gap-1 font-medium text-[#1D1D1F]">
                      <span className="flex size-4 items-center justify-center rounded-full bg-[#F2F2F7] text-[10px] font-bold shrink-0">2</span>
                      Sensitivity
                    </li>
                    <ChevronRight className="size-3 text-[#86868B] shrink-0" />
                    <li className="flex items-center gap-1 font-medium text-[#1D1D1F]">
                      <span className="flex size-4 items-center justify-center rounded-full bg-[#F2F2F7] text-[10px] font-bold shrink-0">3</span>
                      Manage (bottom right)
                    </li>
                    <ChevronRight className="size-3 text-[#86868B] shrink-0" />
                    <li className="flex items-center gap-1 font-medium text-[#1D1D1F]">
                      <span className="flex size-4 items-center justify-center rounded-full bg-[#F2F2F7] text-[10px] font-bold shrink-0">4</span>
                      Search tab
                    </li>
                    <ChevronRight className="size-3 text-[#86868B] shrink-0" />
                    <li className="flex items-center gap-1 font-bold text-[#0071E3]">
                      <span className="flex size-4 items-center justify-center rounded-full bg-[#0071E3] text-white text-[10px] font-bold shrink-0">5</span>
                      <span>Paste &amp; Preview</span>
                    </li>
                  </ol>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}
        </div>

        {/* Stable Tactical Footbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/40 p-3.5 sm:p-4 sm:px-6 bg-white shrink-0 min-w-0 w-full pb-[calc(0.875rem+env(safe-area-inset-bottom))] sm:pb-4">
          <p className="text-xs text-muted-foreground max-w-md italic truncate text-center sm:text-left w-full sm:w-auto">
            &ldquo;{post.description || post.layout_highlight || 'Community shared configuration.'}&rdquo;
          </p>

          <div className="flex w-full sm:w-auto items-center gap-2 shrink-0 min-w-0">
            <div className="flex-1 sm:flex-initial rounded-xl bg-muted/70 px-3 py-2 text-center font-mono text-xs font-semibold truncate select-all">
              {post.code}
            </div>
            <Button
              size="sm"
              onClick={handleCopy}
              className="min-h-[44px] min-w-[44px] shrink-0 gap-1.5 rounded-xl px-4 text-xs font-semibold active:scale-[0.96] transition-transform"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </Button>
          </div>
        </div>
      </DialogContent>

      {isOwner && (
        <DeleteDialog
          presetId={post.id}
          creatorName={post.creator_name}
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onDeleted={onClose}
        />
      )}

      <ReportDialog
        presetId={post.id}
        creatorName={post.creator_name}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onReported={onClose}
      />
    </Dialog>
  );
}
