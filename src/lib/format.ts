// Latin digits, grouped thousands — matches the Stitch export's LTR numeral
// convention inside RTL text (see context/ui-tokens.md RTL notes).
const numberFormatter = new Intl.NumberFormat('en-US')

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

export type ArabicPluralForms = {
  one: string
  two: string
  few: string // 3-10
  many: string // 0, 11+ (accusative singular — same spelling as `one`, this
  // app doesn't use diacritics elsewhere, see context/ui-tokens.md)
}

// Standard MSA numeral agreement: 1 → singular, 2 → dual, 3-10 → plural,
// 11+ → singular again (accusative case). 0 conventionally takes the same
// form as 11+.
export function arabicPlural(count: number, forms: ArabicPluralForms): string {
  const n = Math.abs(count)
  const mod100 = n % 100
  if (n === 1) return forms.one
  if (n === 2) return forms.two
  if (mod100 >= 3 && mod100 <= 10) return forms.few
  return forms.many
}

// "12.4 مليون ج.م" once a value reaches a million, the plain grouped number
// otherwise — see context/build-plan.md Chunk 2 data-honesty rule (team
// sales formatting).
export function formatMillionsOrPlain(value: number): string {
  if (Math.abs(value) < 1_000_000) return formatNumber(value)
  return `${(value / 1_000_000).toFixed(1)} مليون`
}
