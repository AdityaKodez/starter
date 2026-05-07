
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
