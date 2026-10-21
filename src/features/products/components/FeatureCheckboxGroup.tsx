import { useState, type KeyboardEvent } from 'react'
import { PRODUCT_FEATURE_PRESETS, REMOVE_LABEL } from '@/constants/strings'

type FeatureCheckboxGroupProps = {
  value: string[]
  onChange: (next: string[]) => void
}

export function FeatureCheckboxGroup({
  value,
  onChange,
}: FeatureCheckboxGroupProps) {
  const [customInput, setCustomInput] = useState('')
  const presets: readonly string[] = PRODUCT_FEATURE_PRESETS
  const extras = value.filter((name) => !presets.includes(name))

  function toggle(name: string) {
    onChange(
      value.includes(name)
        ? value.filter((item) => item !== name)
        : [...value, name],
    )
  }

  function removeExtra(name: string) {
    onChange(value.filter((item) => item !== name))
  }

  function handleAddCustom() {
    const trimmed = customInput.trim()
    if (!trimmed) return

    // If it's already in presets, ensure it is selected
    if (presets.includes(trimmed)) {
      if (!value.includes(trimmed)) {
        onChange([...value, trimmed])
      }
      setCustomInput('')
      return
    }

    // If already in value, don't duplicate
    if (value.includes(trimmed)) {
      setCustomInput('')
      return
    }

    onChange([...value, trimmed])
    setCustomInput('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
      handleAddCustom()
    }
  }

  return (
    <div className="space-y-3 pt-1">
      {/* Feature Presets & Active Extras */}
      <div className="flex flex-wrap items-center gap-2">
        {PRODUCT_FEATURE_PRESETS.map((name) => {
          const isChecked = value.includes(name)
          return (
            <label
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 transition-all select-none border ${
                isChecked
                  ? 'bg-primary/10 border-primary/40 text-primary font-medium shadow-xs'
                  : 'bg-surface-container-low border-transparent text-on-surface hover:bg-surface-container'
              }`}
              key={name}
            >
              <input
                checked={isChecked}
                className="h-4 w-4 rounded text-primary focus:ring-0 cursor-pointer"
                onChange={() => toggle(name)}
                type="checkbox"
              />
              <span className="font-label-md text-label-md">
                {name}
              </span>
            </label>
          )
        })}

        {extras.map((name) => (
          <span
            className="font-label-md inline-flex items-center gap-1.5 rounded-lg bg-secondary-fixed border border-secondary/25 px-3 py-1.5 text-label-md text-on-secondary-fixed-variant shadow-xs transition-all"
            key={name}
          >
            <span className="material-symbols-outlined text-[15px] text-secondary">
              verified
            </span>
            <span>{name}</span>
            <button
              aria-label={`${REMOVE_LABEL} ${name}`}
              className="inline-flex items-center justify-center rounded-full p-0.5 text-on-secondary-fixed-variant/80 hover:bg-black/10 hover:text-on-secondary-fixed-variant transition-colors"
              onClick={() => removeExtra(name)}
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">
                close
              </span>
            </button>
          </span>
        ))}
      </div>

      {/* Custom Feature Text String Input */}
      <div className="flex items-center gap-2 pt-1">
        <div className="relative flex-1">
          <input
            className="h-10 w-full rounded-lg bg-surface-container-low px-3 py-2 pr-9 font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/60 focus:bg-surface-container-highest focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اكتب خاصية فنية مخصصة (مثال: سريع الجفاف، مقاوم للبكتيريا، ذو رائحة منعدمة...)"
            type="text"
            value={customInput}
          />
          <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant/60">
            add_task
          </span>
        </div>
        <button
          className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-4 font-label-md text-label-md text-on-primary transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40 shadow-xs"
          disabled={!customInput.trim()}
          onClick={handleAddCustom}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>إضافة خاصية</span>
        </button>
      </div>
    </div>
  )
}

