import { Button } from "@/components/ui/button";
import { IconShare } from "@tabler/icons-react";
import { IconStackPerspective } from "nucleo-glass";
export function VideoHeader({ title }: { title: string }) {
    return (
        <div className="space-y-1 flex items-center justify-between">
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            <div className="flex item-center gap-2">
                <Button type="button" size={"lg"}>
                    <IconStackPerspective />
                  Add Note</Button>
               <Button variant="ghost" size="icon">
               <IconShare />
                </Button>
            </div>
        </div>
    );
}