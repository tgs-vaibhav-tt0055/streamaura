require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'streaming',
  password: process.env.PGPASSWORD || '123@Jayraj',
  port: process.env.PGPORT || 5433,
});

async function getDatabase() {
  const client = await pool.connect();

  try {
    // 🔄 Ensure pgcrypto extension BEFORE transaction
    await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
    console.log('✅ pgcrypto extension ensured');

    await client.query('BEGIN');
    console.log('🔄 Starting DB initialization transaction...');

    const tables = [/* same as before */];

    for (const { name, query } of tables) {
      try {
        await client.query(query);
        console.log(`✅ Table ensured: ${name}`);
      } catch (err) {
        console.error(`❌ Error creating table "${name}": ${err.message}`);
        throw err;
      }
    }

    await client.query('COMMIT');
    console.log('🎉 PostgreSQL database initialized successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('🔥 Rolling back DB init due to error:', error.message);
    throw error;
  } finally {
    client.release();
  }
}


module.exports = {
  pool,
  getDatabase
};
