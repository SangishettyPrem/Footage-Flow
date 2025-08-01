"use client"

import React from "react"
import { cn } from "../../lib/utils"

const Tabs = ({ defaultValue, value, onValueChange, children, className, ...props }) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue || value)

  const handleTabChange = (newValue) => {
    setActiveTab(newValue)
    onValueChange?.(newValue)
  }

  // Only pass onTabChange to TabsTrigger children
  return (
    <div className={cn("w-full", className)} {...props}>
      {React.Children.map(children, (child) => {
        if (child.type && child.type.displayName === "TabsList") {
          // Pass activeTab and handleTabChange to TabsList
          return React.cloneElement(child, { activeTab, handleTabChange })
        }
        return React.cloneElement(child, { activeTab })
      })}
    </div>
  )
}

const TabsList = React.forwardRef(({ className, children, activeTab, handleTabChange, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className,
    )}
    {...props}
  >
    {React.Children.map(children, (child) => {
      if (child.type && child.type.displayName === "TabsTrigger") {
        return React.cloneElement(child, { activeTab, onTabChange: handleTabChange })
      }
      return React.cloneElement(child, { activeTab })
    })}
  </div>
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef(({ className, value, children, activeTab, onTabChange, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      activeTab === value ? "bg-background text-foreground shadow-sm" : "hover:bg-background/50",
      className,
    )}
    onClick={() => onTabChange?.(value)}
    {...props}
  >
    {children}
  </button>
))
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef(({ className, value, children, activeTab, ...props }, ref) => {
  if (activeTab !== value) return null

  return (
    <div
      ref={ref}
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
