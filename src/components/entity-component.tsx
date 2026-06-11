import type { ComponentType, ReactNode, SVGProps } from "react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { cn } from "@/lib/utils"

export const EntityHeader = ({
  title,
  description,
  action,
}: {
  title: React.ReactNode
  description: string
  action?: React.ReactNode
}) => {
  return (
    <div className="flex w-full flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0 flex-1 space-y-1.5">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {title}
        </h1>

        <p className="text-muted-foreground text-base">
          {description}
        </p>
      </div>

      {action && (
        <div className="shrink-0 items-center hidden sm:flex lg:justify-end">
          {action}
        </div>
      )}
    </div>
  )
}



type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

interface EmptyStateAction {
  label: string
  onClick: () => void
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive"
}

interface EmptyStateProps {
  /** Icon component to render (e.g. from @tabler/icons-react) */
  icon?: IconComponent
  /** Main heading text */
  title: string
  /** Supporting description text */
  description?: string
  /** Primary action button */
  action?: EmptyStateAction
  /** Secondary action button */
  secondaryAction?: EmptyStateAction
  /** Custom content below the description */
  children?: ReactNode
  /** Additional class names for the root container */
  className?: string
  /** Whether to show a dashed border around the empty state */
  bordered?: boolean
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  children,
  className,
  bordered = false,
}: EmptyStateProps) {
  return (
    <Empty
      className={cn("flex-1 m-4 p-8 flex flex-col items-center justify-center gap-6", bordered && "border border-dashed", className)}
    >
      <EmptyHeader className="flex flex-col items-center text-center gap-2">
        {Icon && (
          <EmptyMedia variant="icon" className="mb-4">
            <Icon className="h-10 w-10 text-muted-foreground" />
          </EmptyMedia>
        )}
        <EmptyTitle className="text-xl font-semibold">{title}</EmptyTitle>
        {description && <EmptyDescription className="text-muted-foreground text-sm max-w-md">{description}</EmptyDescription>}
      </EmptyHeader>

      {(action || secondaryAction || children) && (
        <EmptyContent className="flex flex-col items-center gap-6 mt-4">
          {children}
          {(action || secondaryAction) && (
            <div className="flex flex-row items-center gap-4">
              {action && (
                <Button
                  variant={action.variant ?? "default"}
                  size="sm"
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              )}
              {secondaryAction && (
                <Button
                  variant={secondaryAction.variant ?? "outline"}
                  size="sm"
                  onClick={secondaryAction.onClick}
                >
                  {secondaryAction.label}
                </Button>
              )}
            </div>
          )}
        </EmptyContent>
      )}
    </Empty>
  )
}