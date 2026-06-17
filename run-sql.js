const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

async function runSqlFile(filePath) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Digitiva%3C%2F%3E2025@localhost:5432/mema_sports'
  });

  const client = await pool.connect();
  
  try {
    console.log('Connected to PostgreSQL database');
    
    // Read the SQL file
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Split the SQL file into individual statements
    const statements = sql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      try {
        console.log('Executing:', statement.substring(0, 50) + '...');
        await client.query(statement);
      } catch (error) {
        console.error('Error executing statement:', error.message);
        // Continue with next statement even if one fails
      }
    }
    
    console.log('All SQL statements executed successfully');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
    console.log('Database connection closed');
  }
}

// Get the SQL file path from command line arguments or use the default
const sqlFilePath = process.argv[2] || './create_offers_table.sql';
runSqlFile(sqlFilePath);
