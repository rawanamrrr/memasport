import { type NextRequest, NextResponse } from "next/server"
import { getProductDetail } from "@/lib/products-service"

const validCategories = ["equipment", "apparel", "accessories", "outlet"] as const;
type ValidCategory = typeof validCategories[number];

export async function GET(request: NextRequest, { params }: { params: { category: string; productId: string } }) {
  try {
    const { category, productId } = params

    // Validate category
    if (!validCategories.includes(category as ValidCategory)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    const { status, body, headers } = await getProductDetail(category, productId)
    return NextResponse.json(body, { status, headers })
  } catch (error) {
    console.error("Get product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}