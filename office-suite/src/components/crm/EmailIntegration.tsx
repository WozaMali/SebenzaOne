"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { 
  Mail, Send, Reply, Forward, Star, Archive, Trash2, 
  Paperclip, Eye, EyeOff, Clock, User, Building, 
  MessageSquare, Plus, Search, Filter, MoreHorizontal,
  ChevronDown, ChevronUp, Calendar, Phone, Tag
} from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { EmailThread, EmailMessage, Contact, Company, Deal } from "@/types/crm"
import { crmService } from "@/lib/crm-service"

interface EmailIntegrationProps {
  contactId?: string
  companyId?: string
  dealId?: string
  onThreadSelect?: (thread: EmailThread) => void
  onComposeEmail?: (to: string, subject?: string) => void
}

export function EmailIntegration({ 
  contactId, 
  companyId, 
  dealId, 
  onThreadSelect,
  onComposeEmail 
}: EmailIntegrationProps) {
  const [threads, setThreads] = useState<EmailThread[]>([])
  const [selectedThread, setSelectedThread] = useState<EmailThread | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBy, setFilterBy] = useState<'all' | 'unread' | 'important' | 'starred'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [showCompose, setShowCompose] = useState(false)
  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    body: ''
  })

  useEffect(() => {
    const loadEmailThreads = async () => {
      try {
        setIsLoading(true)
        let threadsData: EmailThread[] = []
        
        if (contactId) {
          threadsData = crmService.getEmailThreadsForEntity('contact', contactId)
        } else if (companyId) {
          threadsData = crmService.getEmailThreadsForEntity('company', companyId)
        } else if (dealId) {
          threadsData = crmService.getEmailThreadsForEntity('deal', dealId)
        } else {
          threadsData = crmService.getEmailThreads()
        }
        
        setThreads(threadsData)
      } catch (error) {
        console.error('Error loading email threads:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadEmailThreads()
  }, [contactId, companyId, dealId])

  const filteredThreads = threads.filter(thread => {
    const matchesSearch = !searchQuery || 
      thread.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.participants.some(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    
    const matchesFilter = filterBy === 'all' || 
      (filterBy === 'unread' && !thread.isRead) ||
      (filterBy === 'important' && thread.isImportant) ||
      (filterBy === 'starred' && thread.isStarred)
    
    return matchesSearch && matchesFilter
  })

  const handleThreadSelect = (thread: EmailThread) => {
    setSelectedThread(thread)
    onThreadSelect?.(thread)
  }

  const handleCompose = () => {
    setShowCompose(true)
    // Pre-fill recipient if we have contact info
    if (contactId) {
      // TODO: Get contact email from contactId
      setComposeData(prev => ({ ...prev, to: 'contact@example.com' }))
    }
  }

  const handleSendEmail = () => {
    // TODO: Implement send email logic
    onComposeEmail?.(composeData.to, composeData.subject)
    setShowCompose(false)
    setComposeData({ to: '', subject: '', body: '' })
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Threads
          </h2>
          <Button onClick={handleCompose} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Compose
          </Button>
        </div>
        
        {/* Search and Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {filterBy === 'all' ? 'All' : 
                 filterBy === 'unread' ? 'Unread' :
                 filterBy === 'important' ? 'Important' : 'Starred'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterBy('all')}>
                All Emails
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy('unread')}>
                Unread
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy('important')}>
                Important
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy('starred')}>
                Starred
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* Thread List */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="space-y-1 p-2">
              {filteredThreads.map((thread) => (
                <ThreadItem
                  key={thread.id}
                  thread={thread}
                  isSelected={selectedThread?.id === thread.id}
                  onClick={() => handleThreadSelect(thread)}
                />
              ))}
              
              {filteredThreads.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No email threads found</p>
                  <p className="text-sm">Start a conversation by composing an email</p>
                </div>
              )}
            </div>
          </div>

          {/* Thread Content */}
          <div className="flex-1 flex flex-col">
            {selectedThread ? (
              <ThreadView thread={selectedThread} />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select an email thread to view</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compose Dialog */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <CardHeader>
              <CardTitle>Compose Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>To</Label>
                <Input
                  value={composeData.to}
                  onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                  placeholder="recipient@example.com"
                />
              </div>
              <div>
                <Label>Subject</Label>
                <Input
                  value={composeData.subject}
                  onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                  placeholder="Email subject"
                />
              </div>
              <div>
                <Label>Message</Label>
                <Textarea
                  value={composeData.body}
                  onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                  placeholder="Type your message here..."
                  rows={8}
                />
              </div>
            </CardContent>
            <div className="flex items-center justify-end gap-2 p-4 border-t">
              <Button variant="outline" onClick={() => setShowCompose(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendEmail}>
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

// Thread Item Component
function ThreadItem({ 
  thread, 
  isSelected, 
  onClick 
}: { 
  thread: EmailThread
  isSelected: boolean
  onClick: () => void
}) {
  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    if (days < 7) return `${days}d`
    return date.toLocaleDateString()
  }

  return (
    <div
      className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
        isSelected ? 'bg-orange-50 dark:bg-orange-900/20 border-r-2 border-orange-500' : ''
      } ${!thread.isRead ? 'font-semibold' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium truncate">{thread.subject}</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
            {thread.participants.map(p => p.name || p.email).join(', ')}
          </p>
        </div>
        <div className="flex items-center gap-1 ml-2">
          {thread.isImportant && (
            <Star className="h-3 w-3 text-yellow-500 fill-current" />
          )}
          {thread.isStarred && (
            <Star className="h-3 w-3 text-orange-500 fill-current" />
          )}
          <span className="text-xs text-gray-500">
            {formatDate(new Date(thread.lastMessageDate))}
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {thread.folder}
          </Badge>
          {thread.messageCount > 1 && (
            <span className="text-xs text-gray-500">
              {thread.messageCount} messages
            </span>
          )}
        </div>
        {thread.labels.length > 0 && (
          <div className="flex gap-1">
            {thread.labels.slice(0, 2).map((label) => (
              <Badge key={label} variant="secondary" className="text-xs">
                {label}
              </Badge>
            ))}
            {thread.labels.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{thread.labels.length - 2}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Thread View Component
function ThreadView({ thread }: { thread: EmailThread }) {
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set())

  const toggleMessage = (messageId: string) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
      }
      return newSet
    })
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Thread Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{thread.subject}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {thread.participants.map(p => p.name || p.email).join(', ')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {thread.isImportant && (
              <Button variant="ghost" size="sm">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              </Button>
            )}
            <Button variant="ghost" size="sm">
              <Reply className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Forward className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {thread.messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            isExpanded={expandedMessages.has(message.id)}
            onToggle={() => toggleMessage(message.id)}
          />
        ))}
      </div>
    </div>
  )
}

// Message Item Component
function MessageItem({ 
  message, 
  isExpanded, 
  onToggle 
}: { 
  message: EmailMessage
  isExpanded: boolean
  onToggle: () => void
}) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium text-sm">
              {message.from.name || message.from.email}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {formatDate(new Date(message.date))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {message.isImportant && (
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
          )}
          <Button variant="ghost" size="sm" onClick={onToggle}>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-3 space-y-3">
          <div className="text-sm">
            <div className="mb-2">
              <span className="font-medium">To:</span> {message.to.map(t => t.name || t.email).join(', ')}
            </div>
            {message.cc && message.cc.length > 0 && (
              <div className="mb-2">
                <span className="font-medium">CC:</span> {message.cc.map(t => t.name || t.email).join(', ')}
              </div>
            )}
          </div>
          
          <div className="prose prose-sm max-w-none">
            {message.isHtml ? (
              <div dangerouslySetInnerHTML={{ __html: message.body }} />
            ) : (
              <pre className="whitespace-pre-wrap font-sans">{message.body}</pre>
            )}
          </div>
          
          {message.attachments.length > 0 && (
            <div className="border-t pt-3">
              <div className="text-sm font-medium mb-2">Attachments:</div>
              <div className="space-y-1">
                {message.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center gap-2 text-sm">
                    <Paperclip className="h-3 w-3" />
                    <span>{attachment.filename}</span>
                    <span className="text-gray-500">
                      ({(attachment.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

export default EmailIntegration
