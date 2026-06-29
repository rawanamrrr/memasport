import { Pool, type PoolClient } from 'pg'

if (!process.env.DATABASE_URL) {
  throw new Error('Invalid/Missing environment variable: "DATABASE_URL"')
}

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined
}

function createPool() {
  const p = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Supabase's shared transaction pooler caps concurrent backend connections
    // per project (commonly ~15 on free tier). Keep our client pool comfortably
    // under that so bursts of parallel requests queue briefly instead of
    // timing out trying to open more sockets than the pooler will accept.
    max: 8,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
    // Keep sockets warm so we avoid paying connection setup on every request.
    keepAlive: true,
  })
  p.on('error', (err) => {
    console.error('❌ [PostgreSQL] Unexpected error on idle client', err)
  })
  return p
}

// Reuse a single pool across hot reloads in dev and across warm invocations,
// instead of opening a fresh connection storm on every reload/request.
const pool = global._pgPool ?? createPool()
if (process.env.NODE_ENV !== 'production') {
  global._pgPool = pool
}

export default pool

export async function getDatabase(): Promise<PoolClient> {
  try {
    const client = await pool.connect()
    return client
  } catch (error) {
    console.error('❌ [PostgreSQL] Database connection failed:', error)
    throw error
  }
}

export async function query(text: string, params?: any[]) {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('✅ [PostgreSQL] Query executed', { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error('❌ [PostgreSQL] Query error:', error)
    throw error
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    console.log('🧪 [PostgreSQL] Testing database connection...')
    const client = await pool.connect()
    
    // Test basic query
    const result = await client.query('SELECT NOW()')
    console.log('✅ [PostgreSQL] Connection test successful:', result.rows[0])
    
    // Test product count
    const productCount = await client.query('SELECT COUNT(*) FROM products')
    console.log('🧴 [PostgreSQL] Products in database:', productCount.rows[0].count)
    
    // Test order count
    const orderCount = await client.query('SELECT COUNT(*) FROM orders')
    console.log('📦 [PostgreSQL] Orders in database:', orderCount.rows[0].count)
    
    client.release()
    return true
  } catch (error) {
    console.error('❌ [PostgreSQL] Connection test failed:', error)
    return false
  }
}
