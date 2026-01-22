import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 border-3 border-foreground py-6 transition-all hover:shadow-[4px_4px_0_0_hsl(var(--foreground))]",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-bold uppercase tracking-wide", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

// Featured card with yellow background
function CardFeatured({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-primary text-primary-foreground flex flex-col gap-6 border-3 border-foreground py-6 transition-all hover:shadow-[6px_6px_0_0_hsl(var(--foreground))]",
        className
      )}
      {...props}
    />
  )
}

// Pastel section cards
function CardSectionBlue({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-section-blue text-foreground flex flex-col gap-4 border-l-4 border-l-[#00B4D8] py-4 px-5",
        className
      )}
      {...props}
    />
  )
}

function CardSectionGreen({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-section-green text-foreground flex flex-col gap-4 border-l-4 border-l-[#00D4AA] py-4 px-5",
        className
      )}
      {...props}
    />
  )
}

function CardSectionPink({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-section-pink text-foreground flex flex-col gap-4 border-l-4 border-l-[#FF6B9D] py-4 px-5",
        className
      )}
      {...props}
    />
  )
}

function CardSectionCoral({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-section-coral text-foreground flex flex-col gap-4 border-l-4 border-l-[#E85C3D] py-4 px-5",
        className
      )}
      {...props}
    />
  )
}

// Tilted card variant
function CardTilted({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 border-3 border-foreground py-6 -rotate-1 transition-all hover:rotate-0 hover:shadow-[4px_4px_0_0_hsl(var(--foreground))]",
        className
      )}
      {...props}
    />
  )
}

// Dark modal card
function CardDark({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-foreground text-background flex flex-col gap-6 border-3 border-primary py-6",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  CardFeatured,
  CardSectionBlue,
  CardSectionGreen,
  CardSectionPink,
  CardSectionCoral,
  CardTilted,
  CardDark,
}
