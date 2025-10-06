'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Condition {
  id: string
  field: string
  operator: string
  value: string
  type: 'and' | 'or'
}

interface ConditionBuilderProps {
  conditions: Condition[]
  onConditionsChange: (conditions: Condition[]) => void
  className?: string
}

const fieldOptions = [
  { value: 'sender', label: 'Sender' },
  { value: 'recipient', label: 'Recipient' },
  { value: 'subject', label: 'Subject' },
  { value: 'body', label: 'Body Content' },
  { value: 'attachment_name', label: 'Attachment Name' },
  { value: 'attachment_size', label: 'Attachment Size' },
  { value: 'header', label: 'Header' },
  { value: 'domain', label: 'Domain' }
]

const operatorOptions = [
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Does not contain' },
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Does not equal' },
  { value: 'starts_with', label: 'Starts with' },
  { value: 'ends_with', label: 'Ends with' },
  { value: 'regex', label: 'Regex match' },
  { value: 'greater_than', label: 'Greater than' },
  { value: 'less_than', label: 'Less than' }
]

export function ConditionBuilder({ 
  conditions, 
  onConditionsChange, 
  className 
}: ConditionBuilderProps) {
  const [newCondition, setNewCondition] = useState<Partial<Condition>>({
    field: '',
    operator: '',
    value: '',
    type: 'and'
  })

  const addCondition = () => {
    if (newCondition.field && newCondition.operator && newCondition.value) {
      const condition: Condition = {
        id: `condition-${Date.now()}`,
        field: newCondition.field,
        operator: newCondition.operator,
        value: newCondition.value,
        type: newCondition.type || 'and'
      }
      
      onConditionsChange([...conditions, condition])
      setNewCondition({ field: '', operator: '', value: '', type: 'and' })
    }
  }

  const removeCondition = (id: string) => {
    onConditionsChange(conditions.filter(c => c.id !== id))
  }

  const updateCondition = (id: string, updates: Partial<Condition>) => {
    onConditionsChange(conditions.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ))
  }

  const getOperatorOptions = (field: string) => {
    if (field === 'attachment_size') {
      return operatorOptions.filter(op => 
        ['greater_than', 'less_than', 'equals', 'not_equals'].includes(op.value)
      )
    }
    return operatorOptions
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Conditions</h3>
        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
          {conditions.length} condition{conditions.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Existing Conditions */}
      {conditions.length > 0 && (
        <div className="space-y-2">
          {conditions.map((condition, index) => (
            <Card key={condition.id} className="bg-surface border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {index > 0 && (
                    <Badge 
                      variant={condition.type === 'and' ? 'default' : 'secondary'}
                      className={cn(
                        "text-xs",
                        condition.type === 'and' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      )}
                    >
                      {condition.type.toUpperCase()}
                    </Badge>
                  )}
                  
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Select
                      value={condition.field}
                      onValueChange={(value) => updateCondition(condition.id, { field: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Field" />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={condition.operator}
                      onValueChange={(value) => updateCondition(condition.id, { operator: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Operator" />
                      </SelectTrigger>
                      <SelectContent>
                        {getOperatorOptions(condition.field).map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex gap-2">
                      <Input
                        value={condition.value}
                        onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                        placeholder="Value"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCondition(condition.id)}
                        className="h-9 w-9 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Condition */}
      <Card className="bg-muted/30 border-dashed border-border">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Add Condition</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Select
                value={newCondition.field}
                onValueChange={(value) => setNewCondition(prev => ({ ...prev, field: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {fieldOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={newCondition.operator}
                onValueChange={(value) => setNewCondition(prev => ({ ...prev, operator: value }))}
                disabled={!newCondition.field}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Operator" />
                </SelectTrigger>
                <SelectContent>
                  {getOperatorOptions(newCondition.field || '').map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                value={newCondition.value}
                onChange={(e) => setNewCondition(prev => ({ ...prev, value: e.target.value }))}
                placeholder="Value"
                disabled={!newCondition.operator}
              />

              <Button
                onClick={addCondition}
                disabled={!newCondition.field || !newCondition.operator || !newCondition.value}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
