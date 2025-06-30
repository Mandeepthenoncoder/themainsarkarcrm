import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

// Database connection configuration
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: parseInt(process.env.DB_POOL_MAX || '10'), // Maximum number of clients in the pool
  min: parseInt(process.env.DB_POOL_MIN || '2'), // Minimum number of clients in the pool
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000'), // Close idle clients after 30 seconds
  connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '10000'), // Return an error after 10 seconds if connection could not be established
  maxUses: 7500, // Close (and replace) a connection after it has been used 7500 times
};

// Global connection pool
let pool: Pool | null = null;

// Initialize the connection pool
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool(dbConfig);
    
    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });

    // Handle pool connection events
    pool.on('connect', (client) => {
      console.log('🔗 New database client connected');
    });

    pool.on('acquire', (client) => {
      console.log('📤 Database client acquired from pool');
    });

    pool.on('release', (client) => {
      console.log('📥 Database client released back to pool');
    });
  }
  
  return pool;
}

// Execute a query with automatic client management
export async function executeQuery<T extends QueryResultRow = any>(
  text: string, 
  params?: any[]
): Promise<QueryResult<T>> {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    const result = await client.query<T>(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Execute multiple queries in a transaction
export async function executeTransaction<T extends QueryResultRow = any>(
  queries: Array<{ text: string; params?: any[] }>
): Promise<QueryResult<T>[]> {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const results: QueryResult<T>[] = [];
    
    for (const query of queries) {
      const result = await client.query<T>(query.text, query.params);
      results.push(result);
    }
    
    await client.query('COMMIT');
    return results;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get a client for complex operations (remember to release!)
export async function getClient(): Promise<PoolClient> {
  const pool = getPool();
  return await pool.connect();
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const result = await executeQuery('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Database connection successful!');
    console.log('🕐 Current Time:', result.rows[0].current_time);
    console.log('📊 PostgreSQL Version:', result.rows[0].pg_version);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Get database statistics
export async function getDatabaseStats() {
  try {
    const queries = [
      // Get total customers
      'SELECT COUNT(*) as total_customers FROM customers WHERE deleted_at IS NULL',
      // Get total deleted customers
      'SELECT COUNT(*) as deleted_customers FROM customers WHERE deleted_at IS NOT NULL',
      // Get total profiles
      'SELECT COUNT(*) as total_profiles FROM profiles',
      // Get total showrooms
      'SELECT COUNT(*) as total_showrooms FROM showrooms',
      // Get total appointments
      'SELECT COUNT(*) as total_appointments FROM appointments',
      // Get database size
      `SELECT pg_size_pretty(pg_database_size(current_database())) as database_size`,
    ];

    const results = await Promise.all(
      queries.map(query => executeQuery(query))
    );

    return {
      totalCustomers: parseInt(results[0].rows[0].total_customers),
      deletedCustomers: parseInt(results[1].rows[0].deleted_customers),
      totalProfiles: parseInt(results[2].rows[0].total_profiles),
      totalShowrooms: parseInt(results[3].rows[0].total_showrooms),
      totalAppointments: parseInt(results[4].rows[0].total_appointments),
      databaseSize: results[5].rows[0].database_size,
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    throw error;
  }
}

// Close the connection pool (for graceful shutdown)
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('🔌 Database connection pool closed');
  }
}

// Export types for use in other files
export type { Pool, PoolClient, QueryResult } from 'pg'; 