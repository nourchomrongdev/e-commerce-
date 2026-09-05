require('dotenv').config();

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const hasDatabaseParts = process.env.DB_HOST && process.env.DB_PORT && process.env.DB_DATABASE && process.env.DB_USERNAME && process.env.DB_PASSWORD;
const dbUrl = hasDatabaseParts
  ? `postgresql://${encodeURIComponent(process.env.DB_USERNAME)}:${encodeURIComponent(process.env.DB_PASSWORD)}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`
  : process.env.DATABASE_URL || 'postgresql://postgres:lerd@127.0.0.1:5432/lerd';
const migrationsDir = path.join(__dirname, 'migrations');

if (!fs.existsSync(migrationsDir)) {
  console.error('Migrations folder not found:', migrationsDir);
  process.exit(1);
}

const files = fs.readdirSync(migrationsDir).filter((file) => file.endsWith('.sql')).sort();

if (files.length === 0) {
  console.log('No migration files found.');
  process.exit(0);
}

for (const file of files) {
  const fullPath = path.join(migrationsDir, file);
  console.log(`Running migration: ${file}`);

  try {
    execSync(`psql "${dbUrl}" -f "${fullPath}"`, { stdio: 'inherit' });
    console.log(`Migration completed: ${file}\n`);
  } catch (error) {
    console.error(`Migration failed: ${file}`);
    process.exit(1);
  }
}

console.log('All migrations executed successfully.');
