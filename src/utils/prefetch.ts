import { prefetch, trpc } from "@/trpc/server";

export const prefetchPlaylistList = () => {
    return prefetch(trpc.playlist.list.queryOptions());
};

export const prefetchPlaylistById = (id: string) => {
    return prefetch(trpc.playlist.byId.queryOptions({ id }));   
}