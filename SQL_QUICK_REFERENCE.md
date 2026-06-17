# PostgreSQL Quick Reference for Mema Sports

## Common Query Patterns

### 1. Get All Products
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
  WHERE p.is_active = true
  GROUP BY p.id
  ORDER BY p.created_at DESC
`)
const products = result.rows
```

### 2. Get Product by ID
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
         ) as sizes
  FROM products p
  LEFT JOIN product_sizes ps ON p.id = ps.product_id
  WHERE p.id = $1
  GROUP BY p.id
`, [productId])

const product = result.rows[0]
```

### 3. Get Products by Category
```typescript
const result = await pool.query(`
  SELECT * FROM products 
  WHERE is_active = true AND category = $1
  ORDER BY created_at DESC
`, [category])
```

### 4. Insert Product with Sizes
```typescript
const client = await pool.connect()
try {
  await client.query('BEGIN')
  
  // Insert product
  await client.query(`
    INSERT INTO products (id, name, description, images, category, is_active)
    VALUES ($1, $2, $3, $4, $5, $6)
  `, [id, name, description, images, category, true])
  
  // Insert sizes
  for (const size of sizes) {
    await client.query(`
      INSERT INTO product_sizes (product_id, size, volume, original_price)
      VALUES ($1, $2, $3, $4)
    `, [id, size.size, size.volume, size.originalPrice])
  }
  
  await client.query('COMMIT')
} catch (error) {
  await client.query('ROLLBACK')
  throw error
} finally {
  client.release()
}
```

### 5. Update Product
```typescript
await pool.query(`
  UPDATE products 
  SET name = $1, description = $2, is_active = $3
  WHERE id = $4
`, [name, description, isActive, productId])
```

### 6. Delete Product (Soft Delete)
```typescript
await pool.query(`
  UPDATE products SET is_active = false WHERE id = $1
`, [productId])
```

### 7. Create Order with Items
```typescript
const client = await pool.connect()
try {
  await client.query('BEGIN')
  
  // Insert order
  const orderResult = await client.query(`
    INSERT INTO orders (
      order_number, customer_name, customer_email, customer_phone,
      shipping_address, subtotal, total, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id
  `, [orderNumber, name, email, phone, address, subtotal, total, 'pending'])
  
  const orderId = orderResult.rows[0].id
  
  // Insert order items
  for (const item of items) {
    await client.query(`
      INSERT INTO order_items (
        order_id, product_id, product_name, size, price, quantity
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [orderId, item.productId, item.name, item.size, item.price, item.quantity])
  }
  
  await client.query('COMMIT')
  return orderId
} catch (error) {
  await client.query('ROLLBACK')
  throw error
} finally {
  client.release()
}
```

### 8. Get User Orders
```typescript
const result = await pool.query(`
  SELECT o.*, 
         json_agg(
           json_build_object(
             'productName', oi.product_name,
             'size', oi.size,
             'price', oi.price,
             'quantity', oi.quantity
           )
         ) as items
  FROM orders o
  LEFT JOIN order_items oi ON o.id = oi.order_id
  WHERE o.user_id = $1
  GROUP BY o.id
  ORDER BY o.created_at DESC
`, [userId])
```

### 9. Add to Favorites
```typescript
await pool.query(`
  INSERT INTO favorites (
    user_id, product_id, product_name, price, image, category
  ) VALUES ($1, $2, $3, $4, $5, $6)
  ON CONFLICT (user_id, product_id) DO NOTHING
`, [userId, productId, name, price, image, category])
```

### 10. Remove from Favorites
```typescript
await pool.query(`
  DELETE FROM favorites 
  WHERE user_id = $1 AND product_id = $2
`, [userId, productId])
```

### 11. Get User Favorites
```typescript
const result = await pool.query(`
  SELECT * FROM favorites 
  WHERE user_id = $1
  ORDER BY created_at DESC
`, [userId])
```

### 12. Create Review
```typescript
const client = await pool.connect()
try {
  await client.query('BEGIN')
  
  // Insert review
  await client.query(`
    INSERT INTO reviews (
      product_id, order_id, user_id, customer_name, 
      customer_email, rating, comment
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
  `, [productId, orderId, userId, name, email, rating, comment])
  
  // Update product rating
  const avgResult = await client.query(`
    SELECT AVG(rating) as avg_rating, COUNT(*) as review_count
    FROM reviews
    WHERE product_id = $1
  `, [productId])
  
  await client.query(`
    UPDATE products 
    SET rating = $1, reviews = $2
    WHERE id = $3
  `, [avgResult.rows[0].avg_rating, avgResult.rows[0].review_count, productId])
  
  await client.query('COMMIT')
} catch (error) {
  await client.query('ROLLBACK')
  throw error
} finally {
  client.release()
}
```

### 13. User Authentication - Register
```typescript
const result = await pool.query(`
  INSERT INTO users (email, password, name, role)
  VALUES ($1, $2, $3, $4)
  RETURNING id, email, name, role
`, [email, hashedPassword, name, 'user'])

const user = result.rows[0]
```

### 14. User Authentication - Login
```typescript
const result = await pool.query(`
  SELECT * FROM users WHERE email = $1
`, [email])

if (result.rows.length === 0) {
  throw new Error('User not found')
}

const user = result.rows[0]
// Verify password with bcrypt
```

### 15. Validate Discount Code
```typescript
const result = await pool.query(`
  SELECT * FROM discount_codes 
  WHERE code = $1 
    AND is_active = true
    AND (valid_from IS NULL OR valid_from <= NOW())
    AND (valid_until IS NULL OR valid_until >= NOW())
    AND (usage_limit IS NULL OR usage_count < usage_limit)
`, [code])

if (result.rows.length === 0) {
  throw new Error('Invalid or expired discount code')
}

const discount = result.rows[0]
```

### 16. Pagination
```typescript
const page = 1
const limit = 20
const offset = (page - 1) * limit

const [dataResult, countResult] = await Promise.all([
  pool.query(`
    SELECT * FROM products 
    WHERE is_active = true
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `, [limit, offset]),
  
  pool.query(`
    SELECT COUNT(*) FROM products WHERE is_active = true
  `)
])

const products = dataResult.rows
const total = parseInt(countResult.rows[0].count)
const totalPages = Math.ceil(total / limit)
```

### 17. Search Products
```typescript
const result = await pool.query(`
  SELECT * FROM products 
  WHERE is_active = true
    AND (
      name ILIKE $1 
      OR description ILIKE $1
    )
  ORDER BY created_at DESC
`, [`%${searchTerm}%`])
```

### 18. Get Bestsellers
```typescript
const result = await pool.query(`
  SELECT * FROM products 
  WHERE is_active = true AND is_bestseller = true
  ORDER BY created_at DESC
  LIMIT 10
`)
```

### 19. Get New Products
```typescript
const result = await pool.query(`
  SELECT * FROM products 
  WHERE is_active = true AND is_new = true
  ORDER BY created_at DESC
  LIMIT 10
`)
```

### 20. Update Order Status
```typescript
await pool.query(`
  UPDATE orders 
  SET status = $1
  WHERE id = $2
`, [newStatus, orderId])
```

## Parameter Placeholders

PostgreSQL uses `$1`, `$2`, `$3` etc. for parameters (NOT `?` like MySQL)

```typescript
// ✅ Correct
pool.query('SELECT * FROM products WHERE id = $1 AND category = $2', [id, category])

// ❌ Wrong
pool.query('SELECT * FROM products WHERE id = ? AND category = ?', [id, category])
```

## Field Naming Convention

| JavaScript (camelCase) | PostgreSQL (snake_case) |
|------------------------|-------------------------|
| `isActive` | `is_active` |
| `createdAt` | `created_at` |
| `updatedAt` | `updated_at` |
| `productId` | `product_id` |
| `userId` | `user_id` |
| `orderId` | `order_id` |

## JSON Aggregation

PostgreSQL can aggregate related data into JSON:

```typescript
// Get product with sizes as JSON array
const result = await pool.query(`
  SELECT p.*, 
         json_agg(ps.*) as sizes
  FROM products p
  LEFT JOIN product_sizes ps ON p.id = ps.product_id
  WHERE p.id = $1
  GROUP BY p.id
`, [productId])
```

## Transactions

Always use transactions for multi-step operations:

```typescript
const client = await pool.connect()
try {
  await client.query('BEGIN')
  // ... multiple queries
  await client.query('COMMIT')
} catch (error) {
  await client.query('ROLLBACK')
  throw error
} finally {
  client.release() // Always release!
}
```

## Connection Pool

```typescript
import pool from "@/lib/postgresql"

// Simple query
const result = await pool.query('SELECT * FROM products')

// With parameters
const result = await pool.query('SELECT * FROM products WHERE id = $1', [id])

// Transaction (get client first)
const client = await pool.connect()
try {
  // use client.query() instead of pool.query()
} finally {
  client.release()
}
```
