import { prisma } from "@/lib/prisma";
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
  title: z.string().min(1).max(255),
  thumbnail: z.url().nullable().optional(),
  sourceUrl: z.url(),
  ownerName: z.string().min(1).max(255),
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
    .mutation(({ ctx, input }) => {
      return prisma.playlist.create({
        data: {
          id: crypto.randomUUID(),
          title: input.title,
          thumbnail: input.thumbnail,
          sourceUrl: input.sourceUrl,
          ownerName: input.ownerName,
          status: input.status,
          userId: ctx.user.id,
        },
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
