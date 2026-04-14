import { prisma } from "@/lib/prisma";
import { buildTranscriptChunks } from "@/lib/transcript";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { authedProcedure, createTRPCRouter } from "../init";
import { YoutubeTranscript } from "@danielxceron/youtube-transcript";

const videoAccessInput = z.object({
    playlistId: z.cuid(),
    videoId: z.cuid(),
});

async function getOwnedVideo(params: {
    userId: string;
    playlistId: string;
    videoId: string;
}) {
    const { playlistId, userId, videoId } = params;

    const video = await prisma.playlistVideo.findFirst({
        where: {
            id: videoId,
            playlistId,
            playlist: {
                userId,
            },
        },
        select: {
            id: true,
            playlistId: true,
            youtubeVideoId: true,
            transcription: true,
        },
    });

    if (!video) {
        throw new TRPCError({
            code: "NOT_FOUND",
            message: "Video not found",
        });
    }

    return video;
}

export const videoRouter = createTRPCRouter({
    getTranscriptState: authedProcedure.input(videoAccessInput).query(async ({ ctx, input }) => {
        const video = await getOwnedVideo({
            userId: ctx.user.id,
            playlistId: input.playlistId,
            videoId: input.videoId,
        });

        const [videoWithCounts, artifacts] = await Promise.all([
            prisma.playlistVideo.findUnique({
                where: {
                    id: video.id,
                },
                select: {
                    _count: {
                        select: {
                            transcriptChunks: true,
                        },
                    },
                },
            }),
            prisma.artifact.findMany({
                where: {
                    playlistVideoId: video.id,
                },
                select: {
                    id: true,
                    type: true,
                    updatedAt: true,
                },
                orderBy: {
                    updatedAt: "desc",
                },
            }),
        ]);

        const chunkCount = videoWithCounts?._count.transcriptChunks ?? 0;

        return {
            videoId: video.id,
            youtubeVideoId: video.youtubeVideoId,
            hasTranscription: Boolean(video.transcription),
            chunkCount,
            artifacts,
        };
    }),

    ensureTranscriptChunks: authedProcedure
        .input(
            videoAccessInput.extend({
                forceRefresh: z.boolean().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const video = await getOwnedVideo({
                userId: ctx.user.id,
                playlistId: input.playlistId,
                videoId: input.videoId,
            });

            if (!video.youtubeVideoId) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Video has no YouTube ID",
                });
            }

            if (!input.forceRefresh) {
                const videoWithCounts = await prisma.playlistVideo.findUnique({
                    where: {
                        id: video.id,
                    },
                    select: {
                        _count: {
                            select: {
                                transcriptChunks: true,
                            },
                        },
                    },
                });
                const existingChunkCount = videoWithCounts?._count.transcriptChunks ?? 0;

                if (video.transcription && existingChunkCount > 0) {
                    return {
                        videoId: video.id,
                        source: "database" as const,
                        chunkCount: existingChunkCount,
                        transcriptionLength: video.transcription.length,
                    };
                }
            }

            const transcriptItems = await YoutubeTranscript.fetchTranscript(video.youtubeVideoId);
            const { fullText, chunks } = await buildTranscriptChunks({
                transcriptItems,
            });

            if (fullText.length === 0 || chunks.length === 0) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Transcript is empty for this video",
                });
            }

            await prisma.$transaction(async (tx) => {
                await tx.playlistVideo.update({
                    where: {
                        id: video.id,
                    },
                    data: {
                        transcription: fullText,
                        transcriptChunks: {
                            deleteMany: {},
                            createMany: {
                                data: chunks.map((chunk) => ({
                                    chunkIndex: chunk.chunkIndex,
                                    text: chunk.text,
                                    startTime: chunk.startTime,
                                    endTime: chunk.endTime,
                                    tokenCount: chunk.tokenCount,
                                })),
                            },
                        },
                    },
                });
            });

            return {
                videoId: video.id,
                source: "youtube" as const,
                chunkCount: chunks.length,
                transcriptionLength: fullText.length,
            };
        }),

    listTranscriptChunks: authedProcedure.input(videoAccessInput).query(async ({ ctx, input }) => {
        const video = await getOwnedVideo({
            userId: ctx.user.id,
            playlistId: input.playlistId,
            videoId: input.videoId,
        });

        const videoWithChunks = await prisma.playlistVideo.findUnique({
            where: {
                id: video.id,
            },
            select: {
                transcriptChunks: {
                    orderBy: {
                        chunkIndex: "asc",
                    },
                    select: {
                        id: true,
                        chunkIndex: true,
                        startTime: true,
                        endTime: true,
                        tokenCount: true,
                        text: true,
                    },
                },
            },
        });

        return videoWithChunks?.transcriptChunks ?? [];
    }),

});