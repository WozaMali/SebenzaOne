'use client'

import { useState, useEffect, useMemo } from 'react'
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { 
  Search, Users, Building2, Target, Calendar, FileText, 
  Package, Truck, DollarSign, BarChart3, Settings, Mail,
  Phone, MessageSquare, Plus, Edit, Eye, Download
} from 'lucide-react'

interface CommandAction {
  id: string
  label: string
  icon: any
  keywords: string[]
  action: () => void
  category: string
}

export function CommandPalette({ onAction }: { onAction: (action: string) => void }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const commands: CommandAction[] = [
    // Navigation
    { id: 'dashboard', label: 'Go to Dashboard', icon: BarChart3, keywords: ['dashboard', 'home'], action: () => onAction('dashboard'), category: 'Navigation' },
    { id: 'customers', label: 'Go to Customers', icon: Users, keywords: ['customers', 'contacts'], action: () => onAction('customers'), category: 'Navigation' },
    { id: 'partners', label: 'Go to Partners', icon: Building2, keywords: ['partners', 'companies'], action: () => onAction('partners'), category: 'Navigation' },
    { id: 'deals', label: 'Go to Deals', icon: Target, keywords: ['deals', 'sales'], action: () => onAction('deals'), category: 'Navigation' },
    { id: 'collections', label: 'Go to Collections', icon: Truck, keywords: ['collections', 'pickups'], action: () => onAction('collections'), category: 'Navigation' },
    { id: 'materials', label: 'Go to Materials', icon: Package, keywords: ['materials', 'inventory'], action: () => onAction('materials'), category: 'Navigation' },
    { id: 'invoicing', label: 'Go to Invoicing', icon: DollarSign, keywords: ['invoices', 'billing'], action: () => onAction('invoicing'), category: 'Navigation' },
    { id: 'analytics', label: 'Go to Analytics', icon: BarChart3, keywords: ['analytics', 'reports'], action: () => onAction('recycling-analytics'), category: 'Navigation' },
    
    // Actions
    { id: 'add-customer', label: 'Add New Customer', icon: Plus, keywords: ['add', 'new', 'customer'], action: () => onAction('add-customer'), category: 'Actions' },
    { id: 'add-deal', label: 'Create New Deal', icon: Plus, keywords: ['add', 'new', 'deal'], action: () => onAction('add-deal'), category: 'Actions' },
    { id: 'schedule-collection', label: 'Schedule Collection', icon: Calendar, keywords: ['schedule', 'collection'], action: () => onAction('schedule-collection'), category: 'Actions' },
    { id: 'create-invoice', label: 'Create Invoice', icon: FileText, keywords: ['create', 'invoice'], action: () => onAction('create-invoice'), category: 'Actions' },
    
    // Communication
    { id: 'send-email', label: 'Send Email', icon: Mail, keywords: ['email', 'send'], action: () => onAction('send-email'), category: 'Communication' },
    { id: 'log-call', label: 'Log Phone Call', icon: Phone, keywords: ['call', 'phone'], action: () => onAction('log-call'), category: 'Communication' },
    { id: 'send-sms', label: 'Send SMS', icon: MessageSquare, keywords: ['sms', 'text'], action: () => onAction('send-sms'), category: 'Communication' },
    
    // Settings
    { id: 'settings', label: 'Open Settings', icon: Settings, keywords: ['settings', 'preferences'], action: () => onAction('settings'), category: 'Settings' },
  ]

  const handleSelect = (command: CommandAction) => {
    command.action()
    setOpen(false)
  }

  const [searchQuery, setSearchQuery] = useState('')
  
  const filteredCommands = useMemo(() => {
    if (!searchQuery) return commands
    
    const query = searchQuery.toLowerCase()
    return commands.filter(cmd => 
      cmd.label.toLowerCase().includes(query) ||
      cmd.keywords.some(k => k.toLowerCase().includes(query))
    )
  }, [searchQuery, commands])

  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandAction[]> = {}
    filteredCommands.forEach(cmd => {
      if (!groups[cmd.category]) groups[cmd.category] = []
      groups[cmd.category].push(cmd)
    })
    return groups
  }, [filteredCommands])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground border rounded-md hover:bg-muted transition-colors"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Type a command or search..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <CommandList>
          {Object.keys(groupedCommands).length === 0 ? (
            <CommandEmpty>No results found.</CommandEmpty>
          ) : (
            Object.entries(groupedCommands).map(([category, cmds]) => (
              <CommandGroup key={category} heading={category}>
                {cmds.map((command) => (
                  <CommandItem
                    key={command.id}
                    onSelect={() => handleSelect(command)}
                    className="flex items-center gap-2"
                  >
                    <command.icon className="h-4 w-4" />
                    <span>{command.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
