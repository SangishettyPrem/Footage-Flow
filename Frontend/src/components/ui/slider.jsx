"use client"

import React from "react"
import { cn } from "../../lib/utils"

const Slider = React.forwardRef(({ className, value = [0], onValueChange, max = 100, step = 1, ...props }, ref) => {
  const handleChange = (e) => {
    const newValue = [Number(e.target.value)]
    onValueChange?.(newValue)
  }

  return (
    <div className={cn("relative flex w-full touch-none select-none items-center", className)} {...props}>
      <input
        ref={ref}
        type="range"
        min={0}
        max={max}
        step={step}
        value={value[0]}
        onChange={handleChange}
        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer slider"
      />
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: hsl(var(--primary));
          cursor: pointer;
          border: 2px solid hsl(var(--background));
          box-shadow: 0 0 0 1px hsl(var(--border));
        }
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: hsl(var(--primary));
          cursor: pointer;
          border: 2px solid hsl(var(--background));
          box-shadow: 0 0 0 1px hsl(var(--border));
        }
      `}</style>
    </div>
  )
})
Slider.displayName = "Slider"

export { Slider }
