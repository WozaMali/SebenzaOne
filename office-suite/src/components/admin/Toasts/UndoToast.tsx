'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, Undo, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UndoToastProps {
  message: string
  onUndo: () => void
  onDismiss: () => void
  duration?: number
  className?: string
}

export function UndoToast({ 
  message, 
  onUndo, 
  onDismiss, 
  duration = 10000,
  className 
}: UndoToastProps) {
  const [timeLeft, setTimeLeft] = useState(duration / 1000)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsVisible(false)
          setTimeout(onDismiss, 300) // Allow fade out animation
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [onDismiss])

  const handleUndo = () => {
    onUndo()
    setIsVisible(false)
    setTimeout(onDismiss, 300)
  }

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(onDismiss, 300)
  }

  if (!isVisible) return null

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-50 transition-all duration-300",
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
      className
    )}>
      <Card className="bg-surface border-border/50 shadow-lg backdrop-blur-md">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{message}</p>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Undo expires in {timeLeft}s
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
              >
                <Undo className="h-3 w-3 mr-1" />
                Undo
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
