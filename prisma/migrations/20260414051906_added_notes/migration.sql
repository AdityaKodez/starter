-- CreateTable
CREATE TABLE "playlist_notes" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "playlistvideoId" TEXT NOT NULL,

    CONSTRAINT "playlist_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "playlist_notes_playlistvideoId_idx" ON "playlist_notes"("playlistvideoId");

-- AddForeignKey
ALTER TABLE "playlist_notes" ADD CONSTRAINT "playlist_notes_playlistvideoId_fkey" FOREIGN KEY ("playlistvideoId") REFERENCES "playlist_video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
