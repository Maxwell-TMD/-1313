import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@libsql/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const databaseFile = path.join(process.cwd(), "prisma", "test-integration.db");
process.env.DATABASE_URL = "file:./test-integration.db";

let database: Awaited<typeof import("@/lib/db/prisma")>["prisma"];
let records: typeof import("@/lib/db/records");

beforeAll(async () => {
  await rm(databaseFile, { force: true });
  const client = createClient({ url: `file:${databaseFile}` });
  const migration = await readFile(
    path.join(
      process.cwd(),
      "prisma",
      "migrations",
      "20260731150000_init",
      "migration.sql",
    ),
    "utf8",
  );
  await client.executeMultiple(migration);
  client.close();

  ({ prisma: database } = await import("@/lib/db/prisma"));
  records = await import("@/lib/db/records");
  await database.primaryCategory.create({
    data: {
      id: "primary-test",
      subject: "行测",
      name: "测试模块",
      secondaryCategories: {
        create: { id: "secondary-test", name: "测试子模块" },
      },
    },
  });
});

beforeEach(async () => {
  await database.practiceRecord.deleteMany();
});

afterAll(async () => {
  await database.$disconnect();
});

const input = {
  date: "2026-07-31",
  examType: "国考" as const,
  subject: "行测" as const,
  primaryCategoryId: "primary-test",
  secondaryCategoryId: "secondary-test",
  totalQuestions: 20,
  correctQuestions: 15,
  durationMinutes: 18,
  source: "测试题库",
  notes: "测试记录",
};

describe("record repository", () => {
  it("creates, edits, reads and deletes a record", async () => {
    const created = await records.createRecord(input);
    expect((await records.getRecordById(created.id))?.correctQuestions).toBe(15);

    await records.updateRecord(created.id, { ...input, correctQuestions: 18 });
    expect((await records.getRecordById(created.id))?.correctQuestions).toBe(18);

    await records.deleteRecord(created.id);
    expect(await records.getRecordById(created.id)).toBeNull();
  });

  it("filters inclusively by date range", async () => {
    await records.createRecord({ ...input, date: "2026-07-29" });
    await records.createRecord({ ...input, date: "2026-07-31" });
    const result = await records.getPaginatedRecords({
      startDate: "2026-07-30",
      endDate: "2026-07-31",
      page: 1,
    });
    expect(result.total).toBe(1);
    expect(result.records[0]?.date).toBe("2026-07-31");
  });

  it("enforces numeric database constraints", async () => {
    await expect(
      database.practiceRecord.create({
        data: {
          ...input,
          ownerKey: "single-user",
          totalQuestions: 10,
          correctQuestions: 11,
        },
      }),
    ).rejects.toThrow();
  });
});
