import { Progress } from "@/components/ui/progress";
import { Field , FieldLabel } from "@/components/ui/field";
export const VideoProgress = ({ progress , total }: { progress: number; total: number }) => {

  return (
    <Field className="w-full max-w-sm">
        {
            progress === 0 ? "No videos in playlist" : 
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