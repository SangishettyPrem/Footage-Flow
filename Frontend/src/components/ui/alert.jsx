import React from "react"
import { cn } from "../../lib/utils"

const Alert = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
    const variants = {
        default: "bg-background text-foreground border-border",
        destructive: "bg-red-50 text-red-900 border-red-200",
        success: "bg-green-50 text-green-900 border-green-200",
        warning: "bg-yellow-50 text-yellow-900 border-yellow-200",
    }

    return (
        <div
            ref={ref}
            role="alert"
            className={cn("relative w-full rounded-lg border p-4", variants[variant], className)}
            {...props}
        />
    )
})
Alert.displayName = "Alert"

export { Alert }
