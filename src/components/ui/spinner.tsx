import { cn } from "@/lib/utils";
import { IconLoader3 } from "@tabler/icons-react";
import { type SVGProps } from "react";
function Spinner({ className, ...props }: SVGProps<SVGSVGElement>) {
  return <IconLoader3 className={cn("animate-spin", className)} {...props} />;
}

export { Spinner };
