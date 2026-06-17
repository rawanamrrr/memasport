// EXAMPLE: Updated products route for PostgreSQL
// This shows how to convert from MongoDB to PostgreSQL
// Copy relevant parts to your actual route.ts file

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

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  console.log("🔍 [API] GET /api/products - Request received")

  try {
    const { searchParams } = new URL(request.url)
    
    const id = searchParams.get("id")
    const category = searchParams.get("category")
    const isBestseller = searchParams.get("isBestseller")
    const isNew = searchParams.get("isNew")
    const isGiftPackage = searchParams.get("isGiftPackage")
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1)
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10), 1), 1000)
    const offset = (page - 1) * limit

    // Single product request
    if (id) {
      const result = await pool.query(
        `SELECT p.*, 
                json_agg(
                  json_build_object(
                    'size', ps.size,
                    'volume', ps.volume,
                    'originalPrice', ps.original_price,
                    'discountedPrice', ps.discounted_price
                  )
                ) as sizes
         FROM products p
         LEFT JOIN product_sizes ps ON p.id = ps.product_id
         WHERE p.id = $1
         GROUP BY p.id`,
        [id]
      )

      if (result.rows.length === 0) {
        return errorResponse("Product not found", 404)
      }

      const product = result.rows[0]
      return NextResponse.json(product, {
        headers: {
          "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        }
      })
    }

    // Build dynamic query
    let queryText = `
      SELECT p.*, 
             json_agg(
               json_build_object(
                 'size', ps.size,
                 'volume', ps.volume,
                 'originalPrice', ps.original_price,
                 'discountedPrice', ps.discounted_price
               )
             ) FILTER (WHERE ps.id IS NOT NULL) as sizes
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

    if (isBestseller !== null) {
      queryText += ` AND p.is_bestseller = $${paramIndex}`
      queryParams.push(isBestseller === 'true')
      paramIndex++
    }

    if (isNew !== null) {
      queryText += ` AND p.is_new = $${paramIndex}`
      queryParams.push(isNew === 'true')
      paramIndex++
    }

    if (isGiftPackage !== null) {
      queryText += ` AND p.is_gift_package = $${paramIndex}`
      queryParams.push(isGiftPackage === 'true')
      paramIndex++
    }

    queryText += ` GROUP BY p.id ORDER BY p.created_at DESC`

    // Add pagination if requested
    if (searchParams.has("page") || searchParams.has("limit")) {
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

      const [productsResult, countResult] = await Promise.all([
        pool.query(queryText, queryParams),
        pool.query(countQuery, countParams)
      ])

      const total = parseInt(countResult.rows[0].count)
      const totalPages = Math.max(Math.ceil(total / limit), 1)

      console.log(`⏱️ [API] Request completed in ${Date.now() - startTime}ms (page=${page}, limit=${limit}, total=${total})`)

      return NextResponse.json(productsResult.rows, {
        headers: {
          "X-Total-Count": String(total),
          "X-Page": String(page),
          "X-Limit": String(limit),
          "X-Total-Pages": String(totalPages),
          "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        }
      })
    } else {
      // No pagination - return all
      const result = await pool.query(queryText, queryParams)
      
      console.log(`⏱️ [API] Request completed in ${Date.now() - startTime}ms (all=${result.rows.length})`)
      
      return NextResponse.json(result.rows, {
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

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  console.log("🔍 [API] POST /api/products - Request received")

  try {
    // Authentication check
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

    const body = await request.json()
    const { 
      id, name, description, longDescription, images, category,
      isActive, isNew, isBestseller, isGiftPackage,
      packagePrice, packageOriginalPrice, notes, sizes 
    } = body

    // Start transaction
    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')

      // Insert product
      const productResult = await client.query(
        `INSERT INTO products (
          id, name, description, long_description, images, category,
          is_active, is_new, is_bestseller, is_gift_package,
          package_price, package_original_price, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [
          id, name, description, longDescription, images, category,
          isActive ?? true, isNew ?? false, isBestseller ?? false, isGiftPackage ?? false,
          packagePrice, packageOriginalPrice, notes ? JSON.stringify(notes) : null
        ]
      )

      // Insert sizes
      if (sizes && sizes.length > 0) {
        for (const size of sizes) {
          await client.query(
            `INSERT INTO product_sizes (product_id, size, volume, original_price, discounted_price)
             VALUES ($1, $2, $3, $4, $5)`,
            [id, size.size, size.volume, size.originalPrice, size.discountedPrice]
          )
        }
      }

      await client.query('COMMIT')

      console.log(`⏱️ [API] Product created in ${Date.now() - startTime}ms`)
      return NextResponse.json(productResult.rows[0], { status: 201 })

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

export async function PUT(request: NextRequest) {
  const startTime = Date.now()
  console.log("🔍 [API] PUT /api/products - Request received")

  try {
    // Authentication check
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

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return errorResponse("Product ID required", 400)
    }

    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')

      // Update product
      const updateFields: string[] = []
      const updateValues: any[] = []
      let paramIndex = 1

      const fieldMap: Record<string, string> = {
        name: 'name',
        description: 'description',
        longDescription: 'long_description',
        images: 'images',
        category: 'category',
        isActive: 'is_active',
        isNew: 'is_new',
        isBestseller: 'is_bestseller',
        isGiftPackage: 'is_gift_package',
        packagePrice: 'package_price',
        packageOriginalPrice: 'package_original_price',
        notes: 'notes'
      }

      for (const [jsKey, dbKey] of Object.entries(fieldMap)) {
        if (updates[jsKey] !== undefined) {
          updateFields.push(`${dbKey} = $${paramIndex}`)
          updateValues.push(jsKey === 'notes' ? JSON.stringify(updates[jsKey]) : updates[jsKey])
          paramIndex++
        }
      }

      if (updateFields.length > 0) {
        updateValues.push(id)
        const updateQuery = `
          UPDATE products 
          SET ${updateFields.join(', ')}
          WHERE id = $${paramIndex}
          RETURNING *
        `
        await client.query(updateQuery, updateValues)
      }

      // Update sizes if provided
      if (updates.sizes) {
        // Delete existing sizes
        await client.query('DELETE FROM product_sizes WHERE product_id = $1', [id])
        
        // Insert new sizes
        for (const size of updates.sizes) {
          await client.query(
            `INSERT INTO product_sizes (product_id, size, volume, original_price, discounted_price)
             VALUES ($1, $2, $3, $4, $5)`,
            [id, size.size, size.volume, size.originalPrice, size.discountedPrice]
          )
        }
      }

      await client.query('COMMIT')

      console.log(`⏱️ [API] Product updated in ${Date.now() - startTime}ms`)
      return NextResponse.json({ success: true, message: "Product updated" })

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
      return errorResponse("Product ID required", 400)
    }

    // Soft delete - just set is_active to false
    await pool.query(
      'UPDATE products SET is_active = false WHERE id = $1',
      [id]
    )

    return NextResponse.json({ success: true, message: "Product deleted" })

  } catch (error) {
    console.error("❌ [API] Error in DELETE /api/products:", error)
    return errorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    )
  }
}
