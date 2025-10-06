'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
  icon?: React.ComponentType<any>
  badge?: number
  disabled?: boolean
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
  variant?: 'default' | 'pills' | 'underline'
}

export function Tabs({ 
  tabs, 
  activeTab, 
  onTabChange, 
  className,
  variant = 'default'
}: TabsProps) {
  const getTabClassName = (tab: Tab) => {
    const baseClasses = "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200"
    const isActive = activeTab === tab.id
    const isDisabled = tab.disabled

    switch (variant) {
      case 'pills':
        return cn(
          baseClasses,
          "rounded-full",
          isActive && "bg-emerald-500 text-white",
          !isActive && !isDisabled && "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          isDisabled && "text-muted-foreground/50 cursor-not-allowed"
        )
      
      case 'underline':
        return cn(
          baseClasses,
          "border-b-2 border-transparent",
          isActive && "border-emerald-500 text-emerald-400",
          !isActive && !isDisabled && "text-muted-foreground hover:text-foreground hover:border-muted-foreground/50",
          isDisabled && "text-muted-foreground/50 cursor-not-allowed"
        )
      
      default:
        return cn(
          baseClasses,
          "rounded-lg",
          isActive && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
          !isActive && !isDisabled && "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          isDisabled && "text-muted-foreground/50 cursor-not-allowed"
        )
    }
  }

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => !tab.disabled && onTabChange(tab.id)}
          disabled={tab.disabled}
          className={getTabClassName(tab)}
        >
          {tab.icon && <tab.icon className="h-4 w-4" />}
          <span>{tab.label}</span>
          {tab.badge && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
