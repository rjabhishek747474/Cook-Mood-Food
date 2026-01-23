import * as React from "react"

import { cn } from "@/lib/utils"

const inputVariants = {
  default: "border-3 border-foreground bg-background text-foreground placeholder:text-muted-foreground placeholder:uppercase placeholder:tracking-wide focus:shadow-[4px_4px_0_0_hsl(var(--primary))] focus:outline-none",
  search: "border-3 border-foreground bg-background text-foreground placeholder:text-muted-foreground placeholder:uppercase placeholder:tracking-wide focus:shadow-[4px_4px_0_0_hsl(var(--primary))] focus:outline-none pl-12",
}

function Input({
  className,
  type,
  variant = "default",
  ...props
}: React.ComponentProps<"input"> & { variant?: keyof typeof inputVariants }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-12 w-full px-4 py-3 text-base font-medium transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        inputVariants[variant],
        className
      )}
      {...props}
    />
  )
}

// Search Input with icon
function SearchInput({
  className,
  icon,
  ...props
}: React.ComponentProps<"input"> & { icon?: React.ReactNode }) {
  return (
    <div className="relative w-full">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </div>
      )}
      <input
        type="search"
        data-slot="input"
        className={cn(
          "flex h-14 w-full px-4 py-3 text-base font-medium transition-all border-3 border-foreground bg-background text-foreground placeholder:text-muted-foreground placeholder:uppercase placeholder:tracking-wide focus:shadow-[4px_4px_0_0_hsl(var(--primary))] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          icon && "pl-12",
          className
        )}
        {...props}
      />
    </div>
  )
}

export { Input, SearchInput }
