import { cn } from '@/lib/cn'

export type StatusPillTone = 'success' | 'warning' | 'error' | 'neutral'

// Design-system tokens, verified against the real Stitch export
// (petrokema_web_admin_2's client-status and invoice-status pills) — not the
// raw emerald/amber/slate this file originally guessed from a generic
// cross-screen note in context/ui-tokens.md. See that file's Chunk 2
// addendum for the correction.
const TONE_CLASSES: Record<StatusPillTone, string> = {
  success: 'bg-secondary-fixed text-on-secondary-fixed-variant',
  warning: 'bg-surface-container-highest text-on-surface',
  error: 'bg-error-container text-on-error-container',
  neutral: 'bg-surface-container-high text-on-surface',
}

export function StatusPill({
  label,
  tone,
}: {
  label: string
  tone: StatusPillTone
}) {
  return (
    <span
      className={cn(
        'font-label-sm inline-flex items-center rounded-full px-2 py-0.5 text-label-sm font-semibold',
        TONE_CLASSES[tone],
      )}
    >
      {label}
    </span>
  )
}
