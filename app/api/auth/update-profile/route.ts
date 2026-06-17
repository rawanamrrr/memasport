import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import pool from "@/lib/postgresql"
import type { User } from "@/lib/models/types"

export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authorization required" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const { name, email, currentPassword, newPassword } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    // Get user
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId])

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = userResult.rows[0]

    // Check if email is already in use by another user
    if (email !== user.email) {
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, decoded.userId]
      )

      if (existingUser.rows.length > 0) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 })
      }
    }

    // Prepare update query
    let updateQuery = 'UPDATE users SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP'
    const params: any[] = [name, email]
    let paramIndex = 3

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required" }, { status: 400 })
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password)
      if (!isValidPassword) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 12)
      updateQuery += `, password = $${paramIndex}`
      params.push(hashedNewPassword)
      paramIndex++
    }

    updateQuery += ` WHERE id = $${paramIndex}`
    params.push(decoded.userId)

    await pool.query(updateQuery, params)

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        name,
        email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
