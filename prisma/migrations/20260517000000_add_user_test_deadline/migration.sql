-- CreateEnum
CREATE TYPE "UserTestDeadlineStatus" AS ENUM ('active', 'completed', 'cancelled');

-- CreateTable
CREATE TABLE "user_test_deadline" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subject" "Subject" NOT NULL,
    "title" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "status" "UserTestDeadlineStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_test_deadline_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_test_deadline_userId_status_scheduledAt_idx" ON "user_test_deadline"("userId", "status", "scheduledAt");

-- AddForeignKey
ALTER TABLE "user_test_deadline" ADD CONSTRAINT "user_test_deadline_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
