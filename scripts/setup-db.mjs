import "dotenv/config";

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@libsql/client";

const configuredUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const databaseUrl = configuredUrl.startsWith("file:")
  ? `file:${path.resolve(process.cwd(), "prisma", configuredUrl.slice(5))}`
  : configuredUrl;

const client = createClient({ url: databaseUrl });

async function main() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "_AppMigration" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const migrationsDirectory = path.join(process.cwd(), "prisma", "migrations");
  const entries = await readdir(migrationsDirectory, { withFileTypes: true });
  const migrationIds = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const migrationId of migrationIds) {
    const existing = await client.execute({
      sql: 'SELECT "id" FROM "_AppMigration" WHERE "id" = ?',
      args: [migrationId],
    });

    if (existing.rows.length > 0) {
      console.log(`Migration ${migrationId} is already applied.`);
      continue;
    }

    const sql = await readFile(
      path.join(migrationsDirectory, migrationId, "migration.sql"),
      "utf8",
    );
    await client.executeMultiple(sql);
    await client.execute({
      sql: 'INSERT INTO "_AppMigration" ("id") VALUES (?)',
      args: [migrationId],
    });
    console.log(`Applied migration ${migrationId}.`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => client.close());
