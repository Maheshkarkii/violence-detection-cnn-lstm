import { type ButtonHTMLAttributes, forwardRef } from "react"
import { cn } from "../lib/utils"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger"
  size?: "sm" | "md" | "lg"
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
    
    const variants = {
      primary: "gradient-bg text-white shadow-sm hover:shadow-accent-lg hover:-translate-y-0.5 hover:brightness-110",
      secondary: "bg-transparent border border-border text-foreground hover:border-accent/30 hover:shadow-md hover:bg-muted",
      ghost: "bg-transparent text-muted-foreground hover:text-foreground",
      outline: "bg-transparent border border-border text-foreground hover:border-accent hover:bg-accent/5",
      danger: "bg-red-500 text-white hover:bg-red-600 border-none"
    }
    
    const sizes = {
      sm: "h-10 px-4 text-sm",
      md: "h-12 px-6 text-base",
      lg: "h-14 px-8 text-lg"
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"