CREATE TABLE IF NOT EXISTS "transcript_chunks" (
    "id" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "startTime" INTEGER NOT NULL,
    "endTime" INTEGER NOT NULL,
    "tokenCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "playlistVideoId" TEXT NOT NULL,

    CONSTRAINT "transcript_chunks_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "transcript_chunks"
    ADD COLUMN IF NOT EXISTS "chunkIndex" INTEGER,
    ADD COLUMN IF NOT EXISTS "text" TEXT,
    ADD COLUMN IF NOT EXISTS "startTime" INTEGER,
    ADD COLUMN IF NOT EXISTS "endTime" INTEGER,
    ADD COLUMN IF NOT EXISTS "tokenCount" INTEGER,
    ADD COLUMN IF NOT EXISTS "playlistVideoId" TEXT;

UPDATE "transcript_chunks"
SET "chunkIndex" = 0
WHERE "chunkIndex" IS NULL;

UPDATE "transcript_chunks"
SET "text" = ''
WHERE "text" IS NULL;

UPDATE "transcript_chunks"
SET "startTime" = 0
WHERE "startTime" IS NULL;

UPDATE "transcript_chunks"
SET "endTime" = 0
WHERE "endTime" IS NULL;

ALTER TABLE "transcript_chunks"
    ALTER COLUMN "chunkIndex" SET NOT NULL,
    ALTER COLUMN "text" SET NOT NULL,
    ALTER COLUMN "startTime" SET NOT NULL,
    ALTER COLUMN "endTime" SET NOT NULL,
    ALTER COLUMN "playlistVideoId" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "transcript_chunks_playlistVideoId_idx" ON "transcript_chunks"("playlistVideoId");
CREATE INDEX IF NOT EXISTS "transcript_chunks_playlistVideoId_startTime_idx" ON "transcript_chunks"("playlistVideoId", "startTime");
CREATE UNIQUE INDEX IF NOT EXISTS "transcript_chunks_playlistVideoId_chunkIndex_key" ON "transcript_chunks"("playlistVideoId", "chunkIndex");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'transcript_chunks_playlistVideoId_fkey'
    ) THEN
        ALTER TABLE "transcript_chunks"
            ADD CONSTRAINT "transcript_chunks_playlistVideoId_fkey"
            FOREIGN KEY ("playlistVideoId")
            REFERENCES "playlist_video"("id")
            ON DELETE CASCADE
            ON UPDATE CASCADE;
    END IF;
END $$;
