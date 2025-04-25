import { createServerSupabase } from '../lib/supabase';
import { logger } from '../lib/server/logger';
import fs from 'fs';
import path from 'path';

async function runMigrations() {
  try {
    logger.info('Starting storage migrations');
    const supabase = createServerSupabase();

    // Migration files in order
    const migrations = [
      '00001_init_storage.sql',
      '00002_fix_storage_schema.sql',
      '00003_fix_storage_triggers.sql'
    ];

    for (const migrationFile of migrations) {
      logger.info(`Running migration: ${migrationFile}`);
      
      // Read migration file
      const filePath = path.join(__dirname, '../database/migrations', migrationFile);
      const sql = fs.readFileSync(filePath, 'utf8');

      // Split SQL into separate statements
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      // Execute each statement
      for (const statement of statements) {
        const { error } = await supabase.rpc('exec_sql', {
          query: statement
        });

        if (error) {
          logger.error(`Migration error in ${migrationFile}:`, {
            error,
            statement: statement.substring(0, 100) + '...'
          });
          throw error;
        }
      }

      logger.info(`Completed migration: ${migrationFile}`);
    }

    logger.info('All migrations completed successfully');

  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  }
}

// Run migrations
runMigrations().catch(error => {
  logger.error('Migration script failed:', error);
  process.exit(1);
}); 