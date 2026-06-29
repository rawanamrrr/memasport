import ProductsClient from "./products-client"
import { getProducts } from "@/lib/products-service"

// ISR: statically cached + prefetchable so navigation is instant (no server
// wait, no skeleton). Refreshed on product mutations via revalidatePath.
export const revalidate = 300

export default async function ProductsPage() {
  let initialProducts: any[] | undefined
  try {
    const { body } = await getProducts(new URLSearchParams("limit=20"))
    if (Array.isArray(body)) initialProducts = body
  } catch {
    // Client component falls back to fetching on its own.
  }

  return <ProductsClient initialProducts={initialProducts} />
}
