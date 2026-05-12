-- CreateTable
CREATE TABLE "user_test_result" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subject" "Subject" NOT NULL,
    "title" TEXT,
    "result" TEXT NOT NULL,
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_test_result_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_test_result_userId_takenAt_idx" ON "user_test_result"("userId", "takenAt");

-- AddForeignKey
ALTER TABLE "user_test_result" ADD CONSTRAINT "user_test_result_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
