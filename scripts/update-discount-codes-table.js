require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function updateDiscountCodesTable() {
  try {
    console.log('🔧 Updating discount_codes table...')
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'update-discount-codes-table.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    // Execute the SQL
    await pool.query(sql)
    
    console.log('✅ Discount codes table updated successfully')
    
    // Verify the table structure
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'discount_codes'
      ORDER BY ordinal_position
    `)
    
    console.log('📊 Table structure:')
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`)
    })
    
    console.log('🎉 Setup completed successfully!')
    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error updating discount codes table:', error)
    await pool.end()
    process.exit(1)
  }
}

updateDiscountCodesTable()
