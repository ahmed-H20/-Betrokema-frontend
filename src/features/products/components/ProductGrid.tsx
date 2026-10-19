import type { Category } from '@/api/categories.schema'
import type { Product } from '@/api/products.schema'
import { StateMessage } from '@/components/ui/StateMessage'
import { PRODUCTS_EMPTY } from '@/constants/strings'
import { ProductCard } from '@/features/products/components/ProductCard'

type ProductGridProps = {
  products: Product[]
  categories: Category[]
}

export function ProductGrid({ products, categories }: ProductGridProps) {
  if (products.length === 0) {
    return <StateMessage minHeightClassName="min-h-[200px]" text={PRODUCTS_EMPTY} />
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {products.map((product) => {
        const categoryId =
          typeof product.category === 'string'
            ? product.category
            : product.category?._id
        const colorIndex = categories.findIndex((cat) => cat._id === categoryId)
        return (
          <ProductCard
            categoryColorIndex={colorIndex === -1 ? 0 : colorIndex}
            key={product._id}
            product={product}
          />
        )
      })}
    </div>
  )
}
