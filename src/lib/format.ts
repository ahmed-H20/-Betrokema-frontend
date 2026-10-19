// Latin digits, grouped thousands — matches the Stitch export's LTR numeral
// convention inside RTL text (see context/ui-tokens.md RTL notes).
const numberFormatter = new Intl.NumberFormat('en-US')

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}
