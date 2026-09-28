import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Spinner } from './common';

const SIZES = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-xl',
  lg: 'sm:max-w-3xl',
  xl: 'sm:max-w-4xl',
};

/**
 * Scrollable form dialog with a fixed header and footer.
 * While `busy` is true it cannot be dismissed, so a save is never interrupted halfway.
 */
export function FormDialog({ open, onOpenChange, title, description, size = 'lg', busy, onSubmit, submitLabel, submitDisabled, children }) {
  const guardedChange = (next) => {
    if (busy && !next) return;
    onOpenChange(next);
  };
  const block = (e) => busy && e.preventDefault();

  return (
    <Dialog open={open} onOpenChange={guardedChange}>
      <DialogContent
        className={cn('flex max-h-[92svh] flex-col gap-0 p-0', SIZES[size])}
        onInteractOutside={block}
        onEscapeKeyDown={block}
        showCloseButton={!busy}
      >
        <DialogHeader className="border-b px-6 pt-6 pb-4 text-left">
          <DialogTitle className="text-lg">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">{children}</div>
          <DialogFooter className="border-t bg-muted/40 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
              Ləğv et
            </Button>
            <Button type="submit" disabled={busy || submitDisabled}>
              {busy && <Spinner />}
              {busy ? 'Yadda saxlanılır…' : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** target: { title, name, description? } — `onConfirm` may be async; the dialog stays open until it resolves. */
export function ConfirmDeleteDialog({ target, onCancel, onConfirm, confirmLabel = 'Bəli, sil' }) {
  const [pending, setPending] = useState(false);

  const confirm = async () => {
    setPending(true);
    try {
      await onConfirm();
    } finally {
      setPending(false);
    }
  };

  return (
    <AlertDialog open={!!target} onOpenChange={(open) => !open && !pending && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{target?.title || 'Silinməni təsdiqləyin'}</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-medium text-foreground">«{target?.name}»</span>{' '}
            {target?.description || 'həmişəlik silinəcək. Bu əməliyyatı geri qaytarmaq mümkün deyil.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Ləğv et</AlertDialogCancel>
          {/* A plain button (not AlertDialogAction) so the dialog doesn't close before the request finishes. */}
          <Button variant="destructive" onClick={confirm} disabled={pending}>
            {pending && <Spinner />}
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
