import { Pool } from 'pg';
import { logger } from '../utils/logger';

// Parse DATABASE_URL to get connection details
const parseDatabaseUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port),
      database: parsed.pathname.slice(1),
      user: parsed.username,
      password: parsed.password,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };
  } catch (error) {
    logger.error('Failed to parse DATABASE_URL:', error);
    throw new Error('Invalid DATABASE_URL format');
  }
};

// Create connection pool
const pool = new Pool(parseDatabaseUrl(process.env.DATABASE_URL || ''));

// Test database connection
pool.on('connect', () => {
  logger.info('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Query wrapper with error handling
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    logger.error('Query error:', { error, text });
    throw error;
  }
};

// Export pool for transactions
export { pool };
