-- CreateTable
CREATE TABLE "Paper" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerKey" TEXT NOT NULL DEFAULT 'single-user',
    "date" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "examType" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PaperModuleResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "paperId" TEXT NOT NULL,
    "primaryCategoryId" TEXT NOT NULL,
    "totalQuestions" INTEGER NOT NULL CHECK ("totalQuestions" > 0),
    "correctQuestions" INTEGER NOT NULL CHECK ("correctQuestions" >= 0 AND "correctQuestions" <= "totalQuestions"),
    "score" REAL NOT NULL DEFAULT 0 CHECK ("score" >= 0),
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PaperModuleResult_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "Paper" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PaperModuleResult_primaryCategoryId_fkey" FOREIGN KEY ("primaryCategoryId") REFERENCES "PrimaryCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Paper_ownerKey_date_idx" ON "Paper"("ownerKey", "date");
CREATE INDEX "Paper_ownerKey_examType_date_idx" ON "Paper"("ownerKey", "examType", "date");
CREATE UNIQUE INDEX "PaperModuleResult_paperId_primaryCategoryId_key" ON "PaperModuleResult"("paperId", "primaryCategoryId");
CREATE INDEX "PaperModuleResult_primaryCategoryId_idx" ON "PaperModuleResult"("primaryCategoryId");
