'use client'

import React from 'react'
import { Check, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  id: string
  title: string
  description?: string
  completed?: boolean
}

interface StepNavProps {
  steps: Step[]
  currentStep: string
  onStepClick?: (stepId: string) => void
  className?: string
}

export function StepNav({ steps, currentStep, onStepClick, className }: StepNavProps) {
  const currentIndex = steps.findIndex(step => step.id === currentStep)

  return (
    <nav className={cn("flex items-center space-x-4", className)}>
      {steps.map((step, index) => {
        const isCompleted = step.completed || index < currentIndex
        const isCurrent = step.id === currentStep
        const isClickable = onStepClick && (isCompleted || isCurrent)

        return (
          <React.Fragment key={step.id}>
            <div
              className={cn(
                "flex items-center space-x-2",
                isClickable && "cursor-pointer hover:opacity-80"
              )}
              onClick={() => isClickable && onStepClick?.(step.id)}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200",
                  isCompleted && "bg-emerald-500 text-white",
                  isCurrent && !isCompleted && "bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500",
                  !isCurrent && !isCompleted && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              
              <div className="flex flex-col">
                <span
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isCurrent && "text-emerald-400",
                    isCompleted && "text-foreground",
                    !isCurrent && !isCompleted && "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
                {step.description && (
                  <span className="text-xs text-muted-foreground">
                    {step.description}
                  </span>
                )}
              </div>
            </div>

            {index < steps.length - 1 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
