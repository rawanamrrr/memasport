import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import pool from "@/lib/postgresql"

export async function PATCH(request: NextRequest, { params }: { params: { orderId: string } }) {
  const client = await pool.connect()
  
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authorization required" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    // Only admins can update order status
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { orderId } = params
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    await client.query('BEGIN')

    // Update the order status
    const updateResult = await client.query(
      `UPDATE orders 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [status, orderId]
    )

    if (updateResult.rowCount === 0) {
      await client.query('ROLLBACK')
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Get the updated order with its items
    const orderResult = await client.query(
      `SELECT o.*, 
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
       WHERE o.id = $1
       GROUP BY o.id`,
      [orderId]
    )

    await client.query('COMMIT')

    const order = orderResult.rows[0]
    
    // Format the order to match the expected response
    const formattedOrder = {
      _id: order.id,
      id: order.order_number,
      total: parseFloat(order.total),
      subtotal: parseFloat(order.subtotal),
      shipping: parseFloat(order.shipping_cost),
      status: order.status,
      discountAmount: parseFloat(order.discount) || 0,
      discountCode: order.discount_code,
      paymentMethod: order.payment_method,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      shippingAddress: {
        name: order.customer_name,
        governorate: order.governorate,
        phone: order.customer_phone,
        secondaryPhone: order.customer_phone,
        address: order.shipping_address,
        city: order.city,
        postalCode: order.postal_code,
        email: order.customer_email
      },
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      items: (order.items || []).map((item: any) => ({
        id: item.id,
        productId: item.productId,
        name: item.productName,
        price: parseFloat(item.price),
        originalPrice: parseFloat(item.originalPrice || item.price),
        quantity: parseInt(item.quantity, 10),
        size: item.size,
        volume: item.volume,
        image: item.image,
        category: item.category
      })),
      notes: order.notes
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
      order: formattedOrder,
    })
  } catch (error) {
    console.error("Update order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    client.release()
  }
}
