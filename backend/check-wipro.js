const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false
});

async function checkWipro() {
  try {
    const result = await pool.query(
      "SELECT id, symbol, company_name, bank_name, quantity, average_price FROM assets WHERE type = 'equity' AND symbol = 'WIPRO.NS'"
    );
    
    console.log('WIPRO.NS holdings:');
    console.log(JSON.stringify(result.rows, null, 2));
    console.log(`\nTotal rows: ${result.rows.length}`);
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkWipro();
