'use client';

import React, { useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { deletePresetAction } from '@/app/presets/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface DeleteDialogProps {
  presetId: string;
  creatorName: string;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}

export function DeleteDialog({
  presetId,
  creatorName,
  isOpen,
  onClose,
  onDeleted,
}: DeleteDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deletePresetAction(presetId);
      if (!res.success) {
        toast.error(res.error || 'Failed to delete setup.');
        return;
      }

      toast.success('Setup deleted from the vault.');
      onDeleted?.();
      onClose();
      router.refresh();
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('An unexpected error occurred while deleting.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isDeleting && onClose()}>
      <DialogContent className="sm:max-w-md w-full rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_24px_64px_rgba(0,0,0,0.18)]">
        <DialogHeader className="flex flex-col items-center text-center pb-1">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 mb-3 shadow-sm">
            <Trash2 className="size-6 stroke-[2.2]" />
          </div>
          <DialogTitle className="text-lg font-bold font-heading text-[#1D1D1F]">
            Delete Setup?
          </DialogTitle>
          <DialogDescription className="text-xs text-[#6E6E73] max-w-xs mt-1.5 leading-relaxed">
            Are you sure you want to remove your setup from the community vault? This will delete the configuration code and screenshot. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col-reverse sm:flex-row items-center gap-2 pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="h-10 w-full sm:w-auto rounded-full text-xs font-semibold px-5 min-h-[44px]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-10 flex-1 w-full rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs min-h-[44px] shadow-sm"
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="size-3.5 mr-1.5" />
                <span>Delete Setup</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
