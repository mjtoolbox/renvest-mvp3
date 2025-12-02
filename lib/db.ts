import { Pool } from 'pg';

// Use a global variable to preserve the client across hot reloads in development
declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

// Allow either DATABASE_URL (common) or REVEST_DATABASE_URL (custom) for compatibility
const connectionString = process.env.DATABASE_URL || process.env.REVEST_DATABASE_URL;
if (!connectionString) {
  // Warn but do not throw — creating the pool is deferred until first use so
  // importing this module won't crash the server or build when env vars are missing.
  console.warn('No DATABASE_URL or REVEST_DATABASE_URL found. DB operations will fail until it is provided.');
}

function createPool(connStr: string) {
  // For Neon / many hosted Postgres, ssl is required. Setting rejectUnauthorized=false
  // is commonly used for hosted Neon connections. Adjust as your provider recommends.
  return new Pool({
    connectionString: connStr,
    ssl: {
      rejectUnauthorized: false,
    },
  });
}

// Lazily initialize pool. Keep across hot reloads in dev via global var.
let pool: Pool | undefined = global.__pgPool;
if (!pool && connectionString) {
  pool = createPool(connectionString);
  // eslint-disable-next-line no-var
  global.__pgPool = pool;
}

export default class DB {
  static async query(text: string, params?: any[]) {
    if (!pool) throw new Error('Database not configured. Set DATABASE_URL in your environment.');
    return pool.query(text, params);
  }

  // Simple helper to ensure a contacts table exists and insert a row
  static async insertContact(name: string, email: string, role: string) {
    if (!pool) throw new Error('Database not configured. Set DATABASE_URL in your environment.');

    const insert = await pool.query(
      'INSERT INTO contacts (name, email, role) VALUES ($1, $2, $3) RETURNING id, created_at',
      [name, email, role]
    );
    return insert.rows[0];
  }

  // Insert a fully-fledged User record into the User table.
  static async insertUser(firstName: string, lastName: string, email: string, passwordHash: string, role: string, stripeAccountId?: string) {
    if (!pool) throw new Error('Database not configured. Set DATABASE_URL in your environment.');

    const insert = await pool.query(
      'INSERT INTO "User" (firstName, lastName, email, passwordHash, role, stripeAccountId) VALUES ($1, $2, $3, $4, $5, $6) RETURNING userId, firstName, lastName, email, role, createdAt',
      [firstName, lastName, email, passwordHash, role, stripeAccountId || null]
    );
    return insert.rows[0];
  }

  // Look up a user by email. Returns the row or null.
  static async getUserByEmail(email: string) {
    if (!pool) throw new Error('Database not configured. Set DATABASE_URL in your environment.');
    const res = await pool.query('SELECT userId, email, passwordHash, role, isActive, stripeAccountId, createdAt FROM "User" WHERE email = $1 LIMIT 1', [email]);
    return res.rows[0] || null;
  }

  // Look up a contact by email. Returns the row or null.
  static async getContactByEmail(email: string) {
    if (!pool) throw new Error('Database not configured. Set DATABASE_URL in your environment.');
    const res = await pool.query('SELECT id, name, email, role, created_at FROM contacts WHERE email = $1 LIMIT 1', [email]);
    return res.rows[0] || null;
  }
}
