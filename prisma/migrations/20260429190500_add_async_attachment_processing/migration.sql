-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM (
  'QUEUED',
  'OCR_PROCESSING',
  'OCR_COMPLETED',
  'CHUNKING',
  'ANALYZING',
  'COMPLETED',
  'FAILED'
);

-- AlterTable
ALTER TABLE "AnalysisRun"
  ADD COLUMN "rawOcr" JSONB,
  ADD COLUMN "fullText" TEXT,
  ADD COLUMN "pageCount" INTEGER,
  ADD COLUMN "textractJobId" TEXT,
  ADD COLUMN "errorMessage" TEXT,
  ADD COLUMN "startedAt" TIMESTAMP(3),
  ADD COLUMN "completedAt" TIMESTAMP(3),
  ADD COLUMN "updatedAt" TIMESTAMP(3);

UPDATE "AnalysisRun"
SET "updatedAt" = "createdAt"
WHERE "updatedAt" IS NULL;

ALTER TABLE "AnalysisRun"
  ALTER COLUMN "updatedAt" SET NOT NULL;

ALTER TABLE "AnalysisRun"
  ADD COLUMN "status_new" "AnalysisStatus" NOT NULL DEFAULT 'QUEUED';

UPDATE "AnalysisRun"
SET "status_new" = CASE UPPER("status")
  WHEN 'QUEUED' THEN 'QUEUED'::"AnalysisStatus"
  WHEN 'OCR_PROCESSING' THEN 'OCR_PROCESSING'::"AnalysisStatus"
  WHEN 'OCR_COMPLETED' THEN 'OCR_COMPLETED'::"AnalysisStatus"
  WHEN 'CHUNKING' THEN 'CHUNKING'::"AnalysisStatus"
  WHEN 'ANALYZING' THEN 'ANALYZING'::"AnalysisStatus"
  WHEN 'PROCESSING' THEN 'ANALYZING'::"AnalysisStatus"
  WHEN 'COMPLETED' THEN 'COMPLETED'::"AnalysisStatus"
  WHEN 'FAILED' THEN 'FAILED'::"AnalysisStatus"
  ELSE 'QUEUED'::"AnalysisStatus"
END;

ALTER TABLE "AnalysisRun"
  DROP COLUMN "status";

ALTER TABLE "AnalysisRun"
  RENAME COLUMN "status_new" TO "status";

-- CreateTable
CREATE TABLE "DocumentChunk" (
  "id" TEXT NOT NULL,
  "attachmentId" TEXT NOT NULL,
  "analysisRunId" TEXT NOT NULL,
  "pageStart" INTEGER NOT NULL,
  "pageEnd" INTEGER NOT NULL,
  "chunkIndex" INTEGER NOT NULL,
  "text" TEXT NOT NULL,
  "sourceBlockIds" JSONB NOT NULL,
  "confidence" DOUBLE PRECISION,
  "needsVision" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "DocumentChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnalysisRun_attachmentId_status_idx" ON "AnalysisRun"("attachmentId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentChunk_analysisRunId_chunkIndex_key" ON "DocumentChunk"("analysisRunId", "chunkIndex");

-- CreateIndex
CREATE INDEX "DocumentChunk_attachmentId_idx" ON "DocumentChunk"("attachmentId");

-- AddForeignKey
ALTER TABLE "DocumentChunk" ADD CONSTRAINT "DocumentChunk_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentChunk" ADD CONSTRAINT "DocumentChunk_analysisRunId_fkey" FOREIGN KEY ("analysisRunId") REFERENCES "AnalysisRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
