import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center border-2 px-3 py-1 text-xs font-bold uppercase tracking-wide w-fit whitespace-nowrap shrink-0 [&>svg]:size-3.5 gap-1.5 [&>svg]:pointer-events-none transition-all overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-foreground bg-primary text-primary-foreground hover:shadow-[2px_2px_0_0_hsl(var(--foreground))]",
        secondary:
          "border-foreground bg-secondary text-secondary-foreground hover:bg-primary",
        destructive:
          "border-foreground bg-destructive text-white",
        outline:
          "border-foreground bg-background text-foreground hover:bg-primary",
        cta:
          "border-foreground bg-[#E85C3D] text-white hover:brightness-110",
        category:
          "border-foreground bg-background text-foreground hover:bg-primary cursor-pointer",
        active:
          "border-foreground bg-foreground text-background",
        // Filter tab style (horizontal scrollable)
        filter:
          "border-2 border-foreground bg-background text-foreground hover:bg-primary cursor-pointer px-4 py-2 text-xs font-semibold",
        filterActive:
          "border-2 border-foreground bg-foreground text-background cursor-pointer px-4 py-2 text-xs font-semibold",
        // NEW badge (positioned absolute)
        new:
          "border-2 border-foreground bg-[#E85C3D] text-white text-[10px] px-2 py-0.5 absolute -top-2 -right-2",
        // Burned badge (orange with money)
        burned:
          "border-foreground bg-[#E85C3D] text-white font-mono",
        // Category tag (like FINTECH, SOCIAL in design)
        tag:
          "border-foreground bg-background text-foreground",
        // Year badge
        year:
          "border-0 bg-transparent text-muted-foreground font-mono text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

// Filter Tab Badge with Icon
interface FilterBadgeProps extends React.ComponentProps<"button"> {
  icon?: React.ReactNode;
  active?: boolean;
}

function FilterBadge({
  className,
  icon,
  active = false,
  children,
  ...props
}: FilterBadgeProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wide border-2 border-foreground transition-all whitespace-nowrap shrink-0",
        active
          ? "bg-foreground text-background"
          : "bg-background text-foreground hover:bg-primary",
        className
      )}
      {...props}
    >
      {icon && <span className="[&>svg]:size-3.5">{icon}</span>}
      {children}
    </button>
  )
}

export { Badge, badgeVariants, FilterBadge }
