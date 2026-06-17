import { NextResponse } from "next/server"
import pool from "@/lib/postgresql"

export async function GET() {
  try {
    // Test database connection
    await pool.query('SELECT 1')
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: 'PostgreSQL connection successful'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
