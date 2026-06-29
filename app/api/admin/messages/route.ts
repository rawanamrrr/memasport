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

// List contact form submissions.
export async function GET(request: NextRequest) {
  const auth = requireAdmin(request)
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const result = await pool.query(`
      SELECT id, name, email, subject, message, is_read, created_at
      FROM contact_messages
      ORDER BY created_at DESC
    `)
    const messages = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      subject: row.subject,
      message: row.message,
      isRead: row.is_read,
      createdAt: row.created_at,
    }))
    return NextResponse.json(messages)
  } catch (error) {
    console.error("❌ [API] Error in GET /api/admin/messages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Mark a message read/unread.
export async function PATCH(request: NextRequest) {
  const auth = requireAdmin(request)
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const { id, isRead } = await request.json()
    if (id === undefined) return NextResponse.json({ error: "id is required" }, { status: 400 })
    await pool.query("UPDATE contact_messages SET is_read = $1 WHERE id = $2", [isRead !== false, id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ [API] Error in PATCH /api/admin/messages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Delete a message.
export async function DELETE(request: NextRequest) {
  const auth = requireAdmin(request)
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 })
    await pool.query("DELETE FROM contact_messages WHERE id = $1", [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ [API] Error in DELETE /api/admin/messages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
