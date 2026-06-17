# Step 7: Update API Routes - Complete Guide

## Overview
You need to update 29 API route files to use PostgreSQL instead of MongoDB.

## Quick Conversion Rules

### 1. Import Changes
```typescript
// ❌ Remove these imports
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// ✅ Add this import
import pool from "@/lib/postgresql"
```

### 2. Field Name Changes (camelCase → snake_case)
| MongoDB | PostgreSQL |
|---------|-----------|
| `isActive` | `is_active` |
| `isNew` | `is_new` |
| `isBestseller` | `is_bestseller` |
| `isGiftPackage` | `is_gift_package` |
| `packagePrice` | `package_price` |
| `packageOriginalPrice` | `package_original_price` |
| `longDescription` | `long_description` |
| `createdAt` | `created_at` |
| `updatedAt` | `updated_at` |

### 3. Query Conversion Examples

#### Find All
```typescript
// ❌ MongoDB
const db = await getDatabase()
const products = await db.collection("products").find({ isActive: true }).toArray()

// ✅ PostgreSQL
const result = await pool.query('SELECT * FROM products WHERE is_active = $1', [true])
const products = result.rows
```

#### Find One by ID
```typescript
// ❌ MongoDB
const product = await db.collection("products").findOne({ id: productId })

// ✅ PostgreSQL
const result = await pool.query('SELECT * FROM products WHERE id = $1', [productId])
const product = result.rows[0]
```

#### Insert
```typescript
// ❌ MongoDB
await db.collection("products").insertOne({
  id: "prod-1",
  name: "Product",
  isActive: true
})

// ✅ PostgreSQL
await pool.query(
  'INSERT INTO products (id, name, is_active) VALUES ($1, $2, $3)',
  ["prod-1", "Product", true]
)
```

#### Update
```typescript
// ❌ MongoDB
await db.collection("products").updateOne(
  { id: productId },
  { $set: { name: "New Name", isActive: false } }
)

// ✅ PostgreSQL
await pool.query(
  'UPDATE products SET name = $1, is_active = $2 WHERE id = $3',
  ["New Name", false, productId]
)
```

#### Delete (Soft Delete)
```typescript
// ❌ MongoDB
await db.collection("products").updateOne(
  { id: productId },
  { $set: { isActive: false } }
)

// ✅ PostgreSQL
await pool.query('UPDATE products SET is_active = false WHERE id = $1', [productId])
```

#### Count
```typescript
// ❌ MongoDB
const count = await db.collection("products").countDocuments({ isActive: true })

// ✅ PostgreSQL
const result = await pool.query('SELECT COUNT(*) FROM products WHERE is_active = $1', [true])
const count = parseInt(result.rows[0].count)
```

## Files to Update (Priority Order)

### High Priority (Core functionality)
1. ✅ `app/api/products/route.ts` - Product listing/CRUD
2. ⬜ `app/api/orders/route.ts` - Order creation
3. ⬜ `app/api/auth/login/route.ts` - User login
4. ⬜ `app/api/auth/register/route.ts` - User registration
5. ⬜ `app/api/favorites/route.ts` - User favorites

### Medium Priority
6. ⬜ `app/api/products/[category]/[productId]/route.ts` - Single product
7. ⬜ `app/api/orders/[orderId]/route.ts` - Order details
8. ⬜ `app/api/reviews/route.ts` - Reviews listing
9. ⬜ `app/api/reviews/add/route.ts` - Add review
10. ⬜ `app/api/discount-codes/validate/route.ts` - Validate discount

### Lower Priority
11. ⬜ `app/api/auth/me/route.ts`
12. ⬜ `app/api/auth/update-profile/route.ts`
13. ⬜ `app/api/auth/forgot-password/route.ts`
14. ⬜ `app/api/auth/reset-password/route.ts`
15. ⬜ `app/api/auth/verify/route.ts`
16. ⬜ `app/api/auth/refresh/route.ts`
17. ⬜ `app/api/admin/orders/[orderId]/route.ts`
18. ⬜ `app/api/reviews/product/[id]/route.ts`
19. ⬜ `app/api/reviews/recalculate/route.ts`
20. ⬜ `app/api/discount-codes/route.ts`
21. ⬜ `app/api/offers/route.ts`
22. ⬜ `app/api/contact/route.ts`
23. ⬜ `app/api/test-db/route.ts`
24. ⬜ `app/api/test-functionality/route.ts`
25. ⬜ `app/api/send-offer-email/route.ts`
26. ⬜ `app/api/send-order-confirmation/route.ts`
27. ⬜ `app/api/send-order-update/route.ts`
28. ⬜ `app/api/send-review-reminder/route.ts`
29. ⬜ `app/api/send-welcome-email/route.ts`

## Step-by-Step Process

### For Each File:

1. **Open the file**
2. **Change imports:**
   - Remove: `import { getDatabase } from "@/lib/mongodb"`
   - Remove: `import { ObjectId } from "mongodb"`
   - Add: `import pool from "@/lib/postgresql"`

3. **Find all database operations:**
   - Search for: `await getDatabase()`
   - Search for: `db.collection(`
   - Search for: `.find(`, `.findOne(`, `.insertOne(`, `.updateOne(`, `.deleteOne(`

4. **Convert each operation using the patterns above**

5. **Update field names:**
   - camelCase → snake_case (see table above)

6. **Test the endpoint**

## Common Patterns

### Pattern 1: Get with Join (Product + Sizes)
```typescript
const result = await pool.query(`
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
  WHERE p.id = $1
  GROUP BY p.id
`, [productId])
```

### Pattern 2: Transaction (Multiple Operations)
```typescript
const client = await pool.connect()
try {
  await client.query('BEGIN')
  
  // Operation 1
  await client.query('INSERT INTO orders (...) VALUES (...)', [...])
  
  // Operation 2
  await client.query('INSERT INTO order_items (...) VALUES (...)', [...])
  
  await client.query('COMMIT')
} catch (error) {
  await client.query('ROLLBACK')
  throw error
} finally {
  client.release()
}
```

### Pattern 3: Pagination
```typescript
const limit = 20
const offset = (page - 1) * limit

const [dataResult, countResult] = await Promise.all([
  pool.query('SELECT * FROM products LIMIT $1 OFFSET $2', [limit, offset]),
  pool.query('SELECT COUNT(*) FROM products')
])

const products = dataResult.rows
const total = parseInt(countResult.rows[0].count)
```

## Testing Each Route

After updating a route, test it:

```bash
# Start dev server
npm run dev

# Test with curl or browser
curl http://localhost:3000/api/products
curl http://localhost:3000/api/products?id=some-product-id
```

## Need Help?

- Check `SQL_QUICK_REFERENCE.md` for more query examples
- Check `app/api/products/route.postgresql.example.ts` for full example
- PostgreSQL docs: https://node-postgres.com/
