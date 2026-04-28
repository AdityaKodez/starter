/*
  Warnings:

  - You are about to drop the `mistake` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `mistake_attachment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `mistake_retry` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "mistake" DROP CONSTRAINT "mistake_questionAttemptId_fkey";

-- DropForeignKey
ALTER TABLE "mistake" DROP CONSTRAINT "mistake_userId_fkey";

-- DropForeignKey
ALTER TABLE "mistake_attachment" DROP CONSTRAINT "mistake_attachment_mistakeId_fkey";

-- DropForeignKey
ALTER TABLE "mistake_attachment" DROP CONSTRAINT "mistake_attachment_userId_fkey";

-- DropForeignKey
ALTER TABLE "mistake_retry" DROP CONSTRAINT "mistake_retry_mistakeId_fkey";

-- DropTable
DROP TABLE "mistake";

-- DropTable
DROP TABLE "mistake_attachment";

-- DropTable
DROP TABLE "mistake_retry";

-- CreateTable
CREATE TABLE "UploadBatch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "testAttemptId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UploadBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisRun" (
    "id" TEXT NOT NULL,
    "attachmentId" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalysisRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mistake" (
    "id" TEXT NOT NULL,
    "analysisRunId" TEXT NOT NULL,
    "type" "MistakeType" NOT NULL,
    "description" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "status" "MistakeStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mistake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "publicUrl" TEXT,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER,
    "status" "AttachmentUploadStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UploadBatch" ADD CONSTRAINT "UploadBatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadBatch" ADD CONSTRAINT "UploadBatch_testAttemptId_fkey" FOREIGN KEY ("testAttemptId") REFERENCES "test_attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalysisRun" ADD CONSTRAINT "AnalysisRun_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mistake" ADD CONSTRAINT "Mistake_analysisRunId_fkey" FOREIGN KEY ("analysisRunId") REFERENCES "AnalysisRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "UploadBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
