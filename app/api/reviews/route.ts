import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import pool from "@/lib/postgresql"

// Simplified reviews route - returns empty for now
// Reviews functionality can be added later

export async function GET(request: NextRequest) {
  try {
    // Return empty reviews array for now
    return NextResponse.json({ reviews: [] })
  } catch (error) {
    console.error("Error in GET /api/reviews:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Stub - reviews can be added later
    return NextResponse.json({ success: true, message: "Review functionality coming soon" })
  } catch (error) {
    console.error("Error in POST /api/reviews:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
