import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import pool from "@/lib/postgresql"

export async function GET(request: NextRequest) {
  try {
    const result = await pool.query(`
      SELECT id as "_id",
             code,
             type,
             value,
             min_order_amount as "minOrderAmount",
             max_uses as "maxUses",
             current_uses as "currentUses",
             expires_at as "expiresAt",
             is_active as "isActive",
             buy_x as "buyX",
             get_x as "getX",
             created_at as "createdAt",
             updated_at as "updatedAt"
      FROM discount_codes
      ORDER BY created_at DESC
    `)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error in GET /api/discount-codes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    
    if (!token) {
      return NextResponse.json({ error: "Authorization required" }, { status: 401 })
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!)
    } catch (jwtError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { code, type, value, minOrderAmount, maxUses, expiresAt, buyX, getX } = await request.json()

    if (!code || !type || value === undefined) {
      return NextResponse.json({ error: "Code, type, and value are required" }, { status: 400 })
    }

    const result = await pool.query(`
      INSERT INTO discount_codes (code, type, value, min_order_amount, max_uses, expires_at, buy_x, get_x)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id as "_id",
                code,
                type,
                value,
                min_order_amount as "minOrderAmount",
                max_uses as "maxUses",
                current_uses as "currentUses",
                expires_at as "expiresAt",
                is_active as "isActive",
                buy_x as "buyX",
                get_x as "getX",
                created_at as "createdAt",
                updated_at as "updatedAt"
    `, [
      code.toUpperCase(),
      type,
      value,
      minOrderAmount || null,
      maxUses || null,
      expiresAt || null,
      buyX || null,
      getX || null
    ])

    return NextResponse.json({
      success: true,
      discountCode: result.rows[0],
      message: "Discount code created successfully"
    })
  } catch (error) {
    console.error("Error in POST /api/discount-codes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    
    if (!token) {
      return NextResponse.json({ error: "Authorization required" }, { status: 401 })
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!)
    } catch (jwtError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { id, code, type, value, minOrderAmount, maxUses, expiresAt, isActive, buyX, getX } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Discount code ID is required" }, { status: 400 })
    }

    const result = await pool.query(`
      UPDATE discount_codes 
      SET code = $1,
          type = $2,
          value = $3,
          min_order_amount = $4,
          max_uses = $5,
          expires_at = $6,
          is_active = $7,
          buy_x = $8,
          get_x = $9,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING id as "_id",
                code,
                type,
                value,
                min_order_amount as "minOrderAmount",
                max_uses as "maxUses",
                current_uses as "currentUses",
                expires_at as "expiresAt",
                is_active as "isActive",
                buy_x as "buyX",
                get_x as "getX",
                created_at as "createdAt",
                updated_at as "updatedAt"
    `, [code.toUpperCase(), type, value, minOrderAmount || null, maxUses || null, expiresAt || null, isActive, buyX || null, getX || null, id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Discount code not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      discountCode: result.rows[0],
      message: "Discount code updated successfully"
    })
  } catch (error) {
    console.error("Error in PUT /api/discount-codes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    
    if (!token) {
      return NextResponse.json({ error: "Authorization required" }, { status: 401 })
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!)
    } catch (jwtError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Discount code ID is required" }, { status: 400 })
    }

    await pool.query('DELETE FROM discount_codes WHERE id = $1', [id])

    return NextResponse.json({
      success: true,
      message: "Discount code deleted successfully"
    })
  } catch (error) {
    console.error("Error in DELETE /api/discount-codes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
