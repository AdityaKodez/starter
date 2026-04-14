import { Progress } from "@/components/ui/progress";
import { Field , FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
export const VideoProgress = ({ progress , total , isLoading }: { progress: number; total: number , isLoading?: boolean }) => {

  return (
    <Field className="w-full max-w-sm py-4">
        {isLoading ? (
            <Skeleton className="h-4 w-full" />
        ) : progress === 0 ? "No videos in playlist" : 
            <>
            <FieldLabel className="text-xs text-muted-foreground mb-1 ml-auto">
               <p className="text-xs">{total} videos</p>
               <span className="ml-auto">
                {Math.round((progress / total) * 100)}% done
               </span>
            </FieldLabel>
            <Progress value={progress} className="w-full" /> 
            </>
            
        }
        
    </Field>
  );
}