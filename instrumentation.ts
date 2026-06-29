// Runs once when the Next.js server starts (enabled via experimental.instrumentationHook).
// Warms the database connection pool and pre-populates the product cache so that the
// VERY FIRST visitor gets an instant response instead of paying the ~485ms cold-connect
// + query latency to the Supabase pooler in eu-west-1.

// Hottest product queries, matching what the home / products / category / admin pages request.
const WARM_QUERIES = [
  "limit=8", // home page "All Products"
  "limit=20", // products landing page
  "limit=500", // admin dashboard product list
  "category=equipment&limit=200",
  "category=apparel&limit=200",
  "category=accessories&limit=200",
  "category=outlet&limit=200",
]

async function warm() {
  try {
    const { getProducts } = await import("./lib/products-service")
    // Running the shared read service populates the in-memory cache with the
    // exact keys the live requests will look up — no query/key duplication.
    // Run sequentially (not Promise.all) so the warmer never opens more than
    // one new connection at a time — it shares a small, capped pool with real
    // visitor traffic, and a burst of parallel connects is what was causing
    // "timeout exceeded when trying to connect" against Supabase's pooler.
    for (const q of WARM_QUERIES) {
      await getProducts(new URLSearchParams(q)).catch(() => {})
    }
  } catch {
    // Warming is best-effort; never block or crash server startup.
  }
}

export async function register() {
  // Only run in the Node.js server runtime (not edge / browser).
  if (process.env.NEXT_RUNTIME !== "nodejs") return

  await warm()

  // Keep the hot entries fresh so they never expire under steady traffic and
  // no visitor is ever the one who pays the database round-trip. The interval is
  // well under the list cache TTL (120s) so entries are refreshed before lapsing.
  // unref() lets the process exit normally and is a no-op on serverless instances.
  const timer = setInterval(warm, 45_000)
  if (typeof timer.unref === "function") timer.unref()
}
