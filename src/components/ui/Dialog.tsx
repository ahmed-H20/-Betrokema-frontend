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
            'fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-full -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-2xl',
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
}

export function DialogHeader({
  title,
  subtitle,
  onClose,
  icon,
}: DialogHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-primary px-6 py-4 text-on-primary">
      <div className="flex items-center gap-3">
        {icon ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-on-secondary">
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
