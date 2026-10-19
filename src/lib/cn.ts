import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// tailwind-merge doesn't know our custom fontSize tokens (ui-tokens.md) are
// font-size utilities, not color utilities — "text-label-md" looks the same
// shape as "text-on-surface-variant" to it. Without this, it drops our size
// class whenever a text-color class appears alongside it (same "conflict" group).
//
// Same gap for the custom spacing tokens (space-xs..space-xl, gutter, margin):
// without registering them in the shared "spacing" theme scale, tailwind-merge
// doesn't recognize them as spacing values at all, so p-/px-/m-/gap-/w-/h-/etc.
// utilities using them never conflict-resolve against each other or against the
// built-in numeric scale (e.g. cn('gap-space-sm', 'gap-space-md') keeps both).
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      spacing: [
        'space-xs',
        'space-sm',
        'space-md',
        'space-lg',
        'space-xl',
        'gutter',
        'margin',
      ],
    },
    classGroups: {
      'font-size': [
        {
          text: [
            'headline-xl',
            'headline-xl-mobile',
            'headline-lg',
            'headline-md',
            'headline-sm',
            'title-md',
            'body-lg',
            'body-md',
            'body-sm',
            'label-lg',
            'label-md',
            'label-sm',
          ],
        },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
