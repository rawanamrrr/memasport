# MongoDB to PostgreSQL Migration - Summary

## ✅ What Has Been Done

### 1. Created PostgreSQL Connection File
- **File:** `lib/postgresql.ts`
- Replaces `lib/mongodb.ts`
- Uses `pg` library for PostgreSQL connections
- Includes connection pooling and error handling

### 2. Created Database Schema
- **File:** `lib/schema.sql`
- Complete database schema with all tables:
  - `users` - User accounts and authentication
  - `products` - Product catalog
  - `product_sizes` - Product size variations
  - `gift_package_sizes` - Gift package configurations
  - `orders` - Customer orders
  - `order_items` - Order line items
  - `reviews` - Product reviews
  - `favorites` - User favorites
  - `discount_codes` - Promotional codes
  - `contact_messages` - Contact form submissions
- Includes indexes for performance
- Auto-updating timestamps with triggers

### 3. Updated Dependencies
- **File:** `package.json`
- ✅ Added: `pg` (PostgreSQL client)
- ✅ Added: `@types/pg` (TypeScript types)
- ❌ Removed: `mongodb`
- ❌ Removed: `mongodb-client-encryption`
- ❌ Removed: `kerberos`
- ❌ Removed: `snappy`
- ❌ Removed: `socks`
- ❌ Removed: `@mongodb-js/zstd`

### 4. Created Configuration Files
- **File:** `.env.example` - Environment variable template
- **File:** `POSTGRESQL_MIGRATION_GUIDE.md` - Detailed migration instructions
- **File:** `route.postgresql.example.ts` - Example API route conversion

## 📋 What You Need To Do

### Step 1: Install PostgreSQL (5-10 minutes)
```bash
# Download from: https://www.postgresql.org/download/
# Windows: Use the installer, set a password for 'postgres' user
# Default port: 5432
```

### Step 2: Create Database (2 minutes)
```bash
# Option A: Using psql command line
psql -U postgres
CREATE DATABASE mema_sports;
\q

# Option B: Use pgAdmin GUI (included with PostgreSQL)
# Right-click Databases → Create → Database → Name: mema_sports
```

### Step 3: Run Database Schema (2 minutes)
```bash
# Navigate to project folder
cd c:\Users\rawan\Downloads\mema

# Run schema file
psql -U postgres -d mema_sports -f lib/schema.sql
```

### Step 4: Install Node Dependencies (2-3 minutes)
```bash
# Remove old dependencies
rm -rf node_modules package-lock.json

# Install new dependencies (this will install pg and remove mongodb)
npm install
```

### Step 5: Configure Environment (1 minute)
```bash
# Copy example to .env.local
copy .env.example .env.local

# Edit .env.local and set:
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/mema_sports
```
Replace `YOUR_PASSWORD` with your PostgreSQL password.

### Step 6: Delete MongoDB File (1 minute)
```bash
del lib\mongodb.ts
```

### Step 7: Update API Routes
You need to update all API route files to use PostgreSQL instead of MongoDB.

**Files to update:** (29 files in `app/api/`)
- `app/api/products/route.ts`
- `app/api/orders/route.ts`
- `app/api/auth/login/route.ts`
- `app/api/auth/register/route.ts`
- `app/api/favorites/route.ts`
- `app/api/reviews/route.ts`
- And 23 more files...

**Reference:** See `app/api/products/route.postgresql.example.ts` for conversion pattern.

### Step 8: Test (2 minutes)
```bash
npm run dev
# Visit http://localhost:3000
```

## 🔄 API Route Conversion Pattern

### Before (MongoDB):
```typescript
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

const db = await getDatabase()
const products = await db.collection("products")
  .find({ isActive: true })
  .toArray()
```

### After (PostgreSQL):
```typescript
import pool from "@/lib/postgresql"

const result = await pool.query(
  'SELECT * FROM products WHERE is_active = $1',
  [true]
)
const products = result.rows
```

## 📊 Database Field Name Changes

MongoDB uses camelCase, PostgreSQL uses snake_case:

| MongoDB | PostgreSQL |
|---------|-----------|
| `isActive` | `is_active` |
| `isNew` | `is_new` |
| `isBestseller` | `is_bestseller` |
| `isGiftPackage` | `is_gift_package` |
| `packagePrice` | `package_price` |
| `longDescription` | `long_description` |
| `createdAt` | `created_at` |
| `updatedAt` | `updated_at` |

## 🚀 Deployment Options

### Free PostgreSQL Hosting:
1. **Neon** (https://neon.tech) - Recommended, serverless
2. **Supabase** (https://supabase.com) - Includes auth & storage
3. **ElephantSQL** (https://www.elephantsql.com) - 20MB free
4. **Railway** (https://railway.app) - Free tier

### Production:
1. **Neon** - Serverless PostgreSQL
2. **AWS RDS** - Managed PostgreSQL
3. **Digital Ocean** - Managed Databases

## ⚠️ Important Notes

1. **TypeScript Errors:** The `pg` module errors will disappear after running `npm install`

2. **Data Migration:** If you have existing data in MongoDB, you'll need to export it and import to PostgreSQL

3. **IDs:** PostgreSQL uses UUIDs instead of MongoDB ObjectIds
   - Products use custom string IDs (same as before)
   - Users, Orders, Reviews use UUID v4

4. **Arrays:** PostgreSQL handles arrays differently
   - Images: `TEXT[]` array type
   - Notes: `JSONB` for complex objects

5. **Transactions:** PostgreSQL supports ACID transactions (better than MongoDB)

## 📚 Resources

- **Migration Guide:** `POSTGRESQL_MIGRATION_GUIDE.md`
- **Example Route:** `app/api/products/route.postgresql.example.ts`
- **Schema:** `lib/schema.sql`
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **node-postgres Docs:** https://node-postgres.com/

## 🆘 Need Help?

Common issues and solutions are in `POSTGRESQL_MIGRATION_GUIDE.md`

The lint errors you see are expected until you run `npm install` to get the `pg` package and its types.
