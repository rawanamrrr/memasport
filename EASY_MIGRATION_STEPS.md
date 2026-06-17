# Easy Step-by-Step Migration Guide

## The Simplest Approach

Since you have 29 files to update, here's the EASIEST way to do Step 7:

### Option 1: Start Fresh (Recommended for Learning)

For now, let's just get the site running with minimal data:

1. **Create a few test products manually in PostgreSQL:**

```sql
-- Connect to your database
psql -U postgres -d mema_sports

-- Insert a test product
INSERT INTO products (id, name, description, long_description, images, category, is_active, rating, reviews)
VALUES (
  'test-product-1',
  'Test Product',
  'This is a test product',
  'Long description here',
  ARRAY['/placeholder.svg'],
  'equipment',
  true,
  4.5,
  10
);

-- Insert product sizes
INSERT INTO product_sizes (product_id, size, volume, original_price, discounted_price)
VALUES 
  ('test-product-1', 'Small', '50ml', 299.00, 249.00),
  ('test-product-1', 'Medium', '100ml', 499.00, 399.00);

-- Check it worked
SELECT * FROM products;
SELECT * FROM product_sizes;
```

2. **For now, comment out the API routes you don't need immediately**

The site will work with just:
- Products listing (GET)
- You can add products later through SQL

### Option 2: Use a Migration Script (I'll create this for you)

Let me create a simple Node.js script that will help you convert the routes semi-automatically.

### Option 3: Hire Help or Use AI Tools

Since this is 29 files and quite complex, you could:
1. Use ChatGPT/Claude to convert each file (paste the file, ask it to convert to PostgreSQL)
2. Hire a developer on Fiverr/Upwork for a few hours
3. Do it gradually - convert one route per day

## What I Recommend RIGHT NOW

Let's get your site working with a MINIMAL conversion:

### Step A: Create Simple Test Data

Run this SQL to add some products:

```sql
-- Product 1
INSERT INTO products (id, name, description, images, category, is_active, is_new, is_bestseller)
VALUES ('prod-1', 'Sports Equipment Set', 'Professional grade equipment', ARRAY['/placeholder-sports-equipment.jpg'], 'equipment', true, true, false);

INSERT INTO product_sizes (product_id, size, volume, original_price)
VALUES ('prod-1', 'Standard', 'Full Set', 1500.00);

-- Product 2
INSERT INTO products (id, name, description, images, category, is_active, is_new, is_bestseller)
VALUES ('prod-2', 'Athletic Apparel', 'High-performance wear', ARRAY['/placeholder-sports-apparel.jpg'], 'apparel', true, false, true);

INSERT INTO product_sizes (product_id, size, volume, original_price)
VALUES ('prod-2', 'Medium', 'M', 500.00);

-- Product 3
INSERT INTO products (id, name, description, images, category, is_active)
VALUES ('prod-3', 'Training Accessories', 'Essential accessories', ARRAY['/placeholder-sports-accessories.jpg'], 'accessories', true);

INSERT INTO product_sizes (product_id, size, volume, original_price, discounted_price)
VALUES ('prod-3', 'One Size', 'Standard', 300.00, 250.00);

-- Product 4
INSERT INTO products (id, name, description, images, category, is_active)
VALUES ('prod-4', 'Outlet Deal', 'Special offer', ARRAY['/placeholder-sports-outlet.jpg'], 'outlet', true);

INSERT INTO product_sizes (product_id, size, volume, original_price, discounted_price)
VALUES ('prod-4', 'Various', 'Mixed', 800.00, 400.00);
```

### Step B: Create a MINIMAL Products API

I'll create a super simple version that just does GET (read products):

```typescript
// app/api/products/route.ts
import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/postgresql"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const category = searchParams.get("category")

    // Single product
    if (id) {
      const result = await pool.query(`
        SELECT p.*, 
               json_agg(
                 json_build_object(
                   'size', ps.size,
                   'volume', ps.volume,
                   'originalPrice', ps.original_price,
                   'discountedPrice', ps.discounted_price
                 )
               ) as sizes
        FROM products p
        LEFT JOIN product_sizes ps ON p.id = ps.product_id
        WHERE p.id = $1
        GROUP BY p.id
      `, [id])

      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 })
      }

      // Convert snake_case to camelCase for frontend
      const product = {
        ...result.rows[0],
        isActive: result.rows[0].is_active,
        isNew: result.rows[0].is_new,
        isBestseller: result.rows[0].is_bestseller,
        isGiftPackage: result.rows[0].is_gift_package,
        longDescription: result.rows[0].long_description,
        createdAt: result.rows[0].created_at,
      }

      return NextResponse.json(product)
    }

    // List products
    let query = `
      SELECT p.*, 
             json_agg(
               json_build_object(
                 'size', ps.size,
                 'volume', ps.volume,
                 'originalPrice', ps.original_price,
                 'discountedPrice', ps.discounted_price
               )
             ) FILTER (WHERE ps.id IS NOT NULL) as sizes
      FROM products p
      LEFT JOIN product_sizes ps ON p.id = ps.product_id
      WHERE p.is_active = true
    `
    
    const params: any[] = []
    
    if (category) {
      params.push(category)
      query += ` AND p.category = $${params.length}`
    }

    query += ` GROUP BY p.id ORDER BY p.created_at DESC`

    const result = await pool.query(query, params)

    // Convert snake_case to camelCase
    const products = result.rows.map(row => ({
      ...row,
      isActive: row.is_active,
      isNew: row.is_new,
      isBestseller: row.is_bestseller,
      isGiftPackage: row.is_gift_package,
      longDescription: row.long_description,
      createdAt: row.created_at,
    }))

    return NextResponse.json(products)

  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// For now, disable POST, PUT, DELETE - you can add products via SQL
export async function POST() {
  return NextResponse.json({ error: "Not implemented yet" }, { status: 501 })
}

export async function PUT() {
  return NextResponse.json({ error: "Not implemented yet" }, { status: 501 })
}

export async function DELETE() {
  return NextResponse.json({ error: "Not implemented yet" }, { status: 501 })
}
```

### Step C: Test It

```bash
npm run dev

# Visit:
http://localhost:3000
http://localhost:3000/products
```

## After This Works

Once you see products showing up, you can gradually add more functionality:

1. **Week 1:** Get products showing (done above)
2. **Week 2:** Add orders functionality
3. **Week 3:** Add user authentication
4. **Week 4:** Add reviews, favorites, etc.

## Do You Want Me To:

1. ✅ Create the minimal products route above?
2. ✅ Create SQL to add test products?
3. ✅ Show you how to convert one more route as an example?

Just tell me which one and I'll do it for you right now!

## Quick Decision Matrix

| Your Situation | Recommended Action |
|----------------|-------------------|
| "I just want it working NOW" | Use Option 1 - Add test data via SQL, use minimal API |
| "I want to learn" | Convert 1-2 routes per day, starting with products |
| "I have budget" | Hire someone on Fiverr for $50-100 to convert all routes |
| "I have time" | Follow STEP_7_GUIDE.md and convert all 29 files |

What do you want to do?
