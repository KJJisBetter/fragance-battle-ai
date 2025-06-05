import { query } from '../config/database';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';

export async function runMigrations(): Promise<void> {
  try {
    // Read and execute the init.sql file
    const initSqlPath = path.join(__dirname, '../../database/init.sql');
    const initSql = fs.readFileSync(initSqlPath, 'utf8');

    // Split by semicolon and execute each statement
    const statements = initSql.split(';').filter(stmt => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        await query(statement);
      }
    }

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
