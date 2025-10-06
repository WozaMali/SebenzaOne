"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { 
  X, Send, Save, Paperclip, Smile, Bold, Italic, Underline, Strikethrough,
  List, ListOrdered, Link, Image, Code, Quote, AlignLeft, AlignCenter, 
  AlignRight, AlignJustify, Undo, Redo, MoreHorizontal, ChevronDown,
  Type, Palette, Highlighter, Indent, Outdent, Minus, Table, Calendar,
  Clock, Shield, Eye, AlertTriangle, Users, FileText, Bookmark, 
  MessageSquare, Zap, Settings, Download, Upload, Trash2, Edit3
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { 
  ComposeMessage, Template, Signature, EmailAddress, Attachment,
  Contact, Task, Note, Bookmark as BookmarkType, CalendarEvent
} from "@/types/mail"
import { useComposeShortcuts } from "@/hooks/useKeyboardShortcuts"
import { useOfflineManager } from "@/hooks/useOfflineManager"

interface RichComposeProps {
  isOpen: boolean
  onClose: () => void
  initialMessage?: Partial<ComposeMessage>
  onSend?: (message: ComposeMessage) => void
  onSave?: (message: ComposeMessage) => void
  onSchedule?: (message: ComposeMessage, sendAt: Date) => void
  onDelegate?: (message: ComposeMessage, delegateTo: string) => void
  inline?: boolean // New prop to render inline instead of as dialog
}

// Sample data
const sampleAliases = [
  { id: "alias-1", email: "john@company.com", name: "John Doe", isDefault: true },
  { id: "alias-2", email: "j.doe@company.com", name: "J. Doe", isDefault: false },
  { id: "alias-3", email: "john.doe@company.com", name: "John Doe (Personal)", isDefault: false },
]

const sampleContacts: Contact[] = [
  { id: "contact-1", name: "Sarah Johnson", email: "sarah@company.com", avatar: "", department: "Marketing" },
  { id: "contact-2", name: "Mike Chen", email: "mike@company.com", avatar: "", department: "Engineering" },
  { id: "contact-3", name: "Lisa Rodriguez", email: "lisa@company.com", avatar: "", department: "Sales" },
]

const sampleTemplates: Template[] = [
  {
    id: "template-1",
    name: "Meeting Follow-up",
    subject: "Follow-up: {{meeting_topic}}",
    body: "<p>Hi {{recipient_name}},</p><p>Thank you for the productive meeting today about <strong>{{meeting_topic}}</strong>.</p><p>Key points discussed:</p><ul><li>{{point_1}}</li><li>{{point_2}}</li></ul><p>Next steps: {{next_steps}}</p><p>Best regards,<br/>{{sender_name}}</p>",
    isHtml: true,
    variables: [
      { name: "recipient_name", type: "text", required: true, description: "Recipient's name" },
      { name: "meeting_topic", type: "text", required: true, description: "Meeting topic" },
      { name: "point_1", type: "text", required: false, description: "Key point 1" },
      { name: "point_2", type: "text", required: false, description: "Key point 2" },
      { name: "next_steps", type: "text", required: false, description: "Next steps" },
      { name: "sender_name", type: "text", required: true, description: "Your name" },
    ],
    category: "Business",
    isPublic: true,
    createdBy: "system",
    createdAt: new Date(),
    lastModified: new Date(),
  },
]

const sampleSignatures: Signature[] = [
  {
    id: "sig-1",
    name: "Professional",
    content: "<p>Best regards,</p><p><strong>John Doe</strong><br/>Senior Developer<br/>Sebenza Technologies</p><p>Phone: +1 (555) 123-4567<br/>Email: <a href=\"mailto:john@sebenza.com\">john@sebenza.com</a></p>",
    isHtml: true,
    isDefault: true,
    createdBy: "user",
    createdAt: new Date(),
    lastModified: new Date(),
  },
]

const fontFamilies = [
  { value: "Arial", label: "Arial" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Georgia", label: "Georgia" },
  { value: "Verdana", label: "Verdana" },
  { value: "Courier New", label: "Courier New" },
]

const fontSizes = [
  { value: "8px", label: "8px" },
  { value: "9px", label: "9px" },
  { value: "10px", label: "10px" },
  { value: "11px", label: "11px" },
  { value: "12px", label: "12px" },
  { value: "14px", label: "14px" },
  { value: "16px", label: "16px" },
  { value: "18px", label: "18px" },
  { value: "20px", label: "20px" },
  { value: "24px", label: "24px" },
  { value: "28px", label: "28px" },
  { value: "32px", label: "32px" },
]

const colors = [
  "#000000", "#333333", "#666666", "#999999", "#CCCCCC", "#FFFFFF",
  "#FF0000", "#FF6600", "#FFCC00", "#00FF00", "#00CCFF", "#0066FF",
  "#6600FF", "#FF00CC", "#FF0066", "#FF3366", "#FF6633", "#FFCC33",
  "#66FF33", "#33CCFF", "#3366FF", "#6633FF", "#CC33FF", "#FF3366",
]

export function RichCompose({ 
  isOpen, 
  onClose, 
  initialMessage = {}, 
  onSend, 
  onSave, 
  onSchedule,
  onDelegate,
  inline = false
}: RichComposeProps) {
  // State management
  const [message, setMessage] = useState<Partial<ComposeMessage>>({
    to: [],
    cc: [],
    bcc: [],
    subject: "",
    body: "",
    isHtml: true,
    attachments: [],
    priority: "normal",
    requestReadReceipt: false,
    isEncrypted: false,
    isSigned: false,
    ...initialMessage,
  })
  
  const [selectedAlias, setSelectedAlias] = useState(sampleAliases[0])
  const [selectedSignature, setSelectedSignature] = useState<Signature | null>(sampleSignatures[0])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [isDraft, setIsDraft] = useState(true)
  const [showCc, setShowCc] = useState(false)
  const [showBcc, setShowBcc] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showSignatures, setShowSignatures] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const [showDelegate, setShowDelegate] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [sidebarTab, setSidebarTab] = useState<"contacts" | "calendar" | "tasks" | "notes" | "bookmarks" | "templates" | "files">("contacts")
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined)
  const [delegateTo, setDelegateTo] = useState("")
  const [draftConflict, setDraftConflict] = useState(false)
  const [preSendWarnings, setPreSendWarnings] = useState<string[]>([])
  
  // Refs
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const autoSaveRef = useRef<NodeJS.Timeout>()
  const undoStackRef = useRef<string[]>([])
  const redoStackRef = useRef<string[]>([])

  // Offline manager
  const { 
    isOnline, 
    offlineQueue, 
    sendMessage: sendMessageOffline, 
    saveDraft: saveDraftOffline 
  } = useOfflineManager({
    onSyncComplete: (success) => {
      console.log('Sync complete:', success)
    },
    onQueueUpdate: (queue) => {
      console.log('Queue updated:', queue)
    }
  })

  // Event handlers
  const handleSend = async () => {
    const warnings = validateMessage()
    if (warnings.length > 0) {
      setPreSendWarnings(warnings)
      return
    }
    
    try {
      if (isOnline) {
        // Send immediately if online
        if (onSend) {
          onSend(message as ComposeMessage)
        }
      } else {
        // Queue for offline sending
        await sendMessageOffline(message as ComposeMessage)
      }
      onClose()
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleSave = async () => {
    try {
      if (isOnline) {
        // Save immediately if online
        if (onSave) {
          onSave(message as ComposeMessage)
        }
      } else {
        // Queue for offline saving
        await saveDraftOffline(message as ComposeMessage)
      }
    } catch (error) {
      console.error('Failed to save draft:', error)
    }
  }

  // Handle keyboard actions
  const handleKeyboardAction = useCallback((action: string) => {
    switch (action) {
      case 'send':
        handleSend()
        break
      case 'save_draft':
        handleSave()
        break
      case 'close_compose':
        onClose()
        break
      case 'bold':
        execCommand('bold')
        break
      case 'italic':
        execCommand('italic')
        break
      case 'underline':
        execCommand('underline')
        break
      case 'insert_link':
        insertLink()
        break
      case 'bullet_list':
        execCommand('insertUnorderedList')
        break
      case 'numbered_list':
        execCommand('insertOrderedList')
        break
      case 'align_left':
        execCommand('justifyLeft')
        break
      case 'align_center':
        execCommand('justifyCenter')
        break
      case 'align_right':
        execCommand('justifyRight')
        break
      case 'align_justify':
        execCommand('justifyFull')
        break
      case 'undo':
        undo()
        break
      case 'redo':
        redo()
        break
      case 'attach_file':
        fileInputRef.current?.click()
        break
      case 'insert_image':
        insertImage()
        break
      case 'insert_template':
        setShowTemplates(true)
        break
      case 'insert_signature':
        setShowSignatures(true)
        break
      case 'priority_low':
        setMessage(prev => ({ ...prev, priority: 'low' }))
        break
      case 'priority_normal':
        setMessage(prev => ({ ...prev, priority: 'normal' }))
        break
      case 'priority_high':
        setMessage(prev => ({ ...prev, priority: 'high' }))
        break
      case 'toggle_cc':
        setShowCc(!showCc)
        break
      case 'toggle_bcc':
        setShowBcc(!showBcc)
        break
      case 'schedule_send':
        setShowSchedule(true)
        break
      case 'delegate_send':
        setShowDelegate(true)
        break
      case 'toggle_encrypt':
        setMessage(prev => ({ ...prev, isEncrypted: !prev.isEncrypted }))
        break
      case 'toggle_sign':
        setMessage(prev => ({ ...prev, isSigned: !prev.isSigned }))
        break
      case 'show_help':
        // Show help dialog
        console.log('Show keyboard shortcuts help')
        break
      default:
        console.log('Unknown keyboard action:', action)
    }
  }, [message, showCc, showBcc, handleSend, handleSave, onClose])

  // Keyboard shortcuts
  useComposeShortcuts((action) => {
    handleKeyboardAction(action)
  }, isOpen)

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (isDraft && message.subject && message.body) {
      try {
        if (isOnline) {
          // Save immediately if online
          if (onSave) {
            onSave(message as ComposeMessage)
          }
        } else {
          // Queue for offline saving
          await saveDraftOffline(message as ComposeMessage)
        }
        console.log("Auto-saving draft:", message)
      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    }
  }, [isDraft, message, isOnline, onSave, saveDraftOffline])

  useEffect(() => {
    if (autoSaveRef.current) {
      clearTimeout(autoSaveRef.current)
    }
    autoSaveRef.current = setTimeout(autoSave, 2000)
    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current)
      }
    }
  }, [autoSave])

  // Editor commands
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    saveToUndoStack()
  }

  const saveToUndoStack = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML
      undoStackRef.current.push(content)
      if (undoStackRef.current.length > 50) {
        undoStackRef.current.shift()
      }
      redoStackRef.current = []
    }
  }

  const undo = () => {
    if (undoStackRef.current.length > 0) {
      const content = undoStackRef.current.pop()!
      redoStackRef.current.push(editorRef.current?.innerHTML || "")
      if (editorRef.current) {
        editorRef.current.innerHTML = content
      }
    }
  }

  const redo = () => {
    if (redoStackRef.current.length > 0) {
      const content = redoStackRef.current.pop()!
      undoStackRef.current.push(editorRef.current?.innerHTML || "")
      if (editorRef.current) {
        editorRef.current.innerHTML = content
      }
    }
  }

  const handleSchedule = () => {
    if (scheduleDate && onSchedule) {
      onSchedule(message as ComposeMessage, scheduleDate)
      onClose()
    }
  }

  const handleDelegate = () => {
    if (delegateTo && onDelegate) {
      onDelegate(message as ComposeMessage, delegateTo)
      onClose()
    }
  }

  const validateMessage = (): string[] => {
    const warnings: string[] = []
    
    if (!message.subject?.trim()) {
      warnings.push("Subject line is empty")
    }
    
    if (!message.to?.length) {
      warnings.push("No recipients specified")
    }
    
    if (message.attachments?.some(att => !att.isMalwareFree)) {
      warnings.push("Some attachments failed security scan")
    }
    
    return warnings
  }

  const addRecipient = (field: 'to' | 'cc' | 'bcc', email: string, name?: string) => {
    const newRecipient: EmailAddress = {
      email,
      displayName: name || email.split('@')[0],
      name: name
    }
    
    setMessage(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), newRecipient]
    }))
  }

  const removeRecipient = (field: 'to' | 'cc' | 'bcc', index: number) => {
    setMessage(prev => ({
      ...prev,
      [field]: prev[field]?.filter((_, i) => i !== index) || []
    }))
  }

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template)
    setMessage(prev => ({
      ...prev,
      subject: template.subject,
      body: template.body,
      isHtml: template.isHtml,
    }))
    setShowTemplates(false)
  }

  const handleSignatureSelect = (signature: Signature) => {
    setSelectedSignature(signature)
    if (signature.isHtml) {
      setMessage(prev => ({
        ...prev,
        body: (prev.body || "") + (prev.body ? "<br/><br/>" : "") + signature.content,
        isHtml: true,
      }))
    } else {
      setMessage(prev => ({
        ...prev,
        body: (prev.body || "") + (prev.body ? "\n\n" : "") + signature.content,
        isHtml: false,
      }))
    }
    setShowSignatures(false)
  }

  const handleAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      Array.from(files).forEach(file => {
        const attachment: Attachment = {
          id: `att-${Date.now()}`,
          filename: file.name,
          contentType: file.type,
          size: file.size,
          isInline: false,
          isMalwareScanned: true,
          isMalwareFree: true, // In real implementation, this would be determined by scanning
        }
        
        setMessage(prev => ({
          ...prev,
          attachments: [...(prev.attachments || []), attachment]
        }))
      })
    }
  }

  const removeAttachment = (attachmentId: string) => {
    setMessage(prev => ({
      ...prev,
      attachments: prev.attachments?.filter(att => att.id !== attachmentId) || []
    }))
  }

  const insertTable = (rows: number, cols: number) => {
    let tableHtml = "<table border='1' style='border-collapse: collapse; width: 100%;'>"
    for (let i = 0; i < rows; i++) {
      tableHtml += "<tr>"
      for (let j = 0; j < cols; j++) {
        tableHtml += "<td style='padding: 8px;'>&nbsp;</td>"
      }
      tableHtml += "</tr>"
    }
    tableHtml += "</table>"
    
    execCommand("insertHTML", tableHtml)
  }

  const insertLink = () => {
    const url = prompt("Enter URL:")
    const text = prompt("Enter link text:")
    if (url && text) {
      execCommand("insertHTML", `<a href="${url}">${text}</a>`)
    }
  }

  const insertImage = () => {
    imageInputRef.current?.click()
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imgHtml = `<img src="${e.target?.result}" alt="Uploaded image" style="max-width: 100%; height: auto;" />`
        execCommand("insertHTML", imgHtml)
      }
      reader.readAsDataURL(file)
    }
  }

  const content = (
    <div className={`${inline ? 'h-full' : 'max-w-7xl h-[90vh]'} flex flex-col p-0`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Compose Email</h2>
            {!isOnline && (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                Offline Mode
              </Badge>
            )}
            {offlineQueue.length > 0 && (
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                {offlineQueue.length} queued
              </Badge>
            )}
            {draftConflict && (
              <Badge variant="destructive">
                Draft Conflict
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowSchedule(true)}>
              <Clock className="h-4 w-4 mr-2" />
              Schedule
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowDelegate(true)}>
              <Users className="h-4 w-4 mr-2" />
              Delegate
            </Button>
            <Button 
              size="sm" 
              onClick={handleSend}
              disabled={!message.to?.length || !message.subject}
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Main Compose Area */}
          <div className="flex-1 flex flex-col">
            {/* From/To Fields */}
            <div className="p-4 space-y-3 border-b">
              {/* From */}
              <div className="flex items-center gap-2">
                <label className="w-16 text-sm font-medium">From:</label>
                <Select value={selectedAlias.id} onValueChange={(value) => {
                  const alias = sampleAliases.find(a => a.id === value)
                  if (alias) setSelectedAlias(alias)
                }}>
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sampleAliases.map((alias) => (
                      <SelectItem key={alias.id} value={alias.id}>
                        {alias.name} &lt;{alias.email}&gt;
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* To */}
              <div className="flex items-center gap-2">
                <label className="w-16 text-sm font-medium">To:</label>
                <div className="flex-1 flex flex-wrap gap-1 p-2 border rounded min-h-[40px]">
                  {message.to?.map((recipient, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {recipient.displayName}
                      <button
                        onClick={() => removeRecipient('to', index)}
                        className="ml-1 hover:bg-destructive/20 rounded"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  <input
                    type="text"
                    placeholder="Add recipients..."
                    className="flex-1 min-w-[200px] border-0 outline-none bg-transparent"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault()
                        const value = e.currentTarget.value.trim()
                        if (value) {
                          addRecipient('to', value)
                          e.currentTarget.value = ''
                        }
                      }
                    }}
                  />
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowCc(!showCc)}>
                  Cc
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowBcc(!showBcc)}>
                  Bcc
                </Button>
              </div>

              {/* Cc */}
              {showCc && (
                <div className="flex items-center gap-2">
                  <label className="w-16 text-sm font-medium">Cc:</label>
                  <div className="flex-1 flex flex-wrap gap-1 p-2 border rounded min-h-[40px]">
                    {message.cc?.map((recipient, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {recipient.displayName}
                        <button
                          onClick={() => removeRecipient('cc', index)}
                          className="ml-1 hover:bg-destructive/20 rounded"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    <input
                      type="text"
                      placeholder="Add Cc recipients..."
                      className="flex-1 min-w-[200px] border-0 outline-none bg-transparent"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault()
                          const value = e.currentTarget.value.trim()
                          if (value) {
                            addRecipient('cc', value)
                            e.currentTarget.value = ''
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Bcc */}
              {showBcc && (
                <div className="flex items-center gap-2">
                  <label className="w-16 text-sm font-medium">Bcc:</label>
                  <div className="flex-1 flex flex-wrap gap-1 p-2 border rounded min-h-[40px]">
                    {message.bcc?.map((recipient, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {recipient.displayName}
                        <button
                          onClick={() => removeRecipient('bcc', index)}
                          className="ml-1 hover:bg-destructive/20 rounded"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    <input
                      type="text"
                      placeholder="Add Bcc recipients..."
                      className="flex-1 min-w-[200px] border-0 outline-none bg-transparent"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault()
                          const value = e.currentTarget.value.trim()
                          if (value) {
                            addRecipient('bcc', value)
                            e.currentTarget.value = ''
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Subject */}
              <div className="flex items-center gap-2">
                <label className="w-16 text-sm font-medium">Subject:</label>
                <Input
                  placeholder="Email subject"
                  value={message.subject || ''}
                  onChange={(e) => setMessage(prev => ({ ...prev, subject: e.target.value }))}
                  className="flex-1"
                />
                {!message.subject && (
                  <Badge variant="destructive" className="text-xs">
                    Required
                  </Badge>
                )}
              </div>
            </div>

            {/* Toolbar */}
            <div className="p-2 border-b">
              <div className="flex items-center gap-1 flex-wrap">
                {/* Undo/Redo */}
                <div className="flex items-center gap-1 mr-2">
                  <Button variant="ghost" size="sm" onClick={undo} disabled={undoStackRef.current.length === 0}>
                    <Undo className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={redo} disabled={redoStackRef.current.length === 0}>
                    <Redo className="h-4 w-4" />
                  </Button>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* Text Formatting */}
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => execCommand('bold')}>
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => execCommand('italic')}>
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => execCommand('underline')}>
                    <Underline className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => execCommand('strikeThrough')}>
                    <Strikethrough className="h-4 w-4" />
                  </Button>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* Font Controls */}
                <div className="flex items-center gap-1">
                  <Select onValueChange={(value) => execCommand('fontName', value)}>
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue placeholder="Font" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontFamilies.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          <span style={{ fontFamily: font.value }}>{font.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select onValueChange={(value) => execCommand('fontSize', value)}>
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue placeholder="Size" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontSizes.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* Colors */}
                <div className="flex items-center gap-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Type className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48">
                      <div className="grid grid-cols-6 gap-2">
                        {colors.map((color) => (
                          <button
                            key={color}
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: color }}
                            onClick={() => execCommand('foreColor', color)}
                          />
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Highlighter className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48">
                      <div className="grid grid-cols-6 gap-2">
                        {colors.map((color) => (
                          <button
                            key={color}
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: color }}
                            onClick={() => execCommand('backColor', color)}
                          />
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* Paragraph Formatting */}
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => execCommand('insertUnorderedList')}>
                    <List className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => execCommand('insertOrderedList')}>
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => execCommand('formatBlock', 'blockquote')}>
                    <Quote className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => execCommand('formatBlock', 'pre')}>
                    <Code className="h-4 w-4" />
                  </Button>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* Alignment */}
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => execCommand('justifyLeft')}>
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => execCommand('justifyCenter')}>
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => execCommand('justifyRight')}>
                    <AlignRight className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => execCommand('justifyFull')}>
                    <AlignJustify className="h-4 w-4" />
                  </Button>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* Indentation */}
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => execCommand('indent')}>
                    <Indent className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => execCommand('outdent')}>
                    <Outdent className="h-4 w-4" />
                  </Button>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* Insert Options */}
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={insertLink}>
                    <Link className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={insertImage}>
                    <Image className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => insertTable(3, 3)}>
                    <Table className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => execCommand('insertHorizontalRule')}>
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* Attachments */}
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1" />

                {/* Templates and Signatures */}
                <div className="flex items-center gap-1">
                  <DropdownMenu open={showTemplates} onOpenChange={setShowTemplates}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        Templates
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64">
                      {sampleTemplates.map((template) => (
                        <DropdownMenuItem 
                          key={template.id}
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <div>
                            <p className="font-medium">{template.name}</p>
                            <p className="text-xs text-muted-foreground">{template.category}</p>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu open={showSignatures} onOpenChange={setShowSignatures}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        Signatures
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64">
                      {sampleSignatures.map((signature) => (
                        <DropdownMenuItem 
                          key={signature.id}
                          onClick={() => handleSignatureSelect(signature)}
                        >
                          <div>
                            <p className="font-medium">{signature.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {signature.isDefault ? "Default" : "Custom"}
                            </p>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Sidebar Toggle */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowSidebar(!showSidebar)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Editor */}
            <div className="flex-1 p-4">
              <div
                ref={editorRef}
                contentEditable
                className="h-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary prose max-w-none"
                dangerouslySetInnerHTML={{ __html: message.body || '' }}
                onInput={(e) => {
                  const content = e.currentTarget.innerHTML
                  setMessage(prev => ({ ...prev, body: content }))
                  saveToUndoStack()
                }}
                style={{ minHeight: '300px' }}
              />
            </div>

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="p-4 border-t">
                <h4 className="text-sm font-medium mb-2">Attachments</h4>
                <div className="space-y-2">
                  {message.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{attachment.filename}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(attachment.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                        {attachment.isMalwareScanned && (
                          <Badge 
                            variant={attachment.isMalwareFree ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {attachment.isMalwareFree ? "Safe" : "Threat Detected"}
                          </Badge>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeAttachment(attachment.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Options */}
            <div className="p-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={message.requestReadReceipt || false}
                      onCheckedChange={(checked) => setMessage(prev => ({ ...prev, requestReadReceipt: !!checked }))}
                    />
                    Request read receipt
                  </label>
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={message.isEncrypted || false}
                      onCheckedChange={(checked) => setMessage(prev => ({ ...prev, isEncrypted: !!checked }))}
                    />
                    Encrypt message
                  </label>
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={message.isSigned || false}
                      onCheckedChange={(checked) => setMessage(prev => ({ ...prev, isSigned: !!checked }))}
                    />
                    Digitally sign
                  </label>
                </div>
                
                <div className="flex items-center gap-2">
                  <span>Priority:</span>
                  <Select 
                    value={message.priority || 'normal'} 
                    onValueChange={(value) => setMessage(prev => ({ ...prev, priority: value as any }))}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          {showSidebar && (
            <div className="w-80 border-l">
              <Tabs value={sidebarTab} onValueChange={(value) => setSidebarTab(value as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="contacts">Contacts</TabsTrigger>
                  <TabsTrigger value="templates">Templates</TabsTrigger>
                  <TabsTrigger value="files">Files</TabsTrigger>
                </TabsList>
                
                <TabsContent value="contacts" className="p-4">
                  <div className="space-y-2">
                    <Input placeholder="Search contacts..." />
                    {sampleContacts.map((contact) => (
                      <div 
                        key={contact.id}
                        className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                        onClick={() => addRecipient('to', contact.email, contact.name)}
                      >
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          {contact.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{contact.name}</p>
                          <p className="text-xs text-muted-foreground">{contact.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="templates" className="p-4">
                  <div className="space-y-2">
                    {sampleTemplates.map((template) => (
                      <div 
                        key={template.id}
                        className="p-3 border rounded cursor-pointer hover:bg-muted"
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <p className="font-medium text-sm">{template.name}</p>
                        <p className="text-xs text-muted-foreground">{template.category}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="files" className="p-4">
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </Button>
                    <div className="space-y-1">
                      {message.attachments?.map((attachment) => (
                        <div key={attachment.id} className="flex items-center gap-2 p-2 border rounded">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm flex-1 truncate">{attachment.filename}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>

        {/* Schedule Dialog */}
        <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Send</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Send Date & Time</Label>
                <CalendarComponent
                  mode="single"
                  selected={scheduleDate}
                  onSelect={setScheduleDate}
                  disabled={(date) => date < new Date()}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowSchedule(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSchedule} disabled={!scheduleDate}>
                  Schedule Send
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delegate Dialog */}
        <Dialog open={showDelegate} onOpenChange={setShowDelegate}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delegate Send</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Delegate to</Label>
                <Select value={delegateTo} onValueChange={setDelegateTo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select delegate" />
                  </SelectTrigger>
                  <SelectContent>
                    {sampleContacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.email}>
                        {contact.name} ({contact.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDelegate(false)}>
                  Cancel
                </Button>
                <Button onClick={handleDelegate} disabled={!delegateTo}>
                  Delegate Send
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Pre-send Warnings */}
        {preSendWarnings.length > 0 && (
          <div className="p-4 bg-destructive/10 border-t">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="font-medium text-destructive">Send Issues</span>
            </div>
            <ul className="text-sm text-destructive space-y-1">
              {preSendWarnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
            <div className="flex justify-end gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={() => setPreSendWarnings([])}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => {
                setPreSendWarnings([])
                handleSend()
              }}>
                Send Anyway
              </Button>
            </div>
          </div>
        )}

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleAttachment}
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
    </div>
  )

  if (inline) {
    return isOpen ? content : null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0">
        {content}
      </DialogContent>
    </Dialog>
  )
}
