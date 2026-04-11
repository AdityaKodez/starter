-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ArtifactType" AS ENUM ('SUMMARY', 'FLASHCARD', 'TEST', 'MINDMAP');

-- CreateTable
CREATE TABLE "playlist" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "thumbnail" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "status" "Status" NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "playlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playlist_video" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "thumbnail" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "transcription" TEXT,
    "status" "Status" NOT NULL,
    "playlistId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "playlist_video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artifact" (
    "id" TEXT NOT NULL,
    "type" "ArtifactType" NOT NULL,
    "json" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "playlistVideoId" TEXT NOT NULL,

    CONSTRAINT "artifact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "playlist_userId_idx" ON "playlist"("userId");

-- CreateIndex
CREATE INDEX "playlist_video_playlistId_idx" ON "playlist_video"("playlistId");

-- CreateIndex
CREATE INDEX "artifact_playlistVideoId_idx" ON "artifact"("playlistVideoId");

-- AddForeignKey
ALTER TABLE "playlist" ADD CONSTRAINT "playlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_video" ADD CONSTRAINT "playlist_video_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artifact" ADD CONSTRAINT "artifact_playlistVideoId_fkey" FOREIGN KEY ("playlistVideoId") REFERENCES "playlist_video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
