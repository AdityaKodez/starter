import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const usePlaylistVeiw = () => {
    const trpc = useTRPC();
    return useQuery(trpc.playlist.list.queryOptions())
}

export const usePlaylistCreate = () => {
    const trpc = useTRPC();
    return useMutation(trpc.playlist.create.mutationOptions({
        onError: (error) => {
              console.error("Failed to create playlist:", error);
              toast.error("Failed to create playlist. Please try again.");
        },
        
    }));
}