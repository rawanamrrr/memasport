import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import pool from "@/lib/postgresql"
import type { Order } from "@/lib/models/types"

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  console.log("🔍 [API] GET /api/orders - Request received")

  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    console.log("🔐 [API] Token present:", !!token)

    if (!token) {
      console.log("❌ [API] No authorization token provided")
      return NextResponse.json({ error: "Authorization required" }, { status: 401 })
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!)
      console.log("✅ [API] Token verified for user:", decoded.email, "Role:", decoded.role)
    } catch (jwtError) {
      console.error("❌ [API] JWT verification failed:", jwtError)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    let query = `
      SELECT o.*, 
             json_agg(
               json_build_object(
                 'id', oi.id,
                 'productId', oi.product_id,
                 'productName', oi.product_name,
                 'size', oi.size,
                 'volume', oi.volume,
                 'price', oi.price,
                 'originalPrice', oi.original_price,
                 'quantity', oi.quantity,
                 'image', oi.image,
                 'category', oi.category
               ) ORDER BY oi.id
             ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
    `
    
    const params: any[] = []
    
    // If user role, only show their orders
    if (decoded.role === "user") {
      query += ` WHERE o.user_id = $1`
      params.push(decoded.userId)
      console.log("👤 [API] Filtering orders for user:", decoded.userId)
    } else {
      console.log("👑 [API] Admin access - fetching all orders")
    }

    query += ` GROUP BY o.id ORDER BY o.created_at DESC`

    const result = await pool.query(query, params)

    console.log(`✅ [API] Found ${result.rows.length} orders`)

    // Transform to match expected format
    const orders = result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      orderNumber: row.order_number,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      shippingAddress: row.shipping_address,
      city: row.city,
      governorate: row.governorate,
      postalCode: row.postal_code,
      subtotal: parseFloat(row.subtotal),
      shippingCost: parseFloat(row.shipping_cost),
      discount: parseFloat(row.discount),
      discountCode: row.discount_code,
      total: parseFloat(row.total),
      status: row.status,
      paymentMethod: row.payment_method,
      notes: row.notes,
      items: row.items || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))

    const responseTime = Date.now() - startTime
    console.log(`⏱️ [API] Request completed in ${responseTime}ms`)

    return NextResponse.json(orders)
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error("❌ [API] Error in GET /api/orders:", error)
    console.error("🔍 [API] Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      responseTime: `${responseTime}ms`,
    })

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  console.log("🔍 [API] POST /api/orders - Request received")

  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    console.log("🔐 [API] Token present:", !!token)

    // Parse request body first
    const orderData = await request.json()
    console.log("📝 [API] Order data received:")
    console.log("   Items count:", orderData.items?.length || 0)
    console.log("   Total:", orderData.total)
    console.log("   Payment method:", orderData.paymentMethod)
    console.log("   Customer:", orderData.shippingAddress?.name)

    let userId = null

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
        userId = decoded.userId
        console.log("✅ [API] Authenticated user:", decoded.email)
      } catch (jwtError) {
        console.log("⚠️ [API] Invalid token, proceeding as guest order")
      }
    } else {
      console.log("👤 [API] Guest order (no token provided)")
    }

    console.log("✅ [API] Database connection established")

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
    console.log("🆔 [API] Generated order number:", orderNumber)

    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')

      // Insert order
      const orderResult = await client.query(`
        INSERT INTO orders (
          user_id, order_number, customer_name, customer_email, customer_phone,
          shipping_address, city, governorate, postal_code,
          subtotal, shipping_cost, discount, discount_code, total,
          status, payment_method, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING id
      `, [
        userId,
        orderNumber,
        orderData.shippingAddress.name,
        orderData.shippingAddress.email || '',
        orderData.shippingAddress.phone || '',
        orderData.shippingAddress.address,
        orderData.shippingAddress.city,
        orderData.shippingAddress.governorate || '',
        orderData.shippingAddress.postalCode || '',
        orderData.subtotal || orderData.total,
        orderData.shippingCost || 0,
        orderData.discountAmount || 0,
        orderData.discountCode || null,
        orderData.total,
        'pending',
        orderData.paymentMethod || 'cod',
        orderData.notes || null
      ])

      const orderId = orderResult.rows[0].id
      console.log("✅ [API] Order inserted with ID:", orderId)

      // Insert order items
      for (const item of orderData.items) {
        await client.query(`
          INSERT INTO order_items (
            order_id, product_id, product_name, size, volume,
            price, original_price, quantity, image, category
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          orderId,
          item.id,
          item.name,
          item.size || null,
          item.volume || null,
          item.price,
          item.originalPrice || item.price,
          item.quantity,
          item.image || null,
          item.category || null
        ])
      }

      await client.query('COMMIT')

      console.log("✅ [API] Order and items saved successfully")

      const responseTime = Date.now() - startTime
      console.log(`⏱️ [API] Order creation completed in ${responseTime}ms`)

      return NextResponse.json({
        success: true,
        order: {
          id: orderId,
          orderNumber,
          status: 'pending',
          total: orderData.total,
        },
        message: "Order created successfully",
      })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }

  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error("❌ [API] Error in POST /api/orders:", error)
    console.error("🔍 [API] Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      responseTime: `${responseTime}ms`,
    })

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
