import { prisma } from "@/lib/prisma";
import { generateModules } from "@/lib/ai";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { authedProcedure, createTRPCRouter } from "../init";
import { Status } from "@/generated/prisma/enums";

const playlistStatusSchema = z.enum([
  Status.PENDING,
  Status.PROCESSING,
  Status.COMPLETED,
  Status.FAILED,
]);

const createPlaylistInput = z.object({
  title: z.string().min(1).max(255).optional(),
  thumbnail: z.url().nullable().optional(),
  sourceUrl: z.url(),
  ownerName: z.string().min(1).max(255).optional(),
  playlistId: z.string().min(1).max(255).optional(),
  status: playlistStatusSchema.default(Status.PENDING),
});

const updatePlaylistInput = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(255).optional(),
  thumbnail: z.url().nullable().optional(),
  sourceUrl: z.url().optional(),
  ownerName: z.string().min(1).max(255).optional(),
  status: playlistStatusSchema.optional(),
});

function extractPlaylistIdFromUrl(sourceUrl: string) {
  try {
    const parsed = new URL(sourceUrl);
    const playlistId = parsed.searchParams.get("list");
    if (!playlistId) return null;
    return playlistId;
  } catch {
    return null;
  }
}

function parseYouTubeDurationToSeconds(duration: string) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = Number.parseInt(match[1] ?? "0", 10);
  const minutes = Number.parseInt(match[2] ?? "0", 10);
  const seconds = Number.parseInt(match[3] ?? "0", 10);

  return hours * 3600 + minutes * 60 + seconds;
}

async function fetchYouTubePlaylistData(playlistId: string, apiKey: string) {
  const playlistInfoUrl = new URL("https://www.googleapis.com/youtube/v3/playlists");
  playlistInfoUrl.searchParams.set("part", "snippet");
  playlistInfoUrl.searchParams.set("id", playlistId);
  playlistInfoUrl.searchParams.set("key", apiKey);

  const infoResponse = await fetch(playlistInfoUrl.toString());
  if (!infoResponse.ok) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Failed to fetch playlist details from YouTube",
    });
  }

  const infoJson = (await infoResponse.json()) as {
    items: Array<{
      snippet: {
        title: string;
        channelTitle: string;
        thumbnails?: {
          high?: { url?: string };
          medium?: { url?: string };
          default?: { url?: string };
        };
      };
    }>;
  };

  const playlistSnippet = infoJson.items?.[0]?.snippet;

  const playlistItemsUrl = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
  playlistItemsUrl.searchParams.set("part", "snippet,contentDetails");
  playlistItemsUrl.searchParams.set("playlistId", playlistId);
  playlistItemsUrl.searchParams.set("maxResults", "50");
  playlistItemsUrl.searchParams.set("key", apiKey);

  const itemsResponse = await fetch(playlistItemsUrl.toString());
  if (!itemsResponse.ok) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Failed to fetch playlist videos from YouTube",
    });
  }

  const itemsJson = (await itemsResponse.json()) as {
    items?: Array<{
      snippet?: {
        title?: string;
        thumbnails?: {
          high?: { url?: string };
          medium?: { url?: string };
          default?: { url?: string };
        };
      };
      contentDetails?: {
        videoId?: string;
      };
    }>;
  };

  const videoIds = (itemsJson.items ?? [])
    .map((item) => item.contentDetails?.videoId)
    .filter((value): value is string => Boolean(value));

  let durationsByVideoId = new Map<string, number>();
  if (videoIds.length > 0) {
    const videoDetailsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    videoDetailsUrl.searchParams.set("part", "contentDetails");
    videoDetailsUrl.searchParams.set("id", videoIds.join(","));
    videoDetailsUrl.searchParams.set("key", apiKey);

    const videosResponse = await fetch(videoDetailsUrl.toString());
    if (videosResponse.ok) {
      const videosJson = (await videosResponse.json()) as {
        items?: Array<{
          id?: string;
          contentDetails?: { duration?: string };
        }>;
      };

      durationsByVideoId = new Map(
        (videosJson.items ?? [])
          .filter((item): item is { id: string; contentDetails?: { duration?: string } } => Boolean(item.id))
          .map((item) => [item.id, parseYouTubeDurationToSeconds(item.contentDetails?.duration ?? "PT0S")]),
      );
    }
  }

  const videos = (itemsJson.items ?? [])
    .map((item) => {
      const videoId = item.contentDetails?.videoId;
      if (!videoId) return null;

      return {
        youtubeVideoId: videoId,
        title: item.snippet?.title ?? "Untitled video",
        thumbnail:
          item.snippet?.thumbnails?.high?.url ??
          item.snippet?.thumbnails?.medium?.url ??
          item.snippet?.thumbnails?.default?.url ??
          null,
        sourceUrl: `https://www.youtube.com/watch?v=${videoId}`,
        duration: durationsByVideoId.get(videoId) ?? 0,
        status: Status.PENDING,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return {
    title: playlistSnippet.title,
    ownerName: playlistSnippet?.channelTitle ?? "Unknown channel",
    thumbnail:
      playlistSnippet?.thumbnails?.high?.url ??
      playlistSnippet?.thumbnails?.medium?.url ??
      playlistSnippet?.thumbnails?.default?.url ??
      null,
    videos,
  };
}

export const playlistRouter = createTRPCRouter({
  list: authedProcedure.query(({ ctx }) => {
    return prisma.playlist.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        videos: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            title: true,
            status: true,
            duration: true,
          },
        },
      },
    });
  }),

  byId: authedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const playlist = await prisma.playlist.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: {
              videos: {
                orderBy: { createdAt: "asc" },
                include: {
                  artifacts: true,
                },
              },
            },
          },
          videos: {
            orderBy: { createdAt: "asc" },
            include: {
              artifacts: true,
            },
          },
        },
      });

      if (!playlist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playlist not found",
        });
      }

      return playlist;
    }),

  create: authedProcedure
    .input(createPlaylistInput)
    .mutation(async ({ ctx, input }) => {
      const extractedPlaylistId = input.playlistId ?? extractPlaylistIdFromUrl(input.sourceUrl);
      if (!extractedPlaylistId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid YouTube playlist URL. Missing list parameter.",
        });
      }

      const canonicalSourceUrl = `https://www.youtube.com/playlist?list=${extractedPlaylistId}`;

      const existing = await prisma.playlist.findFirst({
        where: {
          userId: ctx.user.id,
          sourceUrl: canonicalSourceUrl,
        },
      });

      if (existing) {
        return existing;
      }

      const apiKey = process.env.GOOGLE_YOUTUBE_API_KEY as string;
      let resolvedTitle = input.title ?? `Playlist ${extractedPlaylistId}`;
      let resolvedOwnerName = input.ownerName ?? "Unknown channel";
      let resolvedThumbnail = input.thumbnail ?? null;
      let videos: Array<{
        youtubeVideoId: string;
        title: string;
        thumbnail: string | null;
        sourceUrl: string;
        duration: number;
        status: Status;
      }> = [];

      if (apiKey) {
        const youtubeData = await fetchYouTubePlaylistData(extractedPlaylistId, apiKey);
        resolvedTitle = youtubeData.title;
        resolvedOwnerName = youtubeData.ownerName;
        resolvedThumbnail = youtubeData.thumbnail;
        videos = youtubeData.videos;
      }

      let generatedCourse: Awaited<ReturnType<typeof generateModules>> | null = null;
      if (videos.length > 0 && process.env.GOOGLE_AI_API_KEY) {
        try {
          generatedCourse = await generateModules({
            playlistVideos: videos.map((video) => ({
              title: video.title,
              id: video.youtubeVideoId,
            })),
          });
        } catch (error) {
          console.error("Failed to generate lessons for playlist:", error);
        }
      }

      return prisma.$transaction(async (tx) => {
        const playlist = await tx.playlist.create({
          data: {
            title: resolvedTitle,
            thumbnail: resolvedThumbnail,
            sourceUrl: canonicalSourceUrl,
            ownerName: resolvedOwnerName,
            status: input.status,
            userId: ctx.user.id,
            videoCount: videos.length,
            videos: {
              create: videos.map((video) => ({
                youtubeVideoId: video.youtubeVideoId,
                title: video.title,
                thumbnail: video.thumbnail,
                sourceUrl: video.sourceUrl,
                duration: video.duration,
                status: video.status,
              })),
            },
          },
        });

        const lessons = generatedCourse?.lessons ?? [];
        if (lessons.length === 0) {
          return playlist;
        }

        const orderedLessons = [...lessons].sort((a, b) => a.order - b.order);

        for (let index = 0; index < orderedLessons.length; index += 1) {
          const lesson = orderedLessons[index];
          const createdLesson = await tx.playlistLesson.create({
            data: {
              playlistId: playlist.id,
              title: lesson.title,
              summary: lesson.summary,
              order: index + 1,
            },
          });

          const videoIds = Array.from(new Set(lesson.videoIds.filter((videoId) => videoId.length > 0)));
          if (videoIds.length === 0) {
            continue;
          }

          await tx.playlistVideo.updateMany({
            where: {
              playlistId: playlist.id,
              youtubeVideoId: {
                in: videoIds,
              },
            },
            data: {
              lessonId: createdLesson.id,
            },
          });
        }

        return playlist;
      });
    }),

  update: authedProcedure
    .input(updatePlaylistInput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const hasUpdate = Object.values(data).some((value) => value !== undefined);

      if (!hasUpdate) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No update fields provided",
        });
      }

      const playlist = await prisma.playlist.findFirst({
        where: {
          id,
          userId: ctx.user.id,
        },
        select: { id: true },
      });

      if (!playlist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playlist not found",
        });
      }

      return prisma.playlist.update({
        where: { id },
        data,
      });
    }),

  delete: authedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const playlist = await prisma.playlist.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
        select: { id: true },
      });

      if (!playlist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Playlist not found",
        });
      }

      await prisma.playlist.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
