import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres@localhost:5433/postgres';

async function runSQLFile(client, filePath) {
  console.log(`Running SQL file: ${path.basename(filePath)}`);
  const sql = fs.readFileSync(filePath, 'utf8');
  if (sql.trim().length > 0) {
    await client.query(sql);
  }
}

async function main() {
  const client = new pg.Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✅ Connected to database for setup');

    // Run migrations
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      await runSQLFile(client, path.join(migrationsDir, file));
    }

    // Run seeds
    const seedsDir = path.join(__dirname, 'seeds');
    const seedFiles = fs.readdirSync(seedsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of seedFiles) {
      await runSQLFile(client, path.join(seedsDir, file));
    }

    console.log('🎉 Database setup and seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
