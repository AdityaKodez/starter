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

export const EntityHeader = ({ title , description , action ,  }: { title: React.ReactNode , description: string , action?: React.ReactNode}) => {
    return (
        <div className="w-full py-4  flex justify-evenly items-start gap-2">
        <div className="flex flex-col w-full items-start justify-between gap-2">
        
         <h1 className="font-display text-xl sm:text-2xl font-semibold tracking-tighter leading-tight">
                {title}
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
                {description}
            </p>
            {action && (
                <div className="w-full flex items-center justify-start py-4">
                    {action}
                </div>
            )}
        </div>
          
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
      className={cn("flex-1", bordered && "border border-dashed", className)}
    >
      <EmptyHeader>
        {Icon && (
          <EmptyMedia variant="icon">
            <Icon />
          </EmptyMedia>
        )}
        <EmptyTitle>{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>

      {(action || secondaryAction || children) && (
        <EmptyContent>
          {children}
          {(action || secondaryAction) && (
            <div className="flex items-center gap-2">
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