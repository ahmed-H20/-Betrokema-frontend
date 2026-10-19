import { cn } from '@/lib/cn'

type StateMessageProps = {
  text: string
  tone?: 'muted' | 'error'
  minHeightClassName?: string
}

export function StateMessage({
  text,
  tone = 'muted',
  minHeightClassName = 'min-h-[120px]',
}: StateMessageProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-xl bg-surface-container-lowest',
        minHeightClassName,
      )}
    >
      <span
        className={cn(
          'font-body-md text-body-md',
          tone === 'error' ? 'text-error' : 'text-on-surface-variant',
        )}
      >
        {text}
      </span>
    </div>
  )
}
