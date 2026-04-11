"use client";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
    InputGroupText,
} from "@/components/ui/input-group";
import { IconArrowRight, IconBrandYoutubeFilled } from "@tabler/icons-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { z } from 'zod';
import { usePlaylistCreate } from "../playlist/hooks/use-playlist";
import { Spinner } from "@/components/ui/spinner";

 const youtubePlaylistSchema = z
  .url({ message: 'Please enter a valid URL' })
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);

        // Must be youtube.com (covers www.youtube.com and music.youtube.com)
        const hostname = parsed.hostname.toLowerCase();
        if (!hostname.endsWith('youtube.com')) {
          return false;
        }

        // Must be the dedicated playlist page
        if (parsed.pathname.toLowerCase() !== '/playlist') {
          return false;
        }

        // Must have a valid `list` parameter (playlist ID)
        const listId = parsed.searchParams.get('list');
        if (!listId) return false;

        // YouTube playlist IDs always start with "PL" and are long enough
        return listId.startsWith('PL') && listId.length >= 16;
      } catch {
        return false; // invalid URL (should never reach here because of .url())
      }
    },
    {
      message: 'Must be a valid YouTube playlist URL (e.g. https://www.youtube.com/playlist?list=PL...)',
    }
  );


export const PlaylistUrlInput = () => {
    const { mutateAsync  , isPending } = usePlaylistCreate();
    const [url, setUrl] = useState("");
        const handleConvert = useCallback(() => {
     try {
        const result = youtubePlaylistSchema.safeParse(url);
        if (!result.success) {
          throw result.error; 
        }
        mutateAsync({ title: "New Playlist", sourceUrl: url , ownerName: "Akshay" });
        toast.success("Valid playlist URL! Starting conversion...");
        console.log("Valid playlist URL:", result);
         
     } catch (error) {
        if (error instanceof z.ZodError) {
          toast.error(`Validation errors: ${error.cause}`);
          // Display error messages to the user as needed
        }
     }
    } , [url , mutateAsync]);
   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();        // prevents form submit if inside <form>
      handleConvert();
    }
  };
 

            
    return (
          <InputGroup className="h-12 rounded-xl shadow-md">
                  <InputGroupAddon align="inline-start" className="pl-3">
                    <InputGroupText>
                      <IconBrandYoutubeFilled className="size-5 text-red-500" />
                    </InputGroupText>
                  </InputGroupAddon>
        
                  <InputGroupInput
                    type="url"
                    value={url}
                      onKeyDown={handleKeyDown}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste a YouTube playlist URL…"
                    className="text-sm h-full px-3"
                  />
        
                  <InputGroupAddon align="inline-end" className="pr-1.5">
                    <InputGroupButton
                    disabled={isPending}
                      variant="default"
                      className="h-10 gap-1.5 rounded-full px-4 text-sm font-semibold"
                      onClick={handleConvert}
                    >
                  
                        <p className="font-bold text-sm">Convert</p>
                            {isPending ? <Spinner /> :   <IconArrowRight className="size-4" />} 
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
    )
}