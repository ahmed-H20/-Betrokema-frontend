import { PRODUCT_FEATURE_PRESETS, REMOVE_LABEL } from '@/constants/strings'

type FeatureCheckboxGroupProps = {
  value: string[]
  onChange: (next: string[]) => void
}

// Presets match the fixed checkbox list from the Stitch design verbatim.
// `value` may also contain names outside the preset list (e.g. carried over
// from a product edited elsewhere) — those render as extra, always-checked
// chips so they're never silently dropped on save.
export function FeatureCheckboxGroup({
  value,
  onChange,
}: FeatureCheckboxGroupProps) {
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

  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {PRODUCT_FEATURE_PRESETS.map((name) => (
        <label
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-surface-container-low px-3 py-1.5 transition-colors hover:bg-surface-container"
          key={name}
        >
          <input
            checked={value.includes(name)}
            className="h-4 w-4 rounded text-primary focus:ring-0"
            onChange={() => toggle(name)}
            type="checkbox"
          />
          <span className="font-label-md text-label-md text-on-surface">
            {name}
          </span>
        </label>
      ))}
      {extras.map((name) => (
        <span
          className="font-label-md flex items-center gap-1.5 rounded-lg bg-secondary-fixed px-3 py-1.5 text-label-md text-on-secondary-fixed-variant"
          key={name}
        >
          {name}
          <button
            aria-label={REMOVE_LABEL}
            onClick={() => removeExtra(name)}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">
              close
            </span>
          </button>
        </span>
      ))}
    </div>
  )
}
