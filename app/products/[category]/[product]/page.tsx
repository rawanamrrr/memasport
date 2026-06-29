import ProductClient from "./product-client"
import { getProductDetail, getProducts } from "@/lib/products-service"

// ISR: each product page is cached + prefetchable, so opening a product is
// instant. Refreshed on product mutations via revalidatePath.
export const revalidate = 300

// Pre-build pages for existing products and enable ISR for any added later.
// (Presence of generateStaticParams switches the route to static+ISR so its
// full payload can be prefetched on <Link> hover → instant open.)
export async function generateStaticParams() {
  try {
    const { body } = await getProducts(new URLSearchParams("limit=1000"))
    if (Array.isArray(body)) {
      return body
        .filter((p: any) => p?.category && p?.id)
        .map((p: any) => ({ category: p.category, product: p.id }))
    }
  } catch {
    // No params pre-built; pages render on-demand and cache via ISR.
  }
  return []
}

export default async function ProductDetailPage({
  params,
}: {
  params: { category: string; product: string }
}) {
  let initialProduct: any = null
  try {
    const { status, body } = await getProductDetail(params.category, params.product)
    if (status === 200) initialProduct = body
  } catch {
    // Client falls back to fetching on its own.
  }

  return <ProductClient initialProduct={initialProduct} />
}
