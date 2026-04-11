import { prefetch, trpc } from "@/trpc/server";

export const prefetchPlaylistList = () => {
    return prefetch(trpc.playlist.list.queryOptions());
};
