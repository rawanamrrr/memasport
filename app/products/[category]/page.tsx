import CategoryClient from "./category-client"
import { getProducts } from "@/lib/products-service"

// ISR + pre-built params: all 4 category pages are statically generated and
// prefetchable, so navigating between them is instant. Refreshed on mutations.
export const revalidate = 300

const validCategories = ["equipment", "apparel", "accessories", "outlet"]

export function generateStaticParams() {
  return validCategories.map((category) => ({ category }))
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  let initialProducts: any[] | undefined
  try {
    if (validCategories.includes(params.category)) {
      const { body } = await getProducts(
        new URLSearchParams(`category=${params.category}&limit=200`)
      )
      if (Array.isArray(body)) initialProducts = body
    }
  } catch {
    // Client falls back to fetching on its own.
  }

  return <CategoryClient initialProducts={initialProducts} />
}
