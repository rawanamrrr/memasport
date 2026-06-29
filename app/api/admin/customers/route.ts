import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import pool from "@/lib/postgresql"

export const runtime = "nodejs"

function requireAdmin(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return { error: "Authorization required", status: 401 as const }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    if (decoded.role !== "admin") return { error: "Admin access required", status: 403 as const }
    return { decoded }
  } catch {
    return { error: "Invalid token", status: 401 as const }
  }
}

// List all registered customers with order stats.
export async function GET(request: NextRequest) {
  const auth = requireAdmin(request)
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, u.phone, u.role, u.is_verified, u.created_at,
             COUNT(DISTINCT o.id) AS order_count,
             COALESCE(SUM(CASE WHEN o.status <> 'cancelled' THEN o.total ELSE 0 END), 0) AS total_spent,
             MAX(o.created_at) AS last_order_at
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `)

    const customers = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      role: row.role,
      isVerified: row.is_verified,
      createdAt: row.created_at,
      orderCount: parseInt(row.order_count, 10) || 0,
      totalSpent: parseFloat(row.total_spent) || 0,
      lastOrderAt: row.last_order_at,
    }))

    return NextResponse.json(customers)
  } catch (error) {
    console.error("❌ [API] Error in GET /api/admin/customers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
