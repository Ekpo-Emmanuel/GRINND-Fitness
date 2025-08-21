import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        primary:
          "rounded-lg font-semibold text-[var(--ds-on-accent)] border-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg bg-gradient-to-br from-[var(--ds-gradient-purple-from)] to-[var(--ds-gradient-purple-to)]",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border text-black dark:text-white bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        purple:
          "bg-[var(--ds-accent-purple)] text-[var(--ds-on-accent)] border-2 border-[var(--ds-accent-purple)] shadow-sm hover:bg-[var(--ds-accent-purple)]/90 transition-all",
        "outline-purple":
          "bg-[var(--ds-surface)] text-[color:var(--ds-text-primary)] border-2 border-[color:var(--ds-border)] hover:border-[var(--ds-accent-purple)] hover:bg-[var(--ds-surface-elevated)] transition-all",
        accent:
          "bg-[var(--ds-accent-purple)]/10 text-[var(--ds-accent-purple)] hover:bg-[var(--ds-accent-purple)]/20 border border-[var(--ds-accent-purple)]/30 font-medium transition-all",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        back: "rounded-full border border-[color:var(--ds-border)] bg-[var(--ds-surface-elevated)] text-[color:var(--ds-text-primary)] hover:bg-[var(--ds-bg-secondary)] transition-colors",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        xl: "h-12 px-6 rounded-md",
        tag: "h-auto px-3 py-1 text-sm font-medium rounded-md",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
