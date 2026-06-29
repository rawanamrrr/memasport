import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/postgresql";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  const client = await pool.connect();
  try {
    // 1. Authentication
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { error: "Authorization token missing" },
        { status: 401 }
      );
    }

    // 2. Token Verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
    };

    // 3. Parse and Validate Request
    const body = await req.json();

    // Accept either productId or id from the request
    const productId = body.id || body.productId;
    if (!productId) {
      return NextResponse.json(
        { error: "Product identifier is required" },
        { status: 400 }
      );
    }

    const orderId = body.orderId || body.order_id;
    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    if (body.rating === undefined || body.rating === null) {
      return NextResponse.json(
        { error: "Rating is required" },
        { status: 400 }
      );
    }

    const rating = Number(body.rating);
    if (isNaN(rating)) {
      return NextResponse.json(
        { error: "Rating must be a number" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // 4. Verify order exists, belongs to user, and is completed
    const orderResult = await client.query(
      `SELECT o.id, o.user_id, o.status
       FROM orders o
       WHERE o.id = $1 AND o.user_id = $2 AND o.status IN ('shipped', 'delivered')`,
      [orderId, decoded.userId]
    );

    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Order not found or not delivered" },
        { status: 400 }
      );
    }

    // EXTRACT BASE PRODUCT ID (remove size suffix like -bundle, -Travel, -Reguler, etc.)
    const baseProductId = productId.replace(/-[a-zA-Z0-9]+$/, '');

    // For gift packages, extract the actual base product (strip -gift-package-timestamp)
    let actualBaseProductId = baseProductId;
    if (baseProductId.includes('-gift-package')) {
      actualBaseProductId = baseProductId.replace(/-gift-package.*$/, '');
    }

    // Verify the item belongs to this order
    const itemResult = await client.query(
      `SELECT id, product_id FROM order_items
       WHERE order_id = $1 AND (product_id = $2 OR product_id = $3)`,
      [orderId, productId, actualBaseProductId]
    );

    if (itemResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Product not found in order" },
        { status: 400 }
      );
    }

    // Check if this product was already reviewed for this order
    const existingReview = await client.query(
      `SELECT id FROM reviews WHERE product_id = $1 AND user_id = $2 AND order_id = $3`,
      [actualBaseProductId, decoded.userId, orderId]
    );

    if (existingReview.rows.length > 0) {
      return NextResponse.json(
        { error: "You have already reviewed this product for this order" },
        { status: 400 }
      );
    }

    // Get user's name/email for the review record
    const userResult = await client.query("SELECT name, email FROM users WHERE id = $1", [decoded.userId]);
    const customerName = userResult.rows[0]?.name || decoded.email;
    const customerEmail = userResult.rows[0]?.email || decoded.email;

    await client.query('BEGIN');

    // 5. Save review
    const reviewResult = await client.query(
      `INSERT INTO reviews (product_id, order_id, user_id, customer_name, customer_email, rating, comment, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
       RETURNING id, created_at`,
      [actualBaseProductId, orderId, decoded.userId, customerName, customerEmail, rating, body.comment || ""]
    );

    // 6. Recalculate product rating + review count
    const statsResult = await client.query(
      `SELECT COUNT(*) as count, AVG(rating) as avg_rating FROM reviews WHERE product_id = $1`,
      [actualBaseProductId]
    );

    const reviewCount = parseInt(statsResult.rows[0].count, 10);
    const averageRating = Math.round((parseFloat(statsResult.rows[0].avg_rating) || 0) * 10) / 10;

    await client.query(
      `UPDATE products SET rating = $1, reviews = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
      [averageRating, reviewCount, actualBaseProductId]
    );

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      message: "Review submitted successfully",
      review: {
        id: reviewResult.rows[0].id,
        productId: actualBaseProductId,
        orderId,
        userId: decoded.userId,
        customerName,
        rating,
        comment: body.comment || "",
        createdAt: reviewResult.rows[0].created_at,
      }
    });

  } catch (error: any) {
    await client.query('ROLLBACK').catch(() => {});
    console.error("Review submission error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
