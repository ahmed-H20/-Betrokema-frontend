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

// Builds package payload from form.packages array, supporting any unitName and weight
export function buildPackagesFromForm(
  form: PricingFieldValues,
  existingPackages: ProductPackage[] = [],
): ProductPackageInput[] {
  if (Array.isArray(form.packages) && form.packages.length > 0) {
    return form.packages.map((pkg) => {
      const price = roundMoney(Number(pkg.price) || 0)
      const oldPrice = Number(pkg.oldPrice) || 0
      const discount = Number(pkg.discountPercent) || 0
      return {
        unitName: pkg.unitName.trim(),
        price,
        ...(oldPrice > 0 ? { oldPrice: roundMoney(oldPrice) } : {}),
        discountPercent: discount,
        weight: (pkg.weight || '').trim(),
        note: pkg.note?.trim() || undefined,
        colors: (pkg.colors || [])
          .map((c) => ({
            name: c.name?.trim() || '',
            code: c.code?.trim() || '',
            hex: c.hex?.trim() || '#000000',
            price: Math.max(0, Number(c.price) || 0),
          }))
          .filter((c) => c.name !== ''),
      }
    })
  }

  // Fallback for legacy galon/bestela inputs
  const untouched = existingPackages.filter(
    (pkg) => !isGalonUnit(pkg.unitName) && !isBestelaUnit(pkg.unitName),
  )
  const pkgs: ProductPackageInput[] = [...untouched]
  if (form.galonPrice && form.galonPrice > 0) {
    pkgs.push(buildPackage('جالون', form.galonPrice, form.galonDiscount || 0, form.galonWeight || ''))
  }
  if (form.bestelaPrice && form.bestelaPrice > 0) {
    pkgs.push(
      buildPackage('بستلة', form.bestelaPrice, form.bestelaDiscount || 0, form.bestelaWeight || ''),
    )
  }
  return pkgs
}

export function buildCreateProductPayload(
  form: ProductFormValues,
): CreateProductInput {
  const hasGift = Boolean(
    form.giftName?.trim() ||
      form.giftTitle?.trim() ||
      form.giftImage?.trim() ||
      form.giftDescription?.trim() ||
      form.giftWeight?.trim() ||
      (form.giftProduct && form.giftProduct !== ''),
  )

  const finalGiftName =
    form.giftName?.trim() ||
    form.giftTitle?.trim() ||
    (hasGift ? 'هدية مميزة' : '')

  const packageColors: { name: string; code?: string; hex?: string; price?: number }[] = []
  const seenNames = new Set<string>()
  ;(form.packages || []).forEach((pkg) => {
    ;(pkg.colors || []).forEach((c) => {
      const name = c.name?.trim()
      if (name && !seenNames.has(name)) {
        seenNames.add(name)
        packageColors.push({
          name,
          code: c.code?.trim() || '',
          hex: c.hex?.trim() || '#000000',
          price: Math.max(0, Number(c.price) || 0),
        })
      }
    })
  })

  const rootColors = (form.colors || [])
    .map((c) => ({
      name: c.name?.trim() || '',
      code: c.code?.trim() || '',
      hex: c.hex?.trim() || '#000000',
      price: Math.max(0, Number(c.price) || 0),
    }))
    .filter((c) => c.name !== '')

  rootColors.forEach((c) => {
    if (!seenNames.has(c.name)) {
      seenNames.add(c.name)
      packageColors.push(c)
    }
  })

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
    colors: packageColors,
    gift: {
      name: finalGiftName,
      description: form.giftDescription?.trim() || '',
      image: form.giftImage?.trim() || '',
      weight: form.giftWeight?.trim() || '',
    },
    giftProduct:
      form.giftProduct && form.giftProduct !== '' ? form.giftProduct : null,
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
        colors: [],
        giftProduct: '',
        giftTitle: '',
        giftName: '',
        giftDescription: '',
        giftImage: '',
        giftWeight: '',
        packages: [
          {
            unitName: 'بستلة',
            weight: '9 لتر',
            price: undefined as unknown as number,
            oldPrice: 0,
            discountPercent: 0,
            note: '',
            colors: [],
          },
          {
            unitName: 'جالون',
            weight: '2.5 لتر',
            price: undefined as unknown as number,
            oldPrice: 0,
            discountPercent: 0,
            note: '',
            colors: [],
          },
        ],
        galonPrice: undefined as unknown as number,
        galonDiscount: 0,
        galonWeight: '',
        bestelaPrice: undefined as unknown as number,
        bestelaDiscount: 0,
        bestelaWeight: '',
      }
    }

    // Extract all packages for this product
    let packagesList = []
    if (Array.isArray(product.packages) && product.packages.length > 0) {
      packagesList = product.packages.map((pkg) => ({
        unitName: pkg.unitName,
        weight: pkg.weight || '',
        price: pkg.price,
        oldPrice: pkg.oldPrice || 0,
        discountPercent: pkg.discountPercent || 0,
        note: pkg.note || '',
        colors: Array.isArray(pkg.colors)
          ? pkg.colors.map((c) => ({
              name: c.name || '',
              code: c.code || '',
              hex: c.hex || '#000000',
              price: c.price || 0,
            }))
          : [],
      }))
    } else {
    const galon = findPackagePrice(product.packages || [], isGalonUnit)
    const bestela = findPackagePrice(product.packages || [], isBestelaUnit)
    if (bestela.price > 0) {
      packagesList.push({
        unitName: 'بستلة',
        weight: bestela.weight || '9 لتر',
        price: bestela.price,
        oldPrice: (bestela as any).oldPrice || 0,
        discountPercent: bestela.discount || 0,
        note: '',
        colors: [],
      })
    }
    if (galon.price > 0) {
      packagesList.push({
        unitName: 'جالون',
        weight: galon.weight || '2.5 لتر',
        price: galon.price,
        oldPrice: (galon as any).oldPrice || 0,
        discountPercent: galon.discount || 0,
        note: '',
        colors: [],
      })
    }
    if (packagesList.length === 0) {
      packagesList.push({
        unitName: 'بستلة',
        weight: '9 لتر',
        price: 0,
        oldPrice: 0,
        discountPercent: 0,
        note: '',
        colors: [],
      })
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

  const giftProductId =
    typeof product.giftProduct === 'object' && product.giftProduct?._id
      ? product.giftProduct._id
      : typeof product.giftProduct === 'string'
        ? product.giftProduct
        : ''

  const productGift = (product as any).gift || {}
  const giftName = productGift.name || product.giftTitle || ''
  const giftDescription = productGift.description || ''
  const giftImage =
    productGift.image ||
    (typeof product.giftProduct === 'object' && product.giftProduct !== null
      ? product.giftProduct.image || ''
      : '')
  const giftWeight = productGift.weight || ''

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
    colors: (product.colors || []).map((c) => ({
      name: c.name || '',
      code: c.code || '',
      hex: c.hex || '#FFFFFF',
      price: c.price || 0,
    })),
    giftProduct: giftProductId,
    giftTitle: giftName,
    giftName: giftName,
    giftDescription: giftDescription,
    giftImage: giftImage,
    giftWeight: giftWeight,
    packages: packagesList,
    galonPrice: (galon.price > 0 ? galon.price : undefined) as unknown as number,
    galonDiscount: galon.discount || 0,
    galonWeight: galon.weight || '',
    bestelaPrice: (bestela.price > 0 ? bestela.price : undefined) as unknown as number,
    bestelaDiscount: bestela.discount || 0,
    bestelaWeight: bestela.weight || '',
  }
}


