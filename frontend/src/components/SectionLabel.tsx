import { type HTMLAttributes, type ReactNode } from "react"
import { cn } from "../lib/utils"
import { motion } from "framer-motion"

interface SectionLabelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  pulse?: boolean
}

export function SectionLabel({ className, children, pulse = false, ...props }: SectionLabelProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 rounded-full border border-accent/30 bg-accent/5 px-5 py-2",
        className
      )}
      {...props}
    >
      {pulse && (
        <motion.span
          className="h-2 w-2 rounded-full bg-accent"
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      {!pulse && <span className="h-2 w-2 rounded-full bg-accent" />}
      <span className="font-mono text-xs uppercase tracking-[0.15em] text-accent">
        {children}
      </span>
    </div>
  )
}