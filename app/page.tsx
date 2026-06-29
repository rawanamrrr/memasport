import NewHome from "@/components/home/NewHome"
import { getProducts } from "@/lib/products-service"

// Statically cached + revalidated (ISR) so the page is fully prefetchable: in
// production <Link> preloads the entire HTML+data before the click, making
// navigation instant (no server wait, no skeleton). Product mutations call
// revalidatePath to refresh this immediately, so it never serves stale data.
export const revalidate = 300

export default async function HomePage() {
  // undefined → prefetch failed, let the client fetch; an array (even empty) → trusted server data.
  let initialProducts: any[] | undefined
  try {
    const { body } = await getProducts(new URLSearchParams("limit=8"))
    if (Array.isArray(body)) initialProducts = body
  } catch {
    // Fall back to client-side fetch inside NewHome if the prefetch fails.
  }

  return <NewHome initialProducts={initialProducts} />
}
