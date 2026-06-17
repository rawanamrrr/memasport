import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/postgresql"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate product ID
    if (!params.id || params.id === "undefined") {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get("orderId")
    const baseProductId = params.id

    console.log("Base product ID from params:", baseProductId)

    // Build query to find reviews for this product
    // PostgreSQL uses LIKE for pattern matching instead of regex
    let query = `
      SELECT * FROM reviews 
      WHERE (
        product_id = $1 
        OR product_id LIKE $2
      )
    `
    const queryParams: any[] = [baseProductId, `${baseProductId}-%`]
    
    if (orderId) {
      query += ` AND order_id = $3`
      queryParams.push(orderId)
    }
    
    query += ` ORDER BY created_at DESC`

    const result = await pool.query(query, queryParams)

    console.log(`Found ${result.rows.length} reviews for product ${baseProductId}`)

    // Convert snake_case to camelCase for frontend
    const serializedReviews = result.rows.map(review => ({
      id: review.id,
      productId: review.product_id,
      userId: review.user_id,
      customerName: review.customer_name,
      customerEmail: review.customer_email,
      rating: parseInt(review.rating),
      comment: review.comment,
      orderId: review.order_id,
      isVerified: review.is_verified,
      createdAt: review.created_at,
      updatedAt: review.updated_at
    }))

    return NextResponse.json({ reviews: serializedReviews })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    )
  }
}

