import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold uppercase tracking-wide transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default:
          "bg-background text-foreground border-3 border-foreground hover:bg-primary hover:shadow-[4px_4px_0_0_hsl(var(--foreground))] active:shadow-[2px_2px_0_0_hsl(var(--foreground))] active:translate-x-[2px] active:translate-y-[2px]",
        primary:
          "bg-primary text-primary-foreground border-3 border-foreground hover:shadow-[4px_4px_0_0_hsl(var(--foreground))] active:shadow-[2px_2px_0_0_hsl(var(--foreground))] active:translate-x-[2px] active:translate-y-[2px]",
        cta:
          "bg-[#E85C3D] text-white border-3 border-foreground hover:brightness-110 hover:shadow-[4px_4px_0_0_hsl(var(--foreground))] active:shadow-[2px_2px_0_0_hsl(var(--foreground))] active:translate-x-[2px] active:translate-y-[2px]",
        destructive:
          "bg-destructive text-white border-3 border-foreground hover:bg-destructive/90 hover:shadow-[4px_4px_0_0_hsl(var(--foreground))]",
        outline:
          "border-3 border-foreground bg-background hover:bg-primary hover:text-primary-foreground",
        secondary:
          "bg-secondary text-secondary-foreground border-3 border-foreground hover:bg-primary hover:shadow-[4px_4px_0_0_hsl(var(--foreground))]",
        ghost:
          "hover:bg-primary hover:text-primary-foreground border-2 border-transparent hover:border-foreground",
        link: "text-foreground underline-offset-4 hover:underline font-bold",
        skewed:
          "bg-primary text-primary-foreground border-3 border-foreground -rotate-2 hover:rotate-0 hover:shadow-[4px_4px_0_0_hsl(var(--foreground))] transition-transform",
        // Tilted banner button (like in the design)
        banner:
          "bg-[#1A3A5C] text-white border-3 border-black font-bold uppercase tracking-wider -rotate-3 hover:rotate-0 hover:shadow-[4px_4px_0_0_black] transition-all",
        // Yellow banner button
        bannerYellow:
          "bg-primary text-primary-foreground border-3 border-foreground font-bold uppercase tracking-wider -rotate-2 hover:rotate-0 hover:shadow-[4px_4px_0_0_hsl(var(--foreground))] transition-all",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-sm gap-1.5 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
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
  variant = "default",
  size = "default",
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
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
