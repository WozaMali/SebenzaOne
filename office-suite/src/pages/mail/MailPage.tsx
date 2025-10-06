'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Mail, 
  MailOpen, 
  Star, 
  Archive, 
  Trash2, 
  Send, 
  Settings, 
  Search, 
  Plus,
  Folder,
  Inbox,
  Send as SendIcon,
  FileText,
  Star as StarIcon,
  Archive as ArchiveIcon,
  Trash2 as TrashIcon,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Clock,
  Bell,
  Users,
  Plus as MailPlus,
  X,
  Reply,
  Forward,
  Download,
  Paperclip,
  Save,
  Image,
  Link,
  Table,
  Smile,
  Calendar,
  CheckSquare,
  Bookmark,
  Bot,
  Mic,
  Camera,
  Sparkles,
  Leaf,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Palette,
  Highlighter,
  List,
  ListOrdered,
  Indent,
  Outdent,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Code,
  Eraser
} from 'lucide-react'
import { SettingsPage } from '@/components/mail/SettingsPage'
import MailAdminConsole from '@/pages/mail/MailAdminConsole'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Email {
  id: string
  sender: string
  from: string
  to: string
  subject: string
  preview: string
  body: string
  date: string
  isRead: boolean
  isStarred: boolean
  isImportant: boolean
  priority: 'low' | 'normal' | 'high'
  labels: string[]
  attachments: string[]
  zone: 'woza-mali' | 'partner-mail' | 'workshop-threads' | 'general'
}

interface MessageTab {
  id: string
  email: Email
  isActive: boolean
  lastViewed: Date
}

interface Folder {
  id: string
  name: string
  icon: React.ComponentType<any>
  count: number
  color: string
}

interface FolderGroup {
  id: string
  name: string
  folders: Folder[]
  isCollapsed: boolean
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

const sampleEmails: Email[] = [
  {
    id: "1",
    sender: "FNB Partnership Team",
    from: "partnerships@fnb.co.za",
    to: "team@sebenza.co.za",
    subject: "System Maintenance - Enhanced Security Features",
    preview: "We're rolling out enhanced security features to protect community data and financial transactions. The update includes end-to-end encryption and advanced fraud detection...",
    body: "Dear Sebenza Team,\n\nWe're excited to announce the rollout of enhanced security features to protect our community data and financial transactions. This update includes:\n\n• End-to-end encryption for all communications\n• Advanced fraud detection algorithms\n• Enhanced authentication protocols\n• Real-time transaction monitoring\n\nThese improvements will help us maintain the highest standards of security while supporting our community's financial empowerment goals.\n\nBest regards,\nFNB Partnership Team",
    date: "2024-01-13T10:30:00Z",
    isRead: false,
    isStarred: false,
    isImportant: true,
    priority: 'high',
    labels: ['Security', 'Partnership'],
    attachments: ['security-update.pdf'],
    zone: 'partner-mail'
  },
  {
    id: "2",
    sender: "Woza Mali Community",
    from: "community@wozamali.co.za",
    to: "all@sebenza.co.za",
    subject: "Weekly Upcycling Workshop - This Saturday",
    preview: "Join us this Saturday for our weekly upcycling workshop! We'll be transforming old electronics into functional art pieces. All materials provided...",
    body: "Hello Sebenza Community!\n\nThis Saturday's upcycling workshop promises to be amazing! We'll be focusing on:\n\n• Electronics upcycling techniques\n• Creative reuse of household items\n• Community building through shared projects\n• Sustainable living practices\n\nDate: Saturday, January 15th\nTime: 10:00 AM - 2:00 PM\nLocation: Sebenza Community Center\n\nAll materials will be provided. Bring your creativity and enthusiasm!\n\nSee you there!\nWoza Mali Team",
    date: "2024-01-12T14:15:00Z",
    isRead: true,
    isStarred: true,
    isImportant: false,
    priority: 'normal',
    labels: ['Workshop', 'Community'],
    attachments: ['workshop-flyer.pdf'],
    zone: 'woza-mali'
  },
  {
    id: "3",
    sender: "Sebenza Support",
    from: "support@sebenza.co.za",
    to: "user@sebenza.co.za",
    subject: "Your Account Security Update",
    preview: "We've detected some unusual activity on your account. Please review the attached security report and update your password if necessary...",
    body: "Dear User,\n\nWe've detected some unusual activity on your account. For your security, we recommend:\n\n1. Review the attached security report\n2. Update your password if necessary\n3. Enable two-factor authentication\n4. Contact support if you have any concerns\n\nYour account security is our top priority.\n\nBest regards,\nSebenza Support Team",
    date: "2024-01-11T09:45:00Z",
    isRead: false,
    isStarred: false,
    isImportant: true,
    priority: 'high',
    labels: ['Security', 'Account'],
    attachments: ['security-report.pdf'],
    zone: 'general'
  },
  // Draft emails
  {
    id: 'draft-1',
    sender: 'Draft',
    from: 'you@sebenza.co.za',
    to: 'team@sebenza.co.za',
    subject: '[DRAFT] Project Proposal for Q1 2024',
    preview: 'Working on a comprehensive project proposal for our Q1 initiatives...',
    body: 'Dear Team,\n\nI am working on a comprehensive project proposal for our Q1 2024 initiatives. This will include our sustainability goals, community engagement strategies, and technology improvements.\n\nKey areas to cover:\n- Waste reduction targets\n- Community outreach programs\n- Technology upgrades\n- Budget considerations\n\nI will share the complete proposal once finalized.\n\nBest regards',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    isStarred: false,
    isImportant: false,
    priority: 'normal',
    labels: ['Draft'],
    attachments: [],
    zone: 'general'
  },
  // Snoozed emails
  {
    id: 'snoozed-1',
    sender: 'Snoozed',
    from: 'reminder@sebenza.co.za',
    to: 'you@sebenza.co.za',
    subject: '[SNOOZED] Follow up on partnership discussion',
    preview: 'This email was snoozed until tomorrow for follow-up...',
    body: 'This is a snoozed email that will be brought back to your attention at the scheduled time.',
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    isStarred: false,
    isImportant: false,
    priority: 'normal',
    labels: ['Snoozed'],
    attachments: [],
    zone: 'general'
  },
  // Newsletter emails
  {
    id: 'newsletter-1',
    sender: 'newsletter@sebenza.co.za',
    from: 'newsletter@sebenza.co.za',
    to: 'you@sebenza.co.za',
    subject: '[NEWSLETTER] Sebenza Weekly Digest - Issue #15',
    preview: 'This week in Sebenza: New features, community highlights, and sustainability tips...',
    body: 'Welcome to Sebenza Weekly Digest!\n\nThis week we have exciting updates:\n- New waste tracking features\n- Community success stories\n- Sustainability tips from our experts\n- Upcoming events and workshops\n\nRead more on our website!\n\nSebenza Team',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    isStarred: false,
    isImportant: false,
    priority: 'normal',
    labels: ['Newsletter'],
    attachments: [],
    zone: 'general'
  },
  // Notification emails
  {
    id: 'notification-1',
    sender: 'notification@sebenza.co.za',
    from: 'notification@sebenza.co.za',
    to: 'you@sebenza.co.za',
    subject: '[NOTIFICATION] New message in Sebenza Nathi Group',
    preview: 'You have a new message in the Sebenza Nathi community group...',
    body: 'You have received a new message in the Sebenza Nathi community group. Please check your group notifications for details.',
    date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    isStarred: false,
    isImportant: false,
    priority: 'normal',
    labels: ['Notification'],
    attachments: [],
    zone: 'general'
  }
]

const sampleFolders: Folder[] = [
  { id: 'inbox', name: 'Inbox', icon: Inbox, count: 3, color: 'blue' },
  { id: 'drafts', name: 'Drafts', icon: FileText, count: 1, color: 'orange' },
  { id: 'snoozed', name: 'Snoozed', icon: Clock, count: 0, color: 'purple' },
  { id: 'sent', name: 'Sent', icon: SendIcon, count: 0, color: 'green' },
  { id: 'spam', name: 'Spam', icon: AlertTriangle, count: 0, color: 'red' },
  { id: 'trash', name: 'Trash', icon: TrashIcon, count: 0, color: 'red' },
  { id: 'archive', name: 'Archive', icon: ArchiveIcon, count: 0, color: 'gray' },
  { id: 'outbox', name: 'Outbox', icon: SendIcon, count: 0, color: 'blue' },
  { id: 'newsletters', name: 'Newsletters', icon: Mail, count: 2, color: 'green' },
  { id: 'notifications', name: 'Notifications', icon: Bell, count: 5, color: 'yellow' },
  { id: 'sebenza-nathi', name: 'Sebenza Nathi Group', icon: Users, count: 1, color: 'purple' }
]

const folderGroups: FolderGroup[] = [
  {
    id: 'sebenza-folders',
    name: 'Sebenza Folders',
    folders: sampleFolders,
    isCollapsed: false
  },
  {
    id: 'business',
    name: 'Business',
    folders: [
      { id: 'woza-mali', name: 'Woza Mali', icon: Mail, count: 1, color: 'green' },
      { id: 'partner-mail', name: 'Partner Mail', icon: Mail, count: 1, color: 'blue' },
      { id: 'workshops', name: 'Workshops', icon: Mail, count: 0, color: 'purple' },
      { id: 'campaigns', name: 'Campaigns', icon: Mail, count: 0, color: 'orange' }
    ],
    isCollapsed: true
  }
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MailPage() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [emails, setEmails] = useState<Email[]>(sampleEmails)
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set())
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [selectedFolder, setSelectedFolder] = useState('inbox')
  const [searchQuery, setSearchQuery] = useState('')
  const [messageTabs, setMessageTabs] = useState<MessageTab[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [showMailAdmin, setShowMailAdmin] = useState(false)
  
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  const filteredEmails = useMemo(() => {
    return emails.filter(email => {
      let matchesFolder = false
      
      switch (selectedFolder) {
        case 'inbox':
          matchesFolder = !email.isRead || email.isImportant
          break
        case 'drafts':
          matchesFolder = email.subject.includes('[DRAFT]') || email.sender === 'Draft'
          break
        case 'snoozed':
          matchesFolder = email.subject.includes('[SNOOZED]') || email.sender === 'Snoozed'
          break
        case 'sent':
          matchesFolder = email.sender === 'You' || email.from === 'you@sebenza.co.za'
          break
        case 'spam':
          matchesFolder = email.subject.includes('[SPAM]') || email.sender.includes('spam')
          break
        case 'trash':
          matchesFolder = email.subject.includes('[DELETED]') || email.sender === 'Trash'
          break
        case 'archive':
          matchesFolder = email.subject.includes('[ARCHIVED]') || email.sender === 'Archive'
          break
        case 'outbox':
          matchesFolder = email.subject.includes('[OUTBOX]') || email.sender === 'Outbox'
          break
        case 'newsletters':
          matchesFolder = email.subject.includes('[NEWSLETTER]') || email.sender.includes('newsletter')
          break
        case 'notifications':
          matchesFolder = email.subject.includes('[NOTIFICATION]') || email.sender.includes('notification')
          break
        case 'sebenza-nathi':
          matchesFolder = email.sender.includes('sebenza') || email.subject.includes('Sebenza Nathi')
          break
        default:
          matchesFolder = email.zone === selectedFolder
      }

      const matchesSearch = !searchQuery || 
        email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.preview.toLowerCase().includes(searchQuery.toLowerCase())
      
      return matchesFolder && matchesSearch
    })
  }, [emails, selectedFolder, searchQuery])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleEmailSelect = useCallback((emailId: string, isSelected: boolean) => {
    setSelectedEmails(prev => {
      const newSelected = new Set(prev)
      if (isSelected) {
      newSelected.add(emailId)
      } else {
        newSelected.delete(emailId)
    }
      return newSelected
    })
  }, [])
  
  const handleSelectAll = useCallback(() => {
    if (selectedEmails.size === filteredEmails.length) {
      setSelectedEmails(new Set())
    } else {
      setSelectedEmails(new Set(filteredEmails.map(email => email.id)))
    }
  }, [selectedEmails.size, filteredEmails])

  const handleEmailClick = useCallback((email: Email) => {
    // Mark as read
    setEmails(prev => prev.map(e => 
      e.id === email.id ? { ...e, isRead: true } : e
    ))

    // Add to tabs if not already open
    const existingTab = messageTabs.find(tab => tab.email.id === email.id)
    if (!existingTab) {
      const newTab: MessageTab = {
        id: `tab-${email.id}`,
        email,
        isActive: true,
        lastViewed: new Date()
      }
      setMessageTabs(prev => [
        ...prev.map(tab => ({ ...tab, isActive: false })),
        newTab
      ])
    } else {
      // Switch to existing tab
      setMessageTabs(prev => prev.map(tab => ({
        ...tab,
        isActive: tab.id === existingTab.id,
        lastViewed: tab.id === existingTab.id ? new Date() : tab.lastViewed
      })))
    }
  }, [messageTabs])

  const handleNewEmail = useCallback(() => {
    // Create a new compose tab
    const composeEmail: Email = {
      id: `compose-${Date.now()}`,
      sender: 'You',
      from: 'you@sebenza.co.za',
      to: '',
      subject: '',
      preview: 'Composing new email...',
      body: '',
      date: new Date().toISOString(),
      isRead: true,
      isStarred: false,
      isImportant: false,
      priority: 'normal',
      labels: [],
      attachments: [],
      zone: 'general'
    }

    const newTab: MessageTab = {
      id: `compose-${Date.now()}`,
      email: composeEmail,
      isActive: true,
      lastViewed: new Date()
    }

    setMessageTabs(prev => [
      ...prev.map(tab => ({ ...tab, isActive: false })),
      newTab
    ])
  }, [])

  const handleTabClose = useCallback((tabId: string) => {
    setMessageTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== tabId)
      if (newTabs.length > 0 && prev.find(tab => tab.id === tabId)?.isActive) {
        newTabs[newTabs.length - 1].isActive = true
      }
      return newTabs
    })
  }, [])

  const handleTabSelect = useCallback((tabId: string) => {
    setMessageTabs(prev => prev.map(tab => ({
      ...tab,
      isActive: tab.id === tabId,
      lastViewed: tab.id === tabId ? new Date() : tab.lastViewed
    })))
  }, [])


  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <TooltipProvider>
      <div className="h-[calc(100vh-40px)] bg-background text-foreground">
        <style jsx>{`
          .mail-content {
            height: calc(100vh - 40px) !important;
            min-height: calc(100vh - 40px) !important;
          }
          .mail-panel-3 {
            height: calc(100vh - 40px) !important;
            min-height: calc(100vh - 40px) !important;
            overflow-y: auto !important;
          }
          .mail-message-content {
            height: calc(100vh - 100px) !important;
            overflow-y: auto !important;
          }
        `}</style>
        <div className="flex h-full">
          {/* Panel 1 - Navigation Sidebar */}
          <div className="w-52 bg-card border-r border-border flex-shrink-0 overflow-y-auto">
            <div className="p-6">
              <div className="space-y-6">

                {/* New Email Button */}
            <Button 
                  onClick={handleNewEmail}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <MailPlus className="h-4 w-4 mr-2" />
                  New Email
            </Button>

                {/* Folder Groups */}
                <div className="space-y-4">
                  {folderGroups.map((group) => (
                    <div key={group.id} className="space-y-2">
                      <button
                        className="flex items-center justify-between w-full text-left text-sm font-medium text-muted-foreground hover:text-foreground"
                      >
                        <span>{group.name}</span>
                        {group.isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      
                      {!group.isCollapsed && (
                        <div className="space-y-1 pl-2">
                          {group.folders.map((folder) => (
                            <button
                    key={folder.id}
                              onClick={() => setSelectedFolder(folder.id)}
                              className={`flex items-center justify-between w-full text-left text-sm rounded-md px-2 py-1 transition-colors ${
                                selectedFolder === folder.id
                                  ? 'bg-primary text-primary-foreground'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                              }`}
                  >
                    <div className="flex items-center gap-2">
                                <folder.icon className="h-4 w-4" />
                                <span>{folder.name}</span>
                    </div>
                              {folder.count > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {folder.count}
                      </Badge>
                    )}
                            </button>
                          ))}
                  </div>
              )}
            </div>
                  ))}
        </div>

                {/* Bottom Navigation */}
                <div className="pt-6 border-t border-border/50 space-y-2">
                  {/* Connect Button */}
                  <Button 
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                  
                  {/* Mail Admin Console Button */}
                  <Button 
                    onClick={() => setShowMailAdmin(true)}
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Admin Console
                  </Button>
                </div>

            </div>
                    </div>
        </div>

          {/* Panel 2 - Email List */}
          <div className="w-64 bg-card border-r border-border flex-shrink-0 overflow-y-auto">
            <div className="p-4">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-foreground">Email List</h3>
                  <span className="text-sm text-muted-foreground">{selectedEmails.size} selected</span>
        </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                    placeholder="Search mail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          
                {/* Action Buttons */}
            {selectedEmails.size > 0 && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Archive className="h-4 w-4 mr-1" />
                      Archive
                  </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                  </Button>
                    <Button variant="outline" size="sm">
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                  </Button>
              </div>
            )}
            
                {/* Email List */}
                <div className="flex-1 overflow-y-auto">
                  <div className="space-y-2 p-2">
            {filteredEmails.map((email) => (
              <div
                key={email.id}
                        className={`p-3 rounded cursor-pointer transition-colors ${
                          selectedEmail?.id === email.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => handleEmailClick(email)}
                      >
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                      checked={selectedEmails.has(email.id)}
                      onChange={(e) => {
                        e.stopPropagation()
                              handleEmailSelect(email.id, e.target.checked)
                      }}
                            className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium truncate">
                                {email.sender}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(email.date).toLocaleDateString()}
                              </span>
                      </div>
                            <div className="text-sm font-medium mb-1 truncate">
                        {email.subject}
                      </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {email.preview}
                    </div>
                  </div>
                        </div>
                      </div>
                    ))}
                      </div>
                  </div>
                </div>
              </div>
          </div>

          {/* Panel 3 - Message Viewer */}
          <div className="flex-1 bg-card flex flex-col mail-panel-3">
            <div className="flex-1 flex flex-col">
              {messageTabs.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Select an email to read
                    </h3>
                    <p className="text-muted-foreground">
                      Choose from your folders to get started
                </p>
              </div>
          </div>
              ) : (
                <>
                  {/* Browser-Style Tab Bar */}
                  <div className="border-b border-border bg-muted/30 rounded-t-lg">
                    <div className="flex items-center overflow-x-auto">
                      {messageTabs.map((tab) => (
            <div
              key={tab.id}
                          className={`flex items-center gap-2 px-3 py-2 border-r border-border cursor-pointer transition-all duration-200 min-w-0 group ${
                tab.isActive
                              ? 'bg-background text-foreground border-b-2 border-primary shadow-sm'
                              : 'bg-muted/30 text-muted-foreground hover:bg-muted/60'
              }`}
                          onClick={() => handleTabSelect(tab.id)}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                            {tab.email.isStarred && (
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                            )}
                            {tab.email.isImportant && (
                              <AlertTriangle className="h-3 w-3 text-orange-500 flex-shrink-0" />
                            )}
                            <span className="text-xs font-medium truncate max-w-32">
                              {tab.id.startsWith('compose-') ? 'New Email' : tab.email.subject}
                            </span>
              </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleTabClose(tab.id)
                }}
                                className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground hover:bg-destructive/10 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Close tab</p>
                            </TooltipContent>
                          </Tooltip>
            </div>
          ))}
        </div>
              </div>

                  {/* Message Content */}
                  <div className="flex-1 overflow-y-auto min-h-0 mail-message-content">
                    {messageTabs.map((tab) => (
                      <div
                        key={tab.id}
                        className={`h-full ${tab.isActive ? 'block' : 'hidden'}`}
                      >
                        {tab.id.startsWith('compose-') ? (
                          /* Full Compose Interface */
                          <div className="h-full flex flex-col min-h-0">
                            {/* Taskbar */}
                            <div className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
                              <div className="flex items-center justify-between p-3">
                                {/* Left Actions */}
                <div className="flex items-center gap-2">
                  <Button 
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg h-8 px-3 text-xs"
                  >
                                    <Send className="h-3 w-3 mr-1" />
                                    Send
                  </Button>
                                  <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Schedule
                  </Button>
                                  <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                                    <Save className="h-3 w-3 mr-1" />
                                    Save Draft
                      </Button>
                                  <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                                    <X className="h-3 w-3 mr-1" />
                                    Discard
                                  </Button>
              </div>
              
                                {/* Center Actions */}
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                    <Paperclip className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                    <Image className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                    <Link className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                    <Table className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                    <FileText className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                    <Smile className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                    <Calendar className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                    <CheckSquare className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                    <Bookmark className="h-3 w-3" />
                                  </Button>
              </div>

                                {/* Right Actions */}
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                    <Bot className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                    <Mic className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                    <Camera className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                    <Sparkles className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                    <Leaf className="h-3 w-3" />
                                  </Button>
                  </div>
              </div>
            </div>

                            {/* Addressing Fields */}
                            <div className="p-4 border-b border-border bg-muted/30">
                              <div className="space-y-3">
                                {/* From */}
                                <div className="flex items-center gap-2">
                                  <label className="text-xs font-medium text-foreground w-12">From:</label>
                                  <Select>
                                    <SelectTrigger className="flex-1 h-8 text-xs">
                                      <SelectValue placeholder="Select identity" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="team@sebenza.co.za">team@sebenza.co.za</SelectItem>
                                      <SelectItem value="support@sebenza.co.za">support@sebenza.co.za</SelectItem>
                                      <SelectItem value="partnerships@sebenza.co.za">partnerships@sebenza.co.za</SelectItem>
                                    </SelectContent>
                                  </Select>
                  </div>

                                {/* To */}
                                <div className="flex items-center gap-2">
                                  <label className="text-xs font-medium text-foreground w-12">To:</label>
                                  <Input 
                                    placeholder="Enter recipients" 
                                    className="flex-1 h-8 text-xs"
                                  />
                            </div>

                                {/* Cc */}
                                <div className="flex items-center gap-2">
                                  <label className="text-xs font-medium text-foreground w-12">Cc:</label>
                                  <Input 
                                    placeholder="Enter CC recipients" 
                                    className="flex-1 h-8 text-xs"
                                  />
              </div>

                                {/* Bcc */}
                        <div className="flex items-center gap-2">
                                  <label className="text-xs font-medium text-foreground w-12">Bcc:</label>
                                  <Input 
                                    placeholder="Enter BCC recipients" 
                                    className="flex-1 h-8 text-xs"
                                  />
                        </div>

                                {/* Subject */}
                                <div className="flex items-center gap-2">
                                  <label className="text-xs font-medium text-foreground w-12">Subject:</label>
                                  <Input 
                                    placeholder="Enter subject" 
                                    className="flex-1 h-8 text-xs"
                                  />
      </div>

                                {/* Options */}
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2">
                                    <Checkbox id="confidential" />
                                    <label htmlFor="confidential" className="text-xs text-foreground">Confidential</label>
                    </div>
                                  <div className="flex items-center gap-2">
                                    <Checkbox id="readReceipt" />
                                    <label htmlFor="readReceipt" className="text-xs text-foreground">Read Receipt</label>
                  </div>
                                  <div className="flex items-center gap-2">
                                    <Checkbox id="encryption" />
                                    <label htmlFor="encryption" className="text-xs text-foreground">Encryption</label>
                    </div>
                  </div>
                              </div>
          </div>
          
                            {/* Rich Text Editor */}
                            <div className="flex-1 flex flex-col">
                              {/* Formatting Toolbar */}
                              <div className="bg-muted/50 border-b border-border p-2">
                                <div className="flex items-center gap-1 flex-wrap">
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <Bold className="h-3 w-3" />
            </Button>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <Italic className="h-3 w-3" />
            </Button>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <Underline className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <Strikethrough className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <Palette className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <Highlighter className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <List className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <ListOrdered className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <Indent className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <Outdent className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <AlignLeft className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <AlignCenter className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <AlignRight className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <Quote className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <Code className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <Eraser className="h-3 w-3" />
                                  </Button>
                                </div>
                    </div>
                    
                              {/* Editor */}
                              <div className="flex-1 p-4">
                                <div
                                  contentEditable
                                  className="min-h-[300px] w-full p-4 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 text-sm"
                                  style={{ minHeight: '300px' }}
                                />
                            </div>
                        </div>
                      </div>
                        ) : (
                          /* Email Reading Interface */
                          <div className="p-6 h-full overflow-y-auto mail-message-content">
                            <div className="space-y-6">
                              {/* Email Header */}
                      <div>
                                <h2 className="text-lg font-semibold text-foreground mb-3">
                                  {tab.email.subject}
                                </h2>
                                <div className="flex items-center space-x-6 text-xs text-muted-foreground mb-3">
                                  <span><strong>From:</strong> {tab.email.from}</span>
                                  <span><strong>To:</strong> {tab.email.to}</span>
                                  <span><strong>Date:</strong> {new Date(tab.email.date).toLocaleString()}</span>
                    </div>
                  </div>
                  
                              {/* Email Body */}
                              <div className="prose prose-xs max-w-none">
                                <div className="whitespace-pre-wrap text-foreground text-sm">
                                  {tab.email.body}
                  </div>
          </div>
          
                              {/* Attachments */}
                              {tab.email.attachments.length > 0 && (
                                <div className="border-t border-border pt-3">
                                  <h4 className="text-xs font-medium text-foreground mb-2">
                                    Attachments
                                  </h4>
                                  <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                                    <Paperclip className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">
                                      Document.pdf (2.4 MB)
                                    </span>
                                    <Button variant="ghost" size="sm" className="ml-auto h-6 px-2">
                                      <Download className="h-3 w-3" />
            </Button>
              </div>
              </div>
                              )}

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2 pt-3 border-t border-border">
                                <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                                  <Reply className="h-3 w-3 mr-1" />
                                  Reply
                </Button>
                                <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                                  <Forward className="h-3 w-3 mr-1" />
                                  Forward
                </Button>
                                <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                                  <Archive className="h-3 w-3 mr-1" />
                                  Archive
                </Button>
                                <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                                <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  Star
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Settings Dialog */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Sebenza Mail Configuration</DialogTitle>
              <p className="text-slate-600 dark:text-slate-400">Configure your email settings, migration tools, and integration options</p>
            </DialogHeader>
            <SettingsPage onClose={() => setShowSettings(false)} />
          </DialogContent>
        </Dialog>

        {/* Mail Admin Console */}
        {showMailAdmin && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="bg-background border border-border rounded-lg shadow-xl w-full max-w-7xl h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h2 className="text-xl font-semibold text-foreground">Admin Console</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMailAdmin(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="h-[calc(100%-60px)]">
                  <MailAdminConsole />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}