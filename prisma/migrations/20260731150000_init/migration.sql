-- CreateTable
CREATE TABLE "PrimaryCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subject" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SecondaryCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "primaryCategoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SecondaryCategory_primaryCategoryId_fkey" FOREIGN KEY ("primaryCategoryId") REFERENCES "PrimaryCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PracticeRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerKey" TEXT NOT NULL DEFAULT 'single-user',
    "date" TEXT NOT NULL,
    "examType" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "primaryCategoryId" TEXT NOT NULL,
    "secondaryCategoryId" TEXT,
    "totalQuestions" INTEGER NOT NULL CHECK ("totalQuestions" > 0),
    "correctQuestions" INTEGER NOT NULL CHECK ("correctQuestions" >= 0 AND "correctQuestions" <= "totalQuestions"),
    "durationMinutes" INTEGER NOT NULL DEFAULT 0 CHECK ("durationMinutes" >= 0),
    "source" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PracticeRecord_primaryCategoryId_fkey" FOREIGN KEY ("primaryCategoryId") REFERENCES "PrimaryCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PracticeRecord_secondaryCategoryId_fkey" FOREIGN KEY ("secondaryCategoryId") REFERENCES "SecondaryCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "PrimaryCategory_subject_isActive_sortOrder_idx" ON "PrimaryCategory"("subject", "isActive", "sortOrder");
CREATE UNIQUE INDEX "PrimaryCategory_subject_name_key" ON "PrimaryCategory"("subject", "name");
CREATE INDEX "SecondaryCategory_primaryCategoryId_isActive_sortOrder_idx" ON "SecondaryCategory"("primaryCategoryId", "isActive", "sortOrder");
CREATE UNIQUE INDEX "SecondaryCategory_primaryCategoryId_name_key" ON "SecondaryCategory"("primaryCategoryId", "name");
CREATE INDEX "PracticeRecord_ownerKey_date_idx" ON "PracticeRecord"("ownerKey", "date");
CREATE INDEX "PracticeRecord_ownerKey_examType_date_idx" ON "PracticeRecord"("ownerKey", "examType", "date");
CREATE INDEX "PracticeRecord_ownerKey_subject_date_idx" ON "PracticeRecord"("ownerKey", "subject", "date");
CREATE INDEX "PracticeRecord_ownerKey_primaryCategoryId_date_idx" ON "PracticeRecord"("ownerKey", "primaryCategoryId", "date");
CREATE INDEX "PracticeRecord_ownerKey_secondaryCategoryId_date_idx" ON "PracticeRecord"("ownerKey", "secondaryCategoryId", "date");
