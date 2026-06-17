require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function setupOffersTable() {
  try {
    console.log('🔧 Setting up offers table...')
    
    // Create the offers table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS offers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        discount_code VARCHAR(50),
        is_active BOOLEAN DEFAULT true,
        priority INTEGER DEFAULT 0,
        expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)
    
    console.log('✅ Offers table created successfully')
    
    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_offers_active ON offers(is_active);
    `)
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_offers_priority ON offers(priority DESC);
    `)
    
    console.log('✅ Indexes created successfully')
    
    // Check if there are any offers
    const result = await pool.query('SELECT COUNT(*) FROM offers')
    console.log(`📊 Current offers in database: ${result.rows[0].count}`)
    
    // If no offers exist, create a sample one
    if (result.rows[0].count === '0') {
      console.log('📝 Creating sample offer...')
      await pool.query(`
        INSERT INTO offers (title, description, discount_code, is_active, priority)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        'Welcome Offer - 20% OFF',
        'Get 20% off your first order! Use code WELCOME20 at checkout.',
        'WELCOME20',
        true,
        10
      ])
      console.log('✅ Sample offer created')
    }
    
    console.log('🎉 Setup completed successfully!')
    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error setting up offers table:', error)
    await pool.end()
    process.exit(1)
  }
}

setupOffersTable()
