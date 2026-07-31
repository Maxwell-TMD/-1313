import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@libsql/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const databaseFile = path.join(process.cwd(), "prisma", "test-papers.db");
process.env.DATABASE_URL = "file:./test-papers.db";

let database: Awaited<typeof import("@/lib/db/prisma")>["prisma"];
let papers: typeof import("@/lib/db/papers");

beforeAll(async () => {
  await rm(databaseFile, { force: true });
  const client = createClient({ url: `file:${databaseFile}` });
  for (const migrationId of [
    "20260731150000_init",
    "20260731180000_add_papers",
  ]) {
    const migration = await readFile(
      path.join(
        process.cwd(),
        "prisma",
        "migrations",
        migrationId,
        "migration.sql",
      ),
      "utf8",
    );
    await client.executeMultiple(migration);
  }
  client.close();

  ({ prisma: database } = await import("@/lib/db/prisma"));
  papers = await import("@/lib/db/papers");
  await database.primaryCategory.createMany({
    data: [
      { id: "paper-politics", subject: "行测", name: "政治理论", sortOrder: 0 },
      { id: "paper-data", subject: "行测", name: "资料分析", sortOrder: 1 },
    ],
  });
});

beforeEach(async () => {
  await database.paper.deleteMany();
});

afterAll(async () => {
  await database.$disconnect();
});

const input = {
  date: "2026-07-31",
  name: "测试试卷",
  examType: "国考" as const,
  notes: "集成测试",
  modules: [
    {
      primaryCategoryId: "paper-politics",
      totalQuestions: 20,
      correctQuestions: 16,
      score: 16,
    },
    {
      primaryCategoryId: "paper-data",
      totalQuestions: 20,
      correctQuestions: 18,
      score: 18.5,
    },
  ],
};

describe("paper repository", () => {
  it("creates, aggregates, reads and deletes a paper", async () => {
    const created = await papers.createPaper(input);
    const detail = await papers.getPaperById(created.id);
    expect(detail?.moduleResults).toHaveLength(2);

    const dashboard = await papers.getPaperDashboard();
    expect(dashboard.paperCount).toBe(1);
    expect(dashboard.totalQuestions).toBe(40);
    expect(dashboard.correctQuestions).toBe(34);
    expect(dashboard.accuracy).toBe(85);
    expect(dashboard.totalScore).toBe(34.5);

    await papers.deletePaper(created.id);
    expect(await papers.getPaperById(created.id)).toBeNull();
  });

  it("enforces paper module numeric constraints", async () => {
    const paper = await database.paper.create({
      data: {
        date: "2026-07-31",
        name: "约束测试",
        examType: "国考",
      },
    });

    await expect(
      database.paperModuleResult.create({
        data: {
          paperId: paper.id,
          primaryCategoryId: "paper-data",
          totalQuestions: 10,
          correctQuestions: 11,
          score: 10,
        },
      }),
    ).rejects.toThrow();
  });
});
