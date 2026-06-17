import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/postgresql";
import jwt from "jsonwebtoken";

function errorResponse(message: string, status: number = 400) {
  console.error(`API Error [${status}]:`, message);
  return NextResponse.json({ error: message }, { status });
}

// Helper function to get the smallest price from sizes
function getSmallestPrice(sizes: any[]) {
  if (!sizes || sizes.length === 0) return 0;
  
  const prices = sizes.map(size => size.discountedPrice || size.originalPrice || size.price || 0);
  return Math.min(...prices.filter(price => price > 0));
}

// Helper function to transform sizes to match the expected format
function transformSizes(sizes: any[]) {
  if (!sizes || sizes.length === 0) return [];
  
  return sizes.map(size => ({
    size: size.size,
    volume: size.volume,
    originalPrice: size.originalPrice || size.price || 0,
    discountedPrice: size.discountedPrice || size.price || 0,
  }));
}

export async function GET(request: NextRequest) {
  console.log("Favorites API - GET Request Received");

  // Auth check
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    console.log("No Authorization header found");
    return errorResponse("Authorization required", 401);
  }

  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    console.log("No token found in Authorization header");
    return errorResponse("Authorization required", 401);
  }

  let decoded: { userId: string };
  try {
    console.log("Verifying token...");
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    console.log("Token successfully decoded:", decoded);
  } catch (err) {
    console.error("Token verification failed:", err);
    return errorResponse("Invalid or expired token", 401);
  }

  try {
    console.log("Fetching favorites from database for user:", decoded.userId);

    // Get all favorites for this user with product details
    const result = await pool.query(`
      SELECT f.*, p.name, p.description, p.images, p.category, p.rating, p.reviews,
             p.is_new, p.is_bestseller, p.is_gift_package, p.package_price, p.package_original_price,
             COALESCE(
               json_agg(
                 json_build_object(
                   'size', ps.size,
                   'volume', ps.volume,
                   'originalPrice', ps.original_price,
                   'discountedPrice', ps.discounted_price
                 )
               ) FILTER (WHERE ps.id IS NOT NULL),
               '[]'::json
             ) as sizes
      FROM favorites f
      LEFT JOIN products p ON f.product_id = p.id
      LEFT JOIN product_sizes ps ON p.id = ps.product_id
      WHERE f.user_id = $1
      GROUP BY f.id, f.product_id, f.product_name, f.price, f.image, f.category, f.rating,
               f.is_new, f.is_bestseller, f.is_gift_package, f.package_price, f.package_original_price,
               f.created_at, p.name, p.description, p.images, p.category, p.rating, p.reviews,
               p.is_new, p.is_bestseller, p.is_gift_package, p.package_price, p.package_original_price
      ORDER BY f.created_at DESC
    `, [decoded.userId]);

    console.log(`Found ${result.rows.length} favorites for user`);

    if (result.rows.length === 0) {
      console.log("No favorites found - returning empty array");
      return NextResponse.json([]);
    }

    // Transform to match expected format
    const transformedProducts = result.rows.map(row => ({
      id: row.product_id,
      name: row.name || row.product_name,
      price: row.is_gift_package ? (row.package_price || 0) : (row.price || getSmallestPrice(row.sizes || [])),
      image: (row.images && row.images.length > 0) ? row.images[0] : (row.image || "/placeholder.svg"),
      category: row.category,
      rating: parseFloat(row.rating) || 0,
      isNew: row.is_new || false,
      isBestseller: row.is_bestseller || false,
      sizes: row.is_gift_package ? [] : transformSizes(row.sizes || []),
      isGiftPackage: row.is_gift_package || false,
      packagePrice: row.package_price ? parseFloat(row.package_price) : 0,
      packageOriginalPrice: row.package_original_price ? parseFloat(row.package_original_price) : 0,
    }));

    return NextResponse.json(transformedProducts);
  } catch (err) {
    console.error("Database error:", err);
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  console.log("Favorites API - POST Request Received");

  // Auth check
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return errorResponse("Authorization required", 401);
  }

  const token = authHeader.replace("Bearer ", "");
  let decoded: { userId: string };
  
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
  } catch (err) {
    return errorResponse("Invalid or expired token", 401);
  }

  try {
    const body = await request.json();
    const { productId, name, price, image, category, rating, isNew, isBestseller, isGiftPackage, packagePrice, packageOriginalPrice, sizes } = body;
    
    if (!productId) {
      return errorResponse("productId required", 400);
    }

    // Check if already in favorites
    const existing = await pool.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND product_id = $2',
      [decoded.userId, productId]
    );

    if (existing.rows.length > 0) {
      console.log(`Product ${productId} already in favorites`);
      return NextResponse.json({ success: true });
    }

    // Add to favorites
    await pool.query(`
      INSERT INTO favorites (
        user_id, product_id, product_name, price, image, category, rating,
        is_new, is_bestseller, is_gift_package, package_price, package_original_price, sizes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      decoded.userId, productId, name, price, image, category, rating || 0,
      isNew || false, isBestseller || false, isGiftPackage || false,
      packagePrice || null, packageOriginalPrice || null, JSON.stringify(sizes || [])
    ]);

    console.log(`Added product ${productId} to favorites`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error in POST favorites:", err);
    return errorResponse("Internal server error", 500);
  }
}

export async function DELETE(request: NextRequest) {
  console.log("Favorites API - DELETE Request Received");

  // Auth check
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return errorResponse("Authorization required", 401);
  }

  const token = authHeader.replace("Bearer ", "");
  let decoded: { userId: string };
  
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
  } catch (err) {
    return errorResponse("Invalid or expired token", 401);
  }

  try {
    const { productId } = await request.json();
    if (!productId) {
      return errorResponse("productId required", 400);
    }

    await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND product_id = $2',
      [decoded.userId, productId]
    );
    
    console.log(`Removed product ${productId} from favorites`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error in DELETE favorites:", err);
    return errorResponse("Internal server error", 500);
  }
}
