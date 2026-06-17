import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/postgresql"
import type { Product } from "@/lib/models/types"

const validCategories = ["equipment", "apparel", "accessories", "outlet"] as const;
type ValidCategory = typeof validCategories[number];

export async function GET(request: NextRequest, { params }: { params: { category: string; productId: string } }) {
  try {
    const { category, productId } = params
    
    // Validate category
    if (!validCategories.includes(category as ValidCategory)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    const result = await pool.query(`
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
    `, [category, productId])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const product = {
      ...result.rows[0],
      isActive: result.rows[0].is_active,
      isNew: result.rows[0].is_new,
      isBestseller: result.rows[0].is_bestseller,
      isGiftPackage: result.rows[0].is_gift_package,
      packagePrice: result.rows[0].package_price ? parseFloat(result.rows[0].package_price) : null,
      packageOriginalPrice: result.rows[0].package_original_price ? parseFloat(result.rows[0].package_original_price) : null,
      rating: parseFloat(result.rows[0].rating) || 0,
      reviews: parseInt(result.rows[0].reviews) || 0,
      longDescription: result.rows[0].long_description,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at,
    }

    return NextResponse.json(product, {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    })
  } catch (error) {
    console.error("Get product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}