// Latin digits, grouped thousands — matches the Stitch export's LTR numeral
// convention inside RTL text (see context/ui-tokens.md RTL notes).
const numberFormatter = new Intl.NumberFormat('en-US')

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

export function formatCurrency(value: number): string {
  return `${formatNumber(value)} ج.م`
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

// Full counted-noun phrase: the 1/2 forms already encode the count
// ("يوم واحد", "يومان") so no digit is shown for those; 3+ forms (plural,
// then accusative-singular for 11+) don't by themselves say which number in
// that range, so the digit is shown alongside the noun. Reuses `arabicPlural`
// for the noun-form selection — don't duplicate that branching here.
export function arabicCountPhrase(count: number, forms: ArabicPluralForms): string {
  const n = Math.abs(count)
  if (n === 1) return forms.one
  if (n === 2) return forms.two
  return `${formatNumber(count)} ${arabicPlural(count, forms)}`
}

// "12.4" + unit "مليون ج.م" once a value reaches a million, the plain
// grouped number + unit "ج.م" otherwise — see context/build-plan.md Chunk 2
// data-honesty rule (team sales formatting) and the real Stitch export,
// which renders the number and the "مليون ج.م" unit as two separate spans.
export function formatMillionsOrPlain(
  value: number,
): { value: string; unit: string } {
  if (Math.abs(value) < 1_000_000) {
    return { value: formatNumber(value), unit: 'ج.م' }
  }
  return { value: (value / 1_000_000).toFixed(1), unit: 'مليون ج.م' }
}
