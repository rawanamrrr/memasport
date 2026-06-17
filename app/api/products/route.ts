import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import pool from "@/lib/postgresql"

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
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  console.log("🔍 [API] GET /api/products - Request received")

  try {
    const { searchParams } = new URL(request.url)
    
    const id = searchParams.get("id")
    const category = searchParams.get("category")
    const isBestsellerParam = searchParams.get("isBestseller")
    const isNewParam = searchParams.get("isNew")
    const isGiftPackageParam = searchParams.get("isGiftPackage")
    const hasPagination = searchParams.has("page") || searchParams.has("limit")
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1)
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10), 1), 1000)
    const offset = (page - 1) * limit

    // Single product request
    if (id) {
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
        WHERE p.id = $1
        GROUP BY p.id
      `, [id])

      if (result.rows.length === 0) {
        return errorResponse("Product not found", 404)
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
        }
      })
    }

    // Build query for listing
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
      queryParams.push(isBestsellerParam === 'true')
      paramIndex++
    }

    if (isNewParam !== null) {
      queryText += ` AND p.is_new = $${paramIndex}`
      queryParams.push(isNewParam === 'true')
      paramIndex++
    }

    if (isGiftPackageParam !== null) {
      queryText += ` AND p.is_gift_package = $${paramIndex}`
      queryParams.push(isGiftPackageParam === 'true')
      paramIndex++
    }

    queryText += ` GROUP BY p.id ORDER BY p.created_at DESC`

    if (hasPagination) {
      queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
      queryParams.push(limit, offset)

      // Get total count
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
        countParams.push(isBestsellerParam === 'true')
        countParamIndex++
      }
      if (isNewParam !== null) {
        countQuery += ` AND is_new = $${countParamIndex}`
        countParams.push(isNewParam === 'true')
        countParamIndex++
      }
      if (isGiftPackageParam !== null) {
        countQuery += ` AND is_gift_package = $${countParamIndex}`
        countParams.push(isGiftPackageParam === 'true')
      }

      const [productsResult, countResult] = await Promise.all([
        pool.query(queryText, queryParams),
        pool.query(countQuery, countParams)
      ])

      const products = productsResult.rows.map(row => ({
        ...row,
        isActive: row.is_active,
        isNew: row.is_new,
        isBestseller: row.is_bestseller,
        isGiftPackage: row.is_gift_package,
        packagePrice: row.package_price ? parseFloat(row.package_price) : null,
        packageOriginalPrice: row.package_original_price ? parseFloat(row.package_original_price) : null,
        rating: parseFloat(row.rating) || 0,
        reviews: parseInt(row.reviews) || 0,
        createdAt: row.created_at,
      }))

      const total = parseInt(countResult.rows[0].count)
      const totalPages = Math.max(Math.ceil(total / limit), 1)

      console.log(`⏱️ [API] Request completed in ${Date.now() - startTime}ms (page=${page}, limit=${limit}, total=${total})`)
      
      return NextResponse.json(products, {
        headers: {
          "X-Total-Count": String(total),
          "X-Page": String(page),
          "X-Limit": String(limit),
          "X-Total-Pages": String(totalPages),
          "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        }
      })
    } else {
      const result = await pool.query(queryText, queryParams)
      
      const products = result.rows.map(row => ({
        ...row,
        isActive: row.is_active,
        isNew: row.is_new,
        isBestseller: row.is_bestseller,
        isGiftPackage: row.is_gift_package,
        packagePrice: row.package_price ? parseFloat(row.package_price) : null,
        packageOriginalPrice: row.package_original_price ? parseFloat(row.package_original_price) : null,
        rating: parseFloat(row.rating) || 0,
        reviews: parseInt(row.reviews) || 0,
        createdAt: row.created_at,
      }))

      console.log(`⏱️ [API] Request completed in ${Date.now() - startTime}ms (all=${products.length})`)
      
      return NextResponse.json(products, {
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        }
      })
    }

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
