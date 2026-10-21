import * as DialogPrimitive from '@radix-ui/react-dialog'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type DialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  widthClassName?: string
}

export function Dialog({
  open,
  onOpenChange,
  children,
  widthClassName = 'max-w-lg',
}: DialogProps) {
  return (
    <DialogPrimitive.Root onOpenChange={onOpenChange} open={open}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className={cn(
            // R1: below `md`, every dialog is a full-screen sheet (no
            // rounding, fills the viewport) instead of a centered card —
            // `md:` and up restores the exact previous centered-dialog
            // classes untouched.
            'fixed inset-0 z-50 flex h-dvh max-h-dvh w-full flex-col overflow-hidden bg-surface-container-lowest shadow-2xl',
            'md:inset-auto md:left-1/2 md:top-1/2 md:h-auto md:max-h-[90vh] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl',
            widthClassName,
          )}
        >
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

type DialogHeaderProps = {
  title: string
  subtitle?: string
  onClose: () => void
  icon?: string
  iconClassName?: string
}

export function DialogHeader({
  title,
  subtitle,
  onClose,
  icon,
  iconClassName = 'bg-secondary text-on-secondary',
}: DialogHeaderProps) {
  return (
    <div className="flex shrink-0 items-center justify-between bg-primary px-5 sm:px-6 py-3.5 sm:py-4 text-on-primary">
      <div className="flex items-center gap-3">
        {icon ? (
          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg',
              iconClassName,
            )}
          >
            <span className="material-symbols-outlined text-[20px]">
              {icon}
            </span>
          </div>
        ) : null}
        <div>
          <DialogPrimitive.Title className="font-headline-sm text-headline-sm">
            {title}
          </DialogPrimitive.Title>
          {subtitle ? (
            <span className="font-label-sm block text-label-sm text-on-primary-container">
              {subtitle}
            </span>
          ) : null}
        </div>
      </div>
      <button
        aria-label="إغلاق"
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-white/20"
        onClick={onClose}
        type="button"
      >
        <span className="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>
  )
}
