# PostgreSQL Migration Guide

This guide will help you migrate from MongoDB to PostgreSQL for your Mema Sports application.

## Prerequisites

1. **PostgreSQL Installation**
   - Download and install PostgreSQL from: https://www.postgresql.org/download/
   - For Windows: Use the installer and remember the password you set for the `postgres` user
   - Default port: 5432

2. **pgAdmin (Optional but Recommended)**
   - Comes with PostgreSQL installer
   - Provides a GUI to manage your databases

## Step 1: Install PostgreSQL

### Windows Installation:
1. Download PostgreSQL installer from https://www.postgresql.org/download/windows/
2. Run the installer
3. Set a password for the `postgres` superuser (remember this!)
4. Keep default port 5432
5. Install pgAdmin 4 (included in installer)

### Verify Installation:
Open Command Prompt and run:
```bash
psql --version
```

## Step 2: Create Database

### Option A: Using pgAdmin (GUI)
1. Open pgAdmin 4
2. Connect to PostgreSQL server (use the password you set)
3. Right-click on "Databases" → "Create" → "Database"
4. Name it: `mema_sports`
5. Click "Save"

### Option B: Using Command Line
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE mema_sports;

# Exit
\q
```

## Step 3: Run Database Schema

### Using psql command line:
```bash
# Navigate to your project directory
cd c:\Users\rawan\Downloads\mema

# Run the schema file
psql -U postgres -d mema_sports -f lib/schema.sql
```

### Using pgAdmin:
1. Open pgAdmin
2. Navigate to: Servers → PostgreSQL → Databases → mema_sports
3. Click "Query Tool" (lightning bolt icon)
4. Open the file `lib/schema.sql`
5. Click "Execute" (play button)

## Step 4: Install Dependencies

```bash
# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Install new dependencies
npm install
```

This will install:
- `pg` (PostgreSQL client for Node.js)
- `@types/pg` (TypeScript types)

And remove:
- `mongodb`
- `mongodb-client-encryption`
- `kerberos`
- `snappy`
- `socks`
- `@mongodb-js/zstd`

## Step 5: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
```bash
copy .env.example .env.local
```

2. Edit `.env.local` and update the DATABASE_URL:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/mema_sports
```

Replace `YOUR_PASSWORD` with the password you set during PostgreSQL installation.

## Step 6: Delete MongoDB Files

```bash
# Delete the MongoDB connection file
del lib\mongodb.ts
```

## Step 7: Update API Routes

All API routes need to be updated to use PostgreSQL instead of MongoDB. Here's a sample conversion:

### Before (MongoDB):
```typescript
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

const db = await getDatabase()
const products = await db.collection("products").find({}).toArray()
```

### After (PostgreSQL):
```typescript
import pool from "@/lib/postgresql"

const result = await pool.query('SELECT * FROM products WHERE is_active = $1', [true])
const products = result.rows
```

## Step 8: Test Connection

Create a test API route or run:

```bash
npm run dev
```

Then visit: http://localhost:3000/api/test-db

## Step 9: Data Migration (If you have existing data)

If you have data in MongoDB that you want to migrate:

1. **Export from MongoDB:**
```bash
mongoexport --db=mema_sports --collection=products --out=products.json
```

2. **Convert and Import to PostgreSQL:**
You'll need to write a migration script to convert MongoDB documents to PostgreSQL rows.

## Connection String Format

```
postgresql://[user]:[password]@[host]:[port]/[database]
```

Examples:
- Local: `postgresql://postgres:password123@localhost:5432/mema_sports`
- Remote: `postgresql://user:pass@db.example.com:5432/mema_sports`
- With SSL: `postgresql://user:pass@db.example.com:5432/mema_sports?sslmode=require`

## Common Issues & Solutions

### Issue: "password authentication failed"
**Solution:** Check your password in the DATABASE_URL

### Issue: "database does not exist"
**Solution:** Create the database first (Step 2)

### Issue: "relation does not exist"
**Solution:** Run the schema.sql file (Step 3)

### Issue: Port 5432 already in use
**Solution:** Another PostgreSQL instance is running. Stop it or use a different port.

## Hosting Options

### Free PostgreSQL Hosting:
1. **Neon** - https://neon.tech (Recommended, generous free tier)
2. **Supabase** - https://supabase.com (Includes auth and storage)
3. **ElephantSQL** - https://www.elephantsql.com (20MB free)
4. **Railway** - https://railway.app (Free tier available)

### For Production:
1. **Neon** - Serverless PostgreSQL
2. **AWS RDS** - Managed PostgreSQL
3. **Digital Ocean** - Managed Databases
4. **Heroku Postgres** - Easy deployment

## Next Steps

1. Update all API routes to use PostgreSQL queries
2. Test each endpoint thoroughly
3. Migrate your data (if any)
4. Deploy to production with a hosted PostgreSQL instance

## Need Help?

- PostgreSQL Documentation: https://www.postgresql.org/docs/
- pg (node-postgres) Documentation: https://node-postgres.com/
- SQL Tutorial: https://www.postgresql.org/docs/current/tutorial.html
