// *Depreciate notes router and related code, as the notes feature is being removed in favor of a more flexible course structure. The notes router and its dependencies will be removed in a future release after the notes feature has been fully deprecated and removed from the UI.*

// import { prisma } from "@/lib/prisma";
// import { z } from "zod";
// import { authedProcedure, createTRPCRouter } from "../init";

// export const notesRouter = createTRPCRouter({
//   getVideoNotes: authedProcedure
//     .input( z.object({
//         playlistvideoId: z.string(),
//     }))
//     .query(async ({ input }) => {
//         const { playlistvideoId } = input;
//         const notes = await prisma.playlistNotes.findMany({
//             where: { playlistvideoId },
//             orderBy: { createdAt: "asc" },
//         });

//         return notes;
//     }),

//     addVideoNote: authedProcedure.input( z.object({
//         playlistvideoId: z.string(),
//         content: z.string(),
//         timestamp: z.string(),
//     })).mutation(async ({ input }) => {
//         const { playlistvideoId, content, timestamp } = input;
//         const note = await prisma.playlistNotes.create({
//             data: {
//                 playlistvideoId,
//                 content,
//                 timestamp,
//             },
//         });
//         return note;
//     }),
//     deleteVideoNote: authedProcedure.input( z.object({
//         noteId: z.string(),
//     })).mutation(async ({ input }) => {
//         const { noteId } = input;
//         await prisma.playlistNotes.delete({
//             where: { id: noteId },
//         });
//         return { success: true };
//     }),
// });