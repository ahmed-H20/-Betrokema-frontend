/**
 * Helper to convert numbers to Arabic words (Tafqeet / تفقيط)
 * Formatted for Egyptian Pounds (ج.م)
 */

const ONES = [
  '',
  'واحد',
  'اثنان',
  'ثلاثة',
  'أربعة',
  'خمسة',
  'ستة',
  'سبعة',
  'ثمانية',
  'تسعة',
  'عشرة',
  'أحد عشر',
  'اثنا عشر',
  'ثلاثة عشر',
  'أربعة عشر',
  'خمسة عشر',
  'ستة عشر',
  'سبعة عشر',
  'ثمانية عشر',
  'تسعة عشر',
]

const TENS = [
  '',
  '',
  'عشرون',
  'ثلاثون',
  'أربعون',
  'خمسون',
  'ستون',
  'سبعون',
  'ثمانون',
  'تسعون',
]

const HUNDREDS = [
  '',
  'مائة',
  'مائتان',
  'ثلاثمائة',
  'أربعمائة',
  'خمسمائة',
  'ستمائة',
  'سبعمائة',
  'ثمانمائة',
  'تسعمائة',
]

function convertChunk(num: number): string {
  if (num === 0) return ''

  const h = Math.floor(num / 100)
  const remainder = num % 100
  const parts: string[] = []

  if (h > 0) {
    parts.push(HUNDREDS[h])
  }

  if (remainder > 0) {
    if (remainder < 20) {
      parts.push(ONES[remainder])
    } else {
      const o = remainder % 10
      const t = Math.floor(remainder / 10)
      if (o > 0) {
        parts.push(`${ONES[o]} و${TENS[t]}`)
      } else {
        parts.push(TENS[t])
      }
    }
  }

  return parts.join(' و')
}

export function tafqeet(amount: number): string {
  if (isNaN(amount) || amount === 0) {
    return 'فقط صفر جنيه مصري لا غير'
  }

  const integerPart = Math.floor(Math.abs(amount))
  const piastres = Math.round((Math.abs(amount) - integerPart) * 100)

  if (integerPart === 0 && piastres > 0) {
    return `فقط ${piastres}/100 قرشاً مصرياً لا غير`
  }

  const millions = Math.floor(integerPart / 1_000_000)
  const thousands = Math.floor((integerPart % 1_000_000) / 1_000)
  const remainder = integerPart % 1_000

  const parts: string[] = []

  if (millions > 0) {
    if (millions === 1) parts.push('مليون')
    else if (millions === 2) parts.push('مليونان')
    else if (millions >= 3 && millions <= 10) parts.push(`${convertChunk(millions)} ملايين`)
    else parts.push(`${convertChunk(millions)} مليون`)
  }

  if (thousands > 0) {
    if (thousands === 1) parts.push('ألف')
    else if (thousands === 2) parts.push('ألفان')
    else if (thousands >= 3 && thousands <= 10) parts.push(`${convertChunk(thousands)} آلاف`)
    else parts.push(`${convertChunk(thousands)} ألفاً`)
  }

  if (remainder > 0) {
    parts.push(convertChunk(remainder))
  }

  let result = `فقط وقدره ${parts.join(' و')} جنيهاً مصرياً`

  if (piastres > 0) {
    result += ` و${piastres}/100 قرشاً`
  }

  return `${result} لا غير`
}
