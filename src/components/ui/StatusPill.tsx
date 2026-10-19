import { cn } from '@/lib/cn'

export type StatusPillTone = 'success' | 'warning' | 'error' | 'neutral'

// Raw semantic colors (emerald/amber/slate), not the design-system tokens —
// per context/ui-tokens.md "Semantic status colors in actual use on
// screens": paid/active = emerald, pending/partial = amber, neutral = slate.
// Critical/overdue reuses the app's own `error`/`error-container` tokens
// rather than a separate crimson, per the same note (desktop screens only).
const TONE_CLASSES: Record<StatusPillTone, string> = {
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  error: 'bg-error-container text-on-error-container',
  neutral: 'bg-slate-100 text-slate-600',
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
        'font-label-sm inline-flex items-center rounded-md px-2 py-1 text-label-sm font-semibold',
        TONE_CLASSES[tone],
      )}
    >
      {label}
    </span>
  )
}
