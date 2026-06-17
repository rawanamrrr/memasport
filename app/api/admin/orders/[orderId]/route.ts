import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import pool from "@/lib/postgresql"

export async function GET(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authorization required" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { orderId } = params

    const orderResult = await pool.query(
      `
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
               ) AS items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.id = $1
        GROUP BY o.id
      `,
      [orderId],
    )

    if (orderResult.rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const order = orderResult.rows[0]

    // Transform to match the dashboard's expected format
    const formattedOrder = {
      _id: order.id,
      id: order.order_number, // Using order_number as id for compatibility
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
        secondaryPhone: order.customer_phone, // Using same phone as fallback
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

    return NextResponse.json(formattedOrder)
  } catch (error) {
    console.error("Get admin order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authorization required" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { orderId } = params
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      const currentOrderResult = await client.query(
        `SELECT * FROM orders WHERE id = $1 FOR UPDATE`,
        [orderId],
      )

      if (currentOrderResult.rows.length === 0) {
        await client.query('ROLLBACK')
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
      }

      const currentOrder = currentOrderResult.rows[0]
      const previousStatus = currentOrder.status

      await client.query(
        `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [status, orderId],
      )

      const updatedOrderResult = await client.query(
        `
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
                 ) AS items
          FROM orders o
          LEFT JOIN order_items oi ON o.id = oi.order_id
          WHERE o.id = $1
          GROUP BY o.id
        `,
        [orderId],
      )

      await client.query('COMMIT')

      const updatedOrder = updatedOrderResult.rows[0]

      // Send order update email
      try {
        const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.sensefragrance.com'}/api/send-order-update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order: updatedOrder,
            previousStatus: previousStatus,
            newStatus: status,
          }),
        })

        if (!updateResponse.ok) {
          console.error(`❌ Failed to send order update email for order ${orderId}`)
        }
      } catch (emailError) {
        console.error("❌ Error sending order update email:", emailError)
      }

      // If status is 'delivered', send review reminders
      if (status === 'delivered' && updatedOrder.items) {
        try {
          for (const item of updatedOrder.items) {
            const reviewReminderResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.sensefragrance.com'}/api/send-review-reminder`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                order: updatedOrder,
                product: {
                  id: item.productId,
                  name: item.productName,
                  image: item.image,
                },
              }),
            })

            if (!reviewReminderResponse.ok) {
              console.error(`❌ Failed to send review reminder email for product ${item.productName}`)
            }
          }
        } catch (reviewEmailError) {
          console.error("❌ Error sending review reminder emails:", reviewEmailError)
        }
      }

      return NextResponse.json({
        success: true,
        message: "Order status updated successfully",
        order: updatedOrder,
      })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Update admin order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
