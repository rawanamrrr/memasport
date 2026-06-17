import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/postgresql"

export async function GET(request: NextRequest) {
  console.log("🧪 [API] Database test endpoint called")

  try {
    // Test basic connection
    const timeResult = await pool.query('SELECT NOW()')
    
    // Get table counts
    const productsCount = await pool.query('SELECT COUNT(*) FROM products')
    const ordersCount = await pool.query('SELECT COUNT(*) FROM orders')
    const usersCount = await pool.query('SELECT COUNT(*) FROM users')

    console.log("✅ [Test] All database tests completed successfully")

    return NextResponse.json({
      success: true,
      message: "Database tests completed successfully",
      connection: true,
      timestamp: timeResult.rows[0].now,
      tables: {
        products: parseInt(productsCount.rows[0].count),
        orders: parseInt(ordersCount.rows[0].count),
        users: parseInt(usersCount.rows[0].count),
      },
      environment: process.env.NODE_ENV,
    })
  } catch (error) {
    console.error("❌ [Test] Database test failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
