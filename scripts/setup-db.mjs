import "dotenv/config";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@libsql/client";

const migrationId = "20260731150000_init";
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

  const existing = await client.execute({
    sql: 'SELECT "id" FROM "_AppMigration" WHERE "id" = ?',
    args: [migrationId],
  });

  if (existing.rows.length > 0) {
    console.log(`Migration ${migrationId} is already applied.`);
    return;
  }

  const sql = await readFile(
    path.join(
      process.cwd(),
      "prisma",
      "migrations",
      migrationId,
      "migration.sql",
    ),
    "utf8",
  );

  await client.executeMultiple(sql);
  await client.execute({
    sql: 'INSERT INTO "_AppMigration" ("id") VALUES (?)',
    args: [migrationId],
  });
  console.log(`Applied migration ${migrationId}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => client.close());
