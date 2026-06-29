// /app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/lib/postgresql";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const result = await pool.query("SELECT id, email, name, role FROM users WHERE id = $1", [decoded.userId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ authenticated: false }, { status: 404 });
    }

    const user = result.rows[0];

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
