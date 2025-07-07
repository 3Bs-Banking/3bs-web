"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        // Base style
        "inline-flex items-center justify-center p-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-lg shadow-inner w-fit mx-auto",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // Inactive base
        "text-white/70 hover:text-white hover:bg-white/10",
        // Active state
        "data-[state=active]:text-white data-[state=active]:shadow-md",
        "data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#9F5FFF] data-[state=active]:to-[#FF3CAC]",
        // Common layout
        "px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 inline-flex items-center gap-2 cursor-pointer",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
