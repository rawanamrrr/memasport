import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import pool from "@/lib/postgresql"

interface Offer {
  id: string
  title: string
  description: string
  discountCode?: string
  isActive: boolean
  priority: number
}

export async function GET(request: NextRequest) {
  try {
    const result = await pool.query(`
      SELECT id as _id,
             title,
             description,
             discount_code as "discountCode",
             is_active as "isActive",
             priority,
             expires_at as "expiresAt",
             created_at as "createdAt",
             updated_at as "updatedAt"
      FROM offers
      WHERE is_active = true
      ORDER BY priority DESC, created_at DESC
    `)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error in GET /api/offers:", error)
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

    const { title, description, discountCode, isActive, priority } = await request.json()

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 })
    }

    const result = await pool.query(`
      INSERT INTO offers (title, description, discount_code, is_active, priority)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id as _id,
                title,
                description,
                discount_code as "discountCode",
                is_active as "isActive",
                priority,
                expires_at as "expiresAt",
                created_at as "createdAt",
                updated_at as "updatedAt"
    `, [title, description, discountCode || null, isActive !== false, priority || 0])

    return NextResponse.json({
      success: true,
      offer: result.rows[0],
      message: "Offer created successfully"
    })
  } catch (error) {
    console.error("Error in POST /api/offers:", error)
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

    const { id, title, description, discountCode, isActive, priority } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Offer ID is required" }, { status: 400 })
    }

    const result = await pool.query(`
      UPDATE offers 
      SET title = $1,
          description = $2,
          discount_code = $3,
          is_active = $4,
          priority = $5,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING id as _id,
                title,
                description,
                discount_code as "discountCode",
                is_active as "isActive",
                priority,
                expires_at as "expiresAt",
                created_at as "createdAt",
                updated_at as "updatedAt"
    `, [title, description, discountCode || null, isActive, priority || 0, id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      offer: result.rows[0],
      message: "Offer updated successfully"
    })
  } catch (error) {
    console.error("Error in PUT /api/offers:", error)
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
      return NextResponse.json({ error: "Offer ID is required" }, { status: 400 })
    }

    await pool.query('DELETE FROM offers WHERE id = $1', [id])

    return NextResponse.json({
      success: true,
      message: "Offer deleted successfully"
    })
  } catch (error) {
    console.error("Error in DELETE /api/offers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
