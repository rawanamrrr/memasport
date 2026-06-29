import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/postgresql";

export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const productResult = await pool.query("SELECT id FROM products WHERE id = $1", [productId]);
    if (productResult.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const statsResult = await pool.query(
      `SELECT COUNT(*) as count, AVG(rating) as avg_rating FROM reviews WHERE product_id = $1`,
      [productId]
    );

    const reviewCount = parseInt(statsResult.rows[0].count, 10);

    if (reviewCount === 0) {
      await pool.query(
        `UPDATE products SET rating = 0, reviews = 0, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [productId]
      );
      return NextResponse.json({
        message: "No reviews found for this product",
        rating: 0,
        reviewCount: 0
      });
    }

    const averageRating = Math.round((parseFloat(statsResult.rows[0].avg_rating) || 0) * 10) / 10;

    const updateResult = await pool.query(
      `UPDATE products SET rating = $1, reviews = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
      [averageRating, reviewCount, productId]
    );

    return NextResponse.json({
      success: true,
      message: "Rating recalculated successfully",
      productId,
      rating: averageRating,
      reviewCount,
      matchedCount: updateResult.rowCount,
      modifiedCount: updateResult.rowCount
    });

  } catch (error: any) {
    console.error("Recalculate rating error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
