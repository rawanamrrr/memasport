// Check what categories exist in the database
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Digitiva%3C%2F%3E2025@localhost:5432/mema_sports'
});

async function checkCategories() {
  try {
    console.log('🔍 Checking categories in database...\n');

    const result = await pool.query(`
      SELECT DISTINCT category, COUNT(*) as count 
      FROM products 
      GROUP BY category 
      ORDER BY category
    `);

    console.log('Categories found:');
    result.rows.forEach(row => {
      console.log(`  - ${row.category}: ${row.count} products`);
    });

    console.log('\n📋 Sample products:');
    const samples = await pool.query(`
      SELECT id, name, category 
      FROM products 
      LIMIT 5
    `);
    
    samples.rows.forEach(row => {
      console.log(`  ${row.id} - ${row.name} (${row.category})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkCategories();
