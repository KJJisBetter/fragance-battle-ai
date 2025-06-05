import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';
import { pool } from '../config/database';

export async function runMigrations(): Promise<void> {
  try {
    // Drop existing types if they exist
    await pool.query(`
      DROP TYPE IF EXISTS fragrance_category CASCADE;
      DROP TYPE IF EXISTS fragrance_concentration CASCADE;
    `);

    // Read and execute the init.sql file
    const initSqlPath = path.join(__dirname, '../../database/init.sql');
    const initSql = fs.readFileSync(initSqlPath, 'utf8');

    // Execute the entire SQL file as one statement
    await pool.query(initSql);

    logger.info('Database migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => {
      logger.info('Migrations completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration error:', error);
      process.exit(1);
    });
}
