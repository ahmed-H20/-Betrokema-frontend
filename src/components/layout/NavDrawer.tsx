import * as DialogPrimitive from '@radix-ui/react-dialog'
import type { ReactNode } from 'react'
import { CLOSE_NAV_DRAWER_LABEL } from '@/constants/strings'

type NavDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

// Tablet (md–xl) hamburger + phone (<md) "المزيد" tab both open this same
// drawer — a Radix Dialog used as a right-side sheet instead of a centered
// dialog. Radix gives focus trap, Esc-to-close and body-scroll-lock for
// free; "closes on route change" is handled by the caller (AppLayout),
// which owns `open`/`onOpenChange` and watches the route. Enter/exit
// animation uses the real @keyframes in index.css, not a transition, so
// Radix's unmount-on-close waits for them to finish (see R1 deviation log
// in context/ui-tokens.md for why a plain `transition-transform` wasn't used
// instead — no animation plugin is installed).
export function NavDrawer({ open, onOpenChange, children }: NavDrawerProps) {
  return (
    <DialogPrimitive.Root onOpenChange={onOpenChange} open={open}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="nav-drawer-overlay fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="nav-drawer-panel fixed right-0 top-0 z-50 flex h-full w-72 flex-col bg-surface-container-low shadow-2xl"
        >
          <DialogPrimitive.Title className="sr-only">
            {CLOSE_NAV_DRAWER_LABEL}
          </DialogPrimitive.Title>
          <div className="flex h-16 shrink-0 items-center justify-end bg-surface-container-lowest px-space-lg">
            <DialogPrimitive.Close
              aria-label={CLOSE_NAV_DRAWER_LABEL}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">
                close
              </span>
            </DialogPrimitive.Close>
          </div>
          <div className="flex-1 overflow-y-auto">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
