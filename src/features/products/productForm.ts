import type {
  CreateProductInput,
  ProductPackage,
  ProductPackageInput,
} from '@/api/products.schema'
import type {
  PricingFieldValues,
  ProductFormValues,
} from '@/features/products/productForm.schema'

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}

export function isGalonUnit(unitName: string): boolean {
  return unitName.includes('جالون') || unitName.toLowerCase().includes('galon')
}

export function isBestelaUnit(unitName: string): boolean {
  const lower = unitName.toLowerCase()
  return (
    unitName.includes('بستلة') ||
    lower.includes('bestela') ||
    unitName.includes('شكارة') ||
    unitName.includes('برميل')
  )
}

function buildPackage(
  unitName: string,
  basePrice: number,
  discountPercent: number,
  weight: string,
): ProductPackageInput {
  const price = roundMoney(basePrice * (1 - discountPercent / 100))
  return {
    unitName,
    price,
    ...(discountPercent > 0 ? { oldPrice: roundMoney(basePrice) } : {}),
    discountPercent,
    weight: weight.trim(),
  }
}

// Replaces only the جالون/بستلة entries; any other package the product
// already had (entered outside this form) is passed through untouched.
export function buildPackagesFromForm(
  form: PricingFieldValues,
  existingPackages: ProductPackage[] = [],
): ProductPackageInput[] {
  const untouched = existingPackages.filter(
    (pkg) => !isGalonUnit(pkg.unitName) && !isBestelaUnit(pkg.unitName),
  )
  return [
    ...untouched,
    buildPackage('جالون', form.galonPrice, form.galonDiscount, form.galonWeight),
    buildPackage(
      'بستلة',
      form.bestelaPrice,
      form.bestelaDiscount,
      form.bestelaWeight,
    ),
  ]
}

export function buildCreateProductPayload(
  form: ProductFormValues,
): CreateProductInput {
  return {
    name: form.name,
    category: form.category,
    description: form.description || undefined,
    warehouse: form.warehouse || undefined,
    quantity: form.quantity,
    minStockThreshold: form.minStockThreshold,
    image: form.image || undefined,
    images: form.images
      .map((item) => item.url.trim())
      .filter((url) => url !== ''),
    fetures: form.features.map((name) => ({ name })),
    packages: buildPackagesFromForm(form),
  }
}
