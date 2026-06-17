import { Pool, type PoolClient } from 'pg'

if (!process.env.DATABASE_URL) {
  throw new Error('Invalid/Missing environment variable: "DATABASE_URL"')
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

// Handle pool errors
pool.on('error', (err) => {
  console.error('❌ [PostgreSQL] Unexpected error on idle client', err)
})

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
