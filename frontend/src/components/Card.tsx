import { type HTMLAttributes, forwardRef } from "react"
import { cn } from "../lib/utils"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  gradient?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, hover = false, gradient = false, ...props }, ref) => {
    if (gradient) {
      return (
        <div className={cn("rounded-xl bg-gradient-to-br from-accent via-accent-secondary to-accent p-[2px]", className)}>
          <div className="h-full w-full rounded-[calc(12px-2px)] bg-card p-6">
            {children}
          </div>
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-border bg-card p-6 shadow-md transition-all duration-300",
          hover && "hover:shadow-xl hover:-translate-y-1",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = "Card"