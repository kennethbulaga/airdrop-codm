'use client';

import React, { useState } from 'react';
import { Flag, Loader2, ShieldAlert } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { reportPresetAction } from '@/app/presets/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ReportDialogProps {
  presetId: string;
  creatorName: string;
  isOpen: boolean;
  onClose: () => void;
  onReported?: () => void;
}

const REPORT_REASONS = [
  { id: 'explicit_image', label: 'Explicit or inappropriate screenshot' },
  { id: 'fake_code', label: 'Fake, broken, or expired share code' },
  { id: 'offensive_text', label: 'Offensive player name or note' },
  { id: 'spam', label: 'Spam, advertising, or duplicate setup' },
] as const;

export function ReportDialog({
  presetId,
  creatorName,
  isOpen,
  onClose,
  onReported,
}: ReportDialogProps) {
  const router = useRouter();
  const [selectedReason, setSelectedReason] = useState<string>('explicit_image');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await reportPresetAction(presetId, selectedReason);
      if (!res.success) {
        toast.error(res.error || 'Failed to submit report.');
        return;
      }

      const isQuarantined = (res.data as { is_quarantined?: boolean })?.is_quarantined;
      if (isQuarantined) {
        toast.success('Report received. Setup has been automatically quarantined.');
        router.refresh();
      } else {
        toast.success('Report received. Thank you for keeping the vault safe.');
      }

      onReported?.();
      onClose();
    } catch (err) {
      console.error('Report submission failed:', err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md w-full rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_24px_64px_rgba(0,0,0,0.18)]">
        <DialogHeader className="flex flex-col items-center text-center pb-2">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 mb-3 shadow-sm">
            <ShieldAlert className="size-6 stroke-[2.2]" />
          </div>
          <DialogTitle className="text-lg font-bold font-heading text-[#1D1D1F]">
            Report {creatorName}&apos;s Setup
          </DialogTitle>
          <DialogDescription className="text-xs text-[#6E6E73] max-w-xs mt-1">
            Help maintain high safety standards in the vault. If 3 players report this setup, it will be automatically quarantined.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 py-2">
          {REPORT_REASONS.map((reason) => (
            <label
              key={reason.id}
              className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                selectedReason === reason.id
                  ? 'border-[#0071E3] bg-[#0071E3]/5 ring-2 ring-[#0071E3]/20'
                  : 'border-black/[0.08] hover:bg-black/[0.02]'
              }`}
            >
              <input
                type="radio"
                name="reportReason"
                value={reason.id}
                checked={selectedReason === reason.id}
                onChange={() => setSelectedReason(reason.id)}
                className="size-4 accent-[#0071E3]"
              />
              <span className="text-xs font-medium text-[#1D1D1F]">
                {reason.label}
              </span>
            </label>
          ))}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row items-center gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-10 w-full sm:w-auto rounded-full text-xs font-semibold px-5 min-h-[44px]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-10 flex-1 w-full rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs min-h-[44px] shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Flag className="size-3.5 mr-1.5" />
                <span>Submit Report</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
