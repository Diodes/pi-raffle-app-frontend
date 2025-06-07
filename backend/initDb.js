// initDb.js
const pool = require('./db');

const createTicketsTable = `
CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  user_uid TEXT NOT NULL,
  payment_id TEXT NOT NULL,
  txid TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

async function init() {
  try {
    await pool.query(createTicketsTable);
    console.log("✅ Tickets table created or already exists.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to create table:", err);
    process.exit(1);
  }
}

init();
