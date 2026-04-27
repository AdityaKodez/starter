-- CreateEnum
CREATE TYPE "AttachmentUploadStatus" AS ENUM ('PENDING', 'UPLOADED', 'ATTACHED', 'FAILED');

-- AlterTable
ALTER TABLE "mistake_attachment"
  ADD COLUMN "uploadStatus" "AttachmentUploadStatus" NOT NULL DEFAULT 'ATTACHED',
  ADD COLUMN "userId" TEXT;

-- Backfill ownership from the existing attached mistake rows.
UPDATE "mistake_attachment" AS attachment
SET "userId" = mistake."userId"
FROM "mistake"
WHERE attachment."mistakeId" = mistake."id";

-- Enforce ownership for all attachment rows after backfill.
ALTER TABLE "mistake_attachment"
  ALTER COLUMN "userId" SET NOT NULL,
  ALTER COLUMN "mistakeId" DROP NOT NULL;

-- New reserved attachment rows should start pending.
ALTER TABLE "mistake_attachment"
  ALTER COLUMN "uploadStatus" SET DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "mistake_attachment_userId_uploadStatus_idx" ON "mistake_attachment"("userId", "uploadStatus");

-- AddForeignKey
ALTER TABLE "mistake_attachment" ADD CONSTRAINT "mistake_attachment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
