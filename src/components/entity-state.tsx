import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type EntityHeaderProps = {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function EntityHeader({
  title,
  description,
  className,
}: EntityHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 bg-background/95 pb-6 lg:flex-row lg:items-center lg:justify-between",
        className
      )}
    >
      <div className="min-w-0 space-y-1">
        <h1 className="font-heading text-xl font-bold tracking-normal text-foreground sm:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    
    </div>
  )
}


