import type {
  CreateProductInput,
  Product,
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

export function formatWeightWithUnit(weight: string): string {
  const trimmed = (weight || '').trim()
  if (!trimmed) return ''
  // If the weight is only numeric, append 'لتر' by default
  const isOnlyNumeric = /^[\d٠-٩]+([.,][\d٠-٩]+)?$/.test(trimmed)
  if (isOnlyNumeric) {
    return `${trimmed} لتر`
  }
  return trimmed
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
    weight: formatWeightWithUnit(weight),
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
    warehouse: form.warehouse.trim(),
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

export function findPackagePrice(
  packages: ProductPackage[] = [],
  matcher: (unitName: string) => boolean,
) {
  const pkg = packages.find((item) => matcher(item.unitName))
  return {
    price: pkg?.oldPrice && pkg.oldPrice > 0 ? pkg.oldPrice : pkg?.price ?? 0,
    discount: pkg?.discountPercent ?? 0,
    weight: pkg?.weight ?? '',
  }
}

export function buildProductFormDefaults(product?: Product | null): ProductFormValues {
  if (!product) {
    return {
      name: '',
      category: '',
      description: '',
      warehouse: '',
      quantity: 0,
      minStockThreshold: 20,
      image: '',
      images: [],
      features: [],
      galonPrice: undefined as unknown as number,
      galonDiscount: undefined as unknown as number,
      galonWeight: '',
      bestelaPrice: undefined as unknown as number,
      bestelaDiscount: undefined as unknown as number,
      bestelaWeight: '',
    }
  }

  const galon = findPackagePrice(product.packages || [], isGalonUnit)
  const bestela = findPackagePrice(product.packages || [], isBestelaUnit)

  // Features normalization from fetures or features
  const rawFeatures = product.fetures || (product as any).features || []
  const featuresList = Array.isArray(rawFeatures)
    ? rawFeatures
        .map((f: any) => (typeof f === 'string' ? f : f?.name))
        .filter(Boolean)
    : []

  const categoryId =
    typeof product.category === 'object' && product.category?._id
      ? product.category._id
      : typeof product.category === 'string'
        ? product.category
        : ''

  return {
    name: product.name || '',
    category: categoryId,
    description: product.description || '',
    warehouse: product.warehouse || '',
    quantity: product.quantity ?? 0,
    minStockThreshold: product.minStockThreshold ?? 20,
    image: product.image || '',
    images: (product.images || []).map((url) => ({ url })),
    features: featuresList,
    galonPrice: (galon.price > 0 ? galon.price : undefined) as unknown as number,
    galonDiscount: (galon.discount > 0 ? galon.discount : undefined) as unknown as number,
    galonWeight: galon.weight || '',
    bestelaPrice: (bestela.price > 0 ? bestela.price : undefined) as unknown as number,
    bestelaDiscount: (bestela.discount > 0 ? bestela.discount : undefined) as unknown as number,
    bestelaWeight: bestela.weight || '',
  }
}


