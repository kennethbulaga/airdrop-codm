'use client';

import React from 'react';
import Image from 'next/image';
import { Check, ChevronDown, ChevronRight, Copy, ExternalLink, Flag, Info, Trash2, X } from 'lucide-react';
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

export function LightboxModal({ post, isOpen, onClose, currentUserId }: LightboxModalProps) {
  const [copied, setCopied] = React.useState(false);
  const [isReportOpen, setIsReportOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  if (!post) return null;

  const isOwner = Boolean(currentUserId && post.user_id && post.user_id === currentUserId);

  const handleCopy = async () => {
    const success = await copyToClipboard(post.code);
    if (success) {
      setCopied(true);
      toast.success('Share code copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl w-full overflow-hidden rounded-3xl border-border/60 bg-card/95 p-0 backdrop-blur-xl shadow-apple-island">
        <DialogHeader className="border-b border-border/40 p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex size-10 items-center justify-center rounded-[12px] overflow-hidden bg-gradient-to-br from-[#0071E3] to-[#005bb5] text-white font-bold text-sm shadow-[0_2px_8px_rgba(0,113,227,0.2)] ring-1 ring-black/5 shrink-0">
                {post.creator_avatar_url ? (
                  <img
                    src={post.creator_avatar_url}
                    alt={post.creator_name}
                    className="size-full object-cover"
                  />
                ) : (
                  <span>{post.creator_name.charAt(0)}</span>
                )}
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="text-base sm:text-lg font-bold font-heading">
                    {post.creator_name}&apos;s {post.category === 'hud' ? 'HUD Layout' : 'Graphics Spec'}
                  </DialogTitle>
                  {post.team_name && (
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {post.team_name}
                    </Badge>
                  )}
                </div>
                <DialogDescription className="text-xs text-muted-foreground">
                  {post.device_name || post.device_type} • {post.mode} • Season {post.season}
                </DialogDescription>
              </div>
            </div>

            {isOwner ? (
              <button
                type="button"
                onClick={() => setIsDeleteOpen(true)}
                className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 transition-colors px-3 py-1.5 rounded-full border border-red-500/20 bg-red-500/10 hover:bg-red-500/15 shrink-0 font-semibold"
                title="Delete your setup"
                aria-label="Delete setup"
              >
                <Trash2 className="size-3.5" />
                <span>Delete</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsReportOpen(true)}
                className="flex items-center gap-1.5 text-xs text-[#6E6E73] hover:text-red-500 transition-colors px-3 py-1.5 rounded-full border border-black/[0.08] bg-[#F2F2F7] hover:bg-red-500/10 shrink-0 font-medium"
                title="Report inappropriate content"
                aria-label="Report preset"
              >
                <Flag className="size-3.5" />
                <span className="hidden sm:inline">Report</span>
              </button>
            )}
          </div>
        </DialogHeader>

        {/* Screenshot Viewport (Dynamically adapts to Phone 19.5:9/20:9/16:9 or Tablet 4:3 dimensions) */}
        <div className="relative w-full bg-black/5 flex items-center justify-center overflow-hidden">
          {post.image_url ? (
            <img
              src={post.image_url}
              alt={`${post.creator_name}'s CODM ${post.category} configuration`}
              className="w-full max-h-[65vh] object-contain select-none"
            />
          ) : (
            <div className="py-16 text-center text-xs text-muted-foreground">
              No screenshot attached for this configuration.
            </div>
          )}
        </div>

        {/* How to Import in CODM (Graphics Section) */}
        {post.category === 'graphics' && (
          <div className="border-t border-border/40 bg-[#F2F2F7]/70 px-4 py-2.5 sm:px-6">
            <Collapsible defaultOpen={false}>
              <CollapsibleTrigger className="flex w-full items-center justify-between text-xs font-semibold text-[#1D1D1F] hover:text-[#0071E3] transition-colors group cursor-pointer">
                <div className="flex items-center gap-2">
                  <div className="flex size-5 items-center justify-center rounded-full bg-[#0071E3]/10 text-[#0071E3]">
                    <Info className="size-3" />
                  </div>
                  <span>How to import this graphics code in CODM</span>
                </div>
                <ChevronDown className="size-3.5 text-[#86868B] transition-transform duration-200 group-data-[panel-open]:rotate-180 group-aria-expanded:rotate-180" />
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

        {/* Tactical Footbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/40 p-4 sm:px-6">
          <p className="text-xs text-muted-foreground max-w-md italic">
            &ldquo;{post.description || post.layout_highlight || 'Community shared configuration.'}&rdquo;
          </p>

          <div className="flex w-full sm:w-auto items-center gap-2">
            <div className="flex-1 sm:flex-initial rounded-xl bg-muted/70 px-3 py-2 text-center font-mono text-xs font-semibold">
              {post.code}
            </div>
            <Button
              size="sm"
              onClick={handleCopy}
              className="min-h-[44px] min-w-[44px] gap-1.5 rounded-xl px-4 text-xs font-semibold"
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
