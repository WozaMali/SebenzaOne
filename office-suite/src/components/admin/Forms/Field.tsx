'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FieldProps {
  label: string
  name: string
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'switch'
  placeholder?: string
  value?: any
  onChange?: (value: any) => void
  error?: string
  helpText?: string
  required?: boolean
  disabled?: boolean
  options?: { value: string; label: string }[]
  className?: string
  tooltip?: string
}

export function Field({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helpText,
  required = false,
  disabled = false,
  options = [],
  className,
  tooltip
}: FieldProps) {
  const hasError = !!error
  const isValid = !hasError && value && value.toString().length > 0

  const renderInput = () => {
    const commonProps = {
      id: name,
      name,
      value: value || '',
      onChange: (e: any) => onChange?.(e.target.value),
      disabled,
      className: cn(
        "transition-all duration-200",
        hasError && "border-red-500 focus:border-red-500",
        isValid && "border-emerald-500 focus:border-emerald-500"
      )
    }

    switch (type) {
      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            placeholder={placeholder}
            rows={4}
            className={cn(commonProps.className, "resize-none")}
          />
        )
      
      case 'select':
        return (
          <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger className={cn(commonProps.className)}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={name}
              checked={value || false}
              onCheckedChange={onChange}
              disabled={disabled}
            />
            <Label htmlFor={name} className="text-sm font-medium">
              {label}
            </Label>
          </div>
        )
      
      case 'switch':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={name}
              checked={value || false}
              onCheckedChange={onChange}
              disabled={disabled}
            />
            <Label htmlFor={name} className="text-sm font-medium">
              {label}
            </Label>
          </div>
        )
      
      default:
        return (
          <Input
            {...commonProps}
            type={type}
            placeholder={placeholder}
          />
        )
    }
  }

  if (type === 'checkbox' || type === 'switch') {
    return (
      <div className={cn("space-y-2", className)}>
        {renderInput()}
        {helpText && (
          <p className="text-xs text-muted-foreground">{helpText}</p>
        )}
        {error && (
          <div className="flex items-center gap-1 text-xs text-red-400">
            <AlertCircle className="h-3 w-3" />
            {error}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <Label 
          htmlFor={name} 
          className={cn(
            "text-sm font-medium",
            hasError && "text-red-400",
            isValid && "text-emerald-400"
          )}
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </Label>
        
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className="relative">
        {renderInput()}
        {isValid && (
          <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-400" />
        )}
      </div>

      {helpText && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}
      
      {error && (
        <div className="flex items-center gap-1 text-xs text-red-400">
          <AlertCircle className="h-3 w-3" />
          {error}
        </div>
      )}
    </div>
  )
}
