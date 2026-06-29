// Read-only product fetching + caching, shared by the API routes and the
// startup warmer (instrumentation.ts). Kept free of auth/jsonwebtoken so it
// can be imported anywhere without pulling Node-only crypto into the bundle.

import pool from "./postgresql"
import {
  getCached,
  setCached,
  PRODUCTS_CACHE_TTL_MS,
  PRODUCT_DETAIL_CACHE_TTL_MS,
  PRODUCTS_CACHE_PREFIX,
} from "./cache"

interface ServiceResult {
  status: number
  body: any
  headers: Record<string, string>
}

function mapRow(row: any) {
  return {
    ...row,
    isActive: row.is_active,
    isNew: row.is_new,
    isBestseller: row.is_bestseller,
    isGiftPackage: row.is_gift_package,
    packagePrice: row.package_price ? parseFloat(row.package_price) : null,
    packageOriginalPrice: row.package_original_price ? parseFloat(row.package_original_price) : null,
    rating: parseFloat(row.rating) || 0,
    reviews: parseInt(row.reviews) || 0,
    longDescription: row.long_description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/** Handles the GET /api/products read logic (single id, list, paginated list) with caching. */
export async function getProducts(searchParams: URLSearchParams): Promise<ServiceResult> {
  const id = searchParams.get("id")
  const category = searchParams.get("category")
  const isBestsellerParam = searchParams.get("isBestseller")
  const isNewParam = searchParams.get("isNew")
  const isGiftPackageParam = searchParams.get("isGiftPackage")
  const hasPagination = searchParams.has("page") || searchParams.has("limit")
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1)
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10), 1), 1000)
  const offset = (page - 1) * limit

  const cacheKey = `${PRODUCTS_CACHE_PREFIX}${searchParams.toString()}`
  const cached = getCached<ServiceResult>(cacheKey)
  if (cached) {
    return { ...cached, headers: { ...cached.headers, "X-Cache": "HIT" } }
  }

  // Single product request
  if (id) {
    const result = await pool.query(
      `
      SELECT p.*,
             COALESCE(
               json_agg(
                 json_build_object(
                   'size', ps.size,
                   'volume', ps.volume,
                   'originalPrice', ps.original_price,
                   'discountedPrice', ps.discounted_price
                 )
               ) FILTER (WHERE ps.id IS NOT NULL),
               '[]'::json
             ) as sizes
      FROM products p
      LEFT JOIN product_sizes ps ON p.id = ps.product_id
      WHERE p.id = $1
      GROUP BY p.id
    `,
      [id]
    )

    if (result.rows.length === 0) {
      return { status: 404, body: { error: "Product not found" }, headers: {} }
    }

    const product = mapRow(result.rows[0])
    const headers = { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" }
    const payload: ServiceResult = { status: 200, body: product, headers }
    setCached(cacheKey, payload, PRODUCT_DETAIL_CACHE_TTL_MS)
    return { ...payload, headers: { ...headers, "X-Cache": "MISS" } }
  }

  // Listing query
  let queryText = `
    SELECT p.id, p.name, p.description, p.images, p.rating, p.reviews, p.category,
           p.is_active, p.is_new, p.is_bestseller, p.is_gift_package,
           p.package_price, p.package_original_price, p.created_at,
           COALESCE(
             json_agg(
               json_build_object(
                 'size', ps.size,
                 'volume', ps.volume,
                 'originalPrice', ps.original_price,
                 'discountedPrice', ps.discounted_price
               )
             ) FILTER (WHERE ps.id IS NOT NULL),
             '[]'::json
           ) as sizes
    FROM products p
    LEFT JOIN product_sizes ps ON p.id = ps.product_id
    WHERE p.is_active = true
  `

  const queryParams: any[] = []
  let paramIndex = 1

  if (category) {
    queryText += ` AND p.category = $${paramIndex}`
    queryParams.push(category)
    paramIndex++
  }
  if (isBestsellerParam !== null) {
    queryText += ` AND p.is_bestseller = $${paramIndex}`
    queryParams.push(isBestsellerParam === "true")
    paramIndex++
  }
  if (isNewParam !== null) {
    queryText += ` AND p.is_new = $${paramIndex}`
    queryParams.push(isNewParam === "true")
    paramIndex++
  }
  if (isGiftPackageParam !== null) {
    queryText += ` AND p.is_gift_package = $${paramIndex}`
    queryParams.push(isGiftPackageParam === "true")
    paramIndex++
  }

  queryText += ` GROUP BY p.id ORDER BY p.created_at DESC`

  if (hasPagination) {
    queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    queryParams.push(limit, offset)

    let countQuery = `SELECT COUNT(*) FROM products WHERE is_active = true`
    const countParams: any[] = []
    let countParamIndex = 1
    if (category) {
      countQuery += ` AND category = $${countParamIndex}`
      countParams.push(category)
      countParamIndex++
    }
    if (isBestsellerParam !== null) {
      countQuery += ` AND is_bestseller = $${countParamIndex}`
      countParams.push(isBestsellerParam === "true")
      countParamIndex++
    }
    if (isNewParam !== null) {
      countQuery += ` AND is_new = $${countParamIndex}`
      countParams.push(isNewParam === "true")
      countParamIndex++
    }
    if (isGiftPackageParam !== null) {
      countQuery += ` AND is_gift_package = $${countParamIndex}`
      countParams.push(isGiftPackageParam === "true")
    }

    const [productsResult, countResult] = await Promise.all([
      pool.query(queryText, queryParams),
      pool.query(countQuery, countParams),
    ])

    const products = productsResult.rows.map(mapRow)
    const total = parseInt(countResult.rows[0].count)
    const totalPages = Math.max(Math.ceil(total / limit), 1)

    const headers = {
      "X-Total-Count": String(total),
      "X-Page": String(page),
      "X-Limit": String(limit),
      "X-Total-Pages": String(totalPages),
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    }
    const payload: ServiceResult = { status: 200, body: products, headers }
    setCached(cacheKey, payload, PRODUCTS_CACHE_TTL_MS)
    return { ...payload, headers: { ...headers, "X-Cache": "MISS" } }
  }

  const result = await pool.query(queryText, queryParams)
  const products = result.rows.map(mapRow)
  const headers = { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" }
  const payload: ServiceResult = { status: 200, body: products, headers }
  setCached(cacheKey, payload, PRODUCTS_CACHE_TTL_MS)
  return { ...payload, headers: { ...headers, "X-Cache": "MISS" } }
}

/** Handles GET /api/products/[category]/[productId] with caching. */
export async function getProductDetail(category: string, productId: string): Promise<ServiceResult> {
  const cacheKey = `${PRODUCTS_CACHE_PREFIX}detail:${category}:${productId}`
  const cached = getCached<ServiceResult>(cacheKey)
  if (cached) {
    return { ...cached, headers: { ...cached.headers, "X-Cache": "HIT" } }
  }

  const result = await pool.query(
    `
    SELECT p.*,
           COALESCE(
             json_agg(
               json_build_object(
                 'size', ps.size,
                 'volume', ps.volume,
                 'originalPrice', ps.original_price,
                 'discountedPrice', ps.discounted_price
               )
             ) FILTER (WHERE ps.id IS NOT NULL),
             '[]'::json
           ) as sizes
    FROM products p
    LEFT JOIN product_sizes ps ON p.id = ps.product_id
    WHERE p.category = $1 AND p.id = $2 AND p.is_active = true
    GROUP BY p.id
  `,
    [category, productId]
  )

  if (result.rows.length === 0) {
    return { status: 404, body: { error: "Product not found" }, headers: {} }
  }

  const product = mapRow(result.rows[0])
  const headers = { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" }
  const payload: ServiceResult = { status: 200, body: product, headers }
  setCached(cacheKey, payload, PRODUCT_DETAIL_CACHE_TTL_MS)
  return { ...payload, headers: { ...headers, "X-Cache": "MISS" } }
}
