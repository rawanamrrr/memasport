const { Pool } = require('pg');
require('dotenv').config();

(async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Digitiva%3C%2F%3E2025@localhost:5432/mema_sports'
  });

  try {
    const result = await pool.query(`
      SELECT id, title, description, discount_code, is_active, priority, created_at, updated_at
      FROM offers
      ORDER BY created_at DESC
    `);
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (error) {
    console.error('Error querying offers:', error.message);
  } finally {
    await pool.end();
  }
})();
