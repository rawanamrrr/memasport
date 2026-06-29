import { type NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import jwt from "jsonwebtoken"
import pool from "@/lib/postgresql"
import { invalidatePrefix, PRODUCTS_CACHE_PREFIX } from "@/lib/cache"
import { getProducts } from "@/lib/products-service"

// Clear both the in-memory product cache and the ISR page cache so storefront
// pages reflect catalog changes immediately.
function revalidateStorefront() {
  invalidatePrefix(PRODUCTS_CACHE_PREFIX)
  try {
    revalidatePath("/")
    revalidatePath("/products")
    revalidatePath("/products/[category]", "page")
    revalidatePath("/products/[category]/[product]", "page")
  } catch (e) {
    console.error("revalidatePath failed:", e)
  }
}

// Helper function for error responses
const errorResponse = (message: string, status: number) => {
  return NextResponse.json(
    {
      error: message,
      timestamp: new Date().toISOString()
    },
    { status }
  )
}

// Configure the API route
export const maxDuration = 60
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { searchParams } = new URL(request.url)
    const { status, body, headers } = await getProducts(searchParams)
    console.log(`⏱️ [API] GET /api/products completed in ${Date.now() - startTime}ms (${headers["X-Cache"] || "n/a"})`)
    return NextResponse.json(body, { status, headers })
  } catch (error) {
    console.error("❌ [API] Error in GET /api/products:", error)
    return errorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    )
  }
}

// Simplified POST - for admin use
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return errorResponse("Authorization required", 401)
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!)
    } catch (jwtError) {
      return errorResponse("Invalid token", 401)
    }

    if (decoded.role !== "admin") {
      return errorResponse("Admin access required", 403)
    }

    const productData = await request.json()
    const productId = `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')

      // Insert product
      await client.query(`
        INSERT INTO products (
          id, name, description, long_description, images, category,
          is_active, is_new, is_bestseller, is_gift_package,
          package_price, package_original_price, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        productId,
        productData.name,
        productData.description,
        productData.longDescription || '',
        productData.images || ['/placeholder.svg'],
        productData.category,
        productData.isActive ?? true,
        productData.isNew ?? false,
        productData.isBestseller ?? false,
        productData.isGiftPackage ?? false,
        productData.packagePrice || null,
        productData.packageOriginalPrice || null,
        productData.notes ? JSON.stringify(productData.notes) : null
      ])

      // Insert sizes if provided
      if (productData.sizes && productData.sizes.length > 0) {
        for (const size of productData.sizes) {
          await client.query(`
            INSERT INTO product_sizes (product_id, size, volume, original_price, discounted_price)
            VALUES ($1, $2, $3, $4, $5)
          `, [productId, size.size, size.volume, size.originalPrice, size.discountedPrice])
        }
      }

      await client.query('COMMIT')
      revalidateStorefront()

      return NextResponse.json({
        success: true,
        productId,
        message: "Product created successfully"
      }, { status: 201 })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }

  } catch (error) {
    console.error("❌ [API] Error in POST /api/products:", error)
    return errorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    )
  }
}

// Simplified PUT - for admin use
export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return errorResponse("Authorization required", 401)
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!)
    } catch (jwtError) {
      return errorResponse("Invalid token", 401)
    }

    if (decoded.role !== "admin") {
      return errorResponse("Admin access required", 403)
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return errorResponse("Product ID is required", 400)
    }

    const productData = await request.json()
    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')

      // Update product
      await client.query(`
        UPDATE products 
        SET name = $1, description = $2, long_description = $3, images = $4,
            category = $5, is_active = $6, is_new = $7, is_bestseller = $8,
            is_gift_package = $9, package_price = $10, package_original_price = $11,
            notes = $12, updated_at = CURRENT_TIMESTAMP
        WHERE id = $13
      `, [
        productData.name,
        productData.description,
        productData.longDescription || '',
        productData.images,
        productData.category,
        productData.isActive,
        productData.isNew,
        productData.isBestseller,
        productData.isGiftPackage ?? false,
        productData.packagePrice || null,
        productData.packageOriginalPrice || null,
        productData.notes ? JSON.stringify(productData.notes) : null,
        id
      ])

      // Update sizes
      if (productData.sizes) {
        // Delete existing sizes
        await client.query('DELETE FROM product_sizes WHERE product_id = $1', [id])
        
        // Insert new sizes
        for (const size of productData.sizes) {
          await client.query(`
            INSERT INTO product_sizes (product_id, size, volume, original_price, discounted_price)
            VALUES ($1, $2, $3, $4, $5)
          `, [id, size.size, size.volume, size.originalPrice, size.discountedPrice])
        }
      }

      await client.query('COMMIT')
      revalidateStorefront()

      return NextResponse.json({
        success: true,
        message: "Product updated successfully"
      })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }

  } catch (error) {
    console.error("❌ [API] Error in PUT /api/products:", error)
    return errorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    )
  }
}

// Simplified DELETE - soft delete
export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return errorResponse("Authorization required", 401)
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!)
    } catch (jwtError) {
      return errorResponse("Invalid token", 401)
    }

    if (decoded.role !== "admin") {
      return errorResponse("Admin access required", 403)
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return errorResponse("Product ID is required", 400)
    }

    // Soft delete - just set is_active to false
    await pool.query('UPDATE products SET is_active = false WHERE id = $1', [id])
    revalidateStorefront()

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully"
    })

  } catch (error) {
    console.error("❌ [API] Error in DELETE /api/products:", error)
    return errorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    )
  }
}
