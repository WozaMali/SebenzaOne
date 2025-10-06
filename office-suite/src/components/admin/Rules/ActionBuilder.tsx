'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Plus, X, Trash2, Mail, Archive, Trash2 as TrashIcon, Tag, Bell, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Action {
  id: string
  type: string
  target?: string
  value?: string
  enabled: boolean
}

interface ActionBuilderProps {
  actions: Action[]
  onActionsChange: (actions: Action[]) => void
  className?: string
}

const actionTypes = [
  { 
    value: 'route', 
    label: 'Route to Folder', 
    icon: Mail,
    description: 'Move email to specific folder',
    requiresTarget: true
  },
  { 
    value: 'quarantine', 
    label: 'Quarantine', 
    icon: Shield,
    description: 'Move email to quarantine for review',
    requiresTarget: false
  },
  { 
    value: 'tag', 
    label: 'Add Tag', 
    icon: Tag,
    description: 'Add a tag to the email',
    requiresTarget: true
  },
  { 
    value: 'archive', 
    label: 'Archive', 
    icon: Archive,
    description: 'Archive the email',
    requiresTarget: false
  },
  { 
    value: 'delete', 
    label: 'Delete', 
    icon: TrashIcon,
    description: 'Permanently delete the email',
    requiresTarget: false
  },
  { 
    value: 'bounce', 
    label: 'Bounce', 
    icon: X,
    description: 'Bounce the email back to sender',
    requiresTarget: false
  },
  { 
    value: 'notify', 
    label: 'Send Notification', 
    icon: Bell,
    description: 'Send notification to specified address',
    requiresTarget: true
  }
]

const folderOptions = [
  { value: 'inbox', label: 'Inbox' },
  { value: 'spam', label: 'Spam' },
  { value: 'quarantine', label: 'Quarantine' },
  { value: 'archive', label: 'Archive' },
  { value: 'trash', label: 'Trash' }
]

const tagOptions = [
  { value: 'important', label: 'Important' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'review', label: 'Review' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'automated', label: 'Automated' }
]

export function ActionBuilder({ 
  actions, 
  onActionsChange, 
  className 
}: ActionBuilderProps) {
  const [newAction, setNewAction] = useState<Partial<Action>>({
    type: '',
    target: '',
    value: '',
    enabled: true
  })

  const addAction = () => {
    if (newAction.type) {
      const action: Action = {
        id: `action-${Date.now()}`,
        type: newAction.type,
        target: newAction.target,
        value: newAction.value,
        enabled: newAction.enabled ?? true
      }
      
      onActionsChange([...actions, action])
      setNewAction({ type: '', target: '', value: '', enabled: true })
    }
  }

  const removeAction = (id: string) => {
    onActionsChange(actions.filter(a => a.id !== id))
  }

  const updateAction = (id: string, updates: Partial<Action>) => {
    onActionsChange(actions.map(a => 
      a.id === id ? { ...a, ...updates } : a
    ))
  }

  const getActionIcon = (type: string) => {
    const actionType = actionTypes.find(at => at.value === type)
    return actionType?.icon || Mail
  }

  const getActionLabel = (type: string) => {
    const actionType = actionTypes.find(at => at.value === type)
    return actionType?.label || type
  }

  const getActionDescription = (type: string) => {
    const actionType = actionTypes.find(at => at.value === type)
    return actionType?.description || ''
  }

  const getTargetOptions = (type: string) => {
    switch (type) {
      case 'route':
        return folderOptions
      case 'tag':
        return tagOptions
      case 'notify':
        return [{ value: 'admin@sebenza.co.za', label: 'Admin' }]
      default:
        return []
    }
  }

  const getTargetPlaceholder = (type: string) => {
    switch (type) {
      case 'route':
        return 'Select folder'
      case 'tag':
        return 'Select tag'
      case 'notify':
        return 'Enter email address'
      default:
        return 'Enter value'
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Actions</h3>
        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
          {actions.length} action{actions.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Existing Actions */}
      {actions.length > 0 && (
        <div className="space-y-2">
          {actions.map((action) => {
            const Icon = getActionIcon(action.type)
            const requiresTarget = actionTypes.find(at => at.value === action.type)?.requiresTarget
            
            return (
              <Card key={action.id} className="bg-surface border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">
                        {getActionLabel(action.type)}
                      </span>
                      <Badge 
                        variant={action.enabled ? 'default' : 'secondary'}
                        className={cn(
                          "text-xs",
                          action.enabled 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {action.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    
                    <div className="flex-1 flex items-center gap-3">
                      {requiresTarget && (
                        <div className="flex-1">
                          {action.type === 'notify' ? (
                            <Input
                              value={action.target || ''}
                              onChange={(e) => updateAction(action.id, { target: e.target.value })}
                              placeholder="Email address"
                              className="w-full"
                            />
                          ) : (
                            <Select
                              value={action.target || ''}
                              onValueChange={(value) => updateAction(action.id, { target: value })}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder={getTargetPlaceholder(action.type)} />
                              </SelectTrigger>
                              <SelectContent>
                                {getTargetOptions(action.type).map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={action.enabled}
                          onCheckedChange={(enabled) => updateAction(action.id, { enabled })}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAction(action.id)}
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    {getActionDescription(action.type)}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add New Action */}
      <Card className="bg-muted/30 border-dashed border-border">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Add Action</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Select
                value={newAction.type}
                onValueChange={(value) => setNewAction(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  {actionTypes.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="h-4 w-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {newAction.type && actionTypes.find(at => at.value === newAction.type)?.requiresTarget && (
                <div className="flex-1">
                  {newAction.type === 'notify' ? (
                    <Input
                      value={newAction.target || ''}
                      onChange={(e) => setNewAction(prev => ({ ...prev, target: e.target.value }))}
                      placeholder="Email address"
                    />
                  ) : (
                    <Select
                      value={newAction.target || ''}
                      onValueChange={(value) => setNewAction(prev => ({ ...prev, target: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={getTargetPlaceholder(newAction.type)} />
                      </SelectTrigger>
                      <SelectContent>
                        {getTargetOptions(newAction.type).map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              <Button
                onClick={addAction}
                disabled={!newAction.type || (actionTypes.find(at => at.value === newAction.type)?.requiresTarget && !newAction.target)}
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
