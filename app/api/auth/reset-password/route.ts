import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/postgresql"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Verify token
    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!)
    } catch (error) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    const userResult = await pool.query("SELECT id FROM users WHERE id = $1", [decoded.userId])

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update password
    await pool.query(
      "UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [hashedPassword, decoded.userId]
    )

    return NextResponse.json({ message: "Password reset successfully" })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
