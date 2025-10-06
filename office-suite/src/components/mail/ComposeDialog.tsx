"use client"

import { useState, useRef, useEffect } from "react"
import { 
  X, Send, Save, Paperclip, Smile, Bold, Italic, Underline, 
  List, ListOrdered, Link, Image, Code, Quote, AlignLeft, 
  AlignCenter, AlignRight, Undo, Redo, MoreHorizontal, ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "@/components/ui/dropdown-menu"
import { ComposeMessage, Template, Signature } from "@/types/mail"

interface ComposeDialogProps {
  isOpen: boolean
  onClose: () => void
  initialMessage?: Partial<ComposeMessage>
  onSend?: (message: ComposeMessage) => void
  onSave?: (message: ComposeMessage) => void
}

const sampleTemplates: Template[] = [
  {
    id: "template-1",
    name: "Meeting Follow-up",
    subject: "Follow-up: {{meeting_topic}}",
    body: "Hi {{recipient_name}},\n\nThank you for the productive meeting today about {{meeting_topic}}. Here are the key points we discussed:\n\n• {{point_1}}\n• {{point_2}}\n• {{point_3}}\n\nNext steps:\n{{next_steps}}\n\nBest regards,\n{{sender_name}}",
    isHtml: false,
    variables: [
      { name: "recipient_name", type: "text", required: true, description: "Recipient's name" },
      { name: "meeting_topic", type: "text", required: true, description: "Meeting topic" },
      { name: "point_1", type: "text", required: false, description: "Key point 1" },
      { name: "point_2", type: "text", required: false, description: "Key point 2" },
      { name: "point_3", type: "text", required: false, description: "Key point 3" },
      { name: "next_steps", type: "text", required: false, description: "Next steps" },
      { name: "sender_name", type: "text", required: true, description: "Your name" },
    ],
    category: "Business",
    isPublic: true,
    createdBy: "system",
    createdAt: new Date(),
    lastModified: new Date(),
  },
  {
    id: "template-2",
    name: "Project Update",
    subject: "Project Update: {{project_name}}",
    body: "<p>Hi {{recipient_name}},</p><p>I wanted to provide you with an update on the <strong>{{project_name}}</strong> project.</p><p><strong>Progress:</strong></p><ul><li>{{progress_1}}</li><li>{{progress_2}}</li></ul><p><strong>Next Milestone:</strong> {{next_milestone}}</p><p><strong>Timeline:</strong> {{timeline}}</p><p>Please let me know if you have any questions.</p><p>Best regards,<br/>{{sender_name}}</p>",
    isHtml: true,
    variables: [
      { name: "recipient_name", type: "text", required: true, description: "Recipient's name" },
      { name: "project_name", type: "text", required: true, description: "Project name" },
      { name: "progress_1", type: "text", required: false, description: "Progress item 1" },
      { name: "progress_2", type: "text", required: false, description: "Progress item 2" },
      { name: "next_milestone", type: "text", required: false, description: "Next milestone" },
      { name: "timeline", type: "text", required: false, description: "Project timeline" },
      { name: "sender_name", type: "text", required: true, description: "Your name" },
    ],
    category: "Project Management",
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
    content: "Best regards,\nJohn Doe\nSenior Developer\nSebenza Technologies\nPhone: +1 (555) 123-4567\nEmail: john@sebenza.com",
    isHtml: false,
    isDefault: true,
    createdBy: "user",
    createdAt: new Date(),
    lastModified: new Date(),
  },
  {
    id: "sig-2",
    name: "HTML Professional",
    content: "<p>Best regards,</p><p><strong>John Doe</strong><br/>Senior Developer<br/>Sebenza Technologies</p><p>Phone: +1 (555) 123-4567<br/>Email: <a href=\"mailto:john@sebenza.com\">john@sebenza.com</a></p>",
    isHtml: true,
    isDefault: false,
    createdBy: "user",
    createdAt: new Date(),
    lastModified: new Date(),
  },
]

export function ComposeDialog({ 
  isOpen, 
  onClose, 
  initialMessage = {}, 
  onSend, 
  onSave 
}: ComposeDialogProps) {
  const [message, setMessage] = useState<Partial<ComposeMessage>>({
    to: [],
    cc: [],
    bcc: [],
    subject: "",
    body: "",
    isHtml: false,
    attachments: [],
    priority: "normal",
    requestReadReceipt: false,
    isEncrypted: false,
    isSigned: false,
    ...initialMessage,
  })
  
  const [isComposing, setIsComposing] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [selectedSignature, setSelectedSignature] = useState<Signature | null>(sampleSignatures[0])
  const [showCc, setShowCc] = useState(false)
  const [showBcc, setShowBcc] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showSignatures, setShowSignatures] = useState(false)
  
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && editorRef.current) {
      editorRef.current.focus()
    }
  }, [isOpen])

  const handleSend = () => {
    if (onSend && message.to && message.subject) {
      onSend(message as ComposeMessage)
      onClose()
    }
  }

  const handleSave = () => {
    if (onSave) {
      onSave(message as ComposeMessage)
    }
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
    setMessage(prev => ({
      ...prev,
      body: prev.body + (prev.body ? "\n\n" : "") + signature.content,
      isHtml: signature.isHtml,
    }))
    setShowSignatures(false)
  }

  const handleAttachment = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      // In a real implementation, this would upload files and create attachment objects
      console.log("Files selected:", files)
    }
  }

  const formatEmailAddresses = (addresses: string) => {
    return addresses.split(',').map(addr => addr.trim()).filter(addr => addr)
  }

  const addEmailAddress = (field: 'to' | 'cc' | 'bcc', value: string) => {
    const addresses = formatEmailAddresses(value)
    setMessage(prev => ({
      ...prev,
      [field]: addresses.map(addr => ({ 
        email: addr, 
        displayName: addr.split('@')[0] 
      }))
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Compose Email</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
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
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4">
          {/* Recipients */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="w-12 text-sm font-medium">To:</label>
              <Input
                placeholder="recipient@example.com"
                value={message.to?.map(t => t.email).join(', ') || ''}
                onChange={(e) => addEmailAddress('to', e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowCc(!showCc)}
              >
                Cc
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowBcc(!showBcc)}
              >
                Bcc
              </Button>
            </div>
            
            {showCc && (
              <div className="flex items-center gap-2">
                <label className="w-12 text-sm font-medium">Cc:</label>
                <Input
                  placeholder="cc@example.com"
                  value={message.cc?.map(t => t.email).join(', ') || ''}
                  onChange={(e) => addEmailAddress('cc', e.target.value)}
                  className="flex-1"
                />
              </div>
            )}
            
            {showBcc && (
              <div className="flex items-center gap-2">
                <label className="w-12 text-sm font-medium">Bcc:</label>
                <Input
                  placeholder="bcc@example.com"
                  value={message.bcc?.map(t => t.email).join(', ') || ''}
                  onChange={(e) => addEmailAddress('bcc', e.target.value)}
                  className="flex-1"
                />
              </div>
            )}
          </div>

          {/* Subject */}
          <div className="flex items-center gap-2">
            <label className="w-12 text-sm font-medium">Subject:</label>
            <Input
              placeholder="Email subject"
              value={message.subject || ''}
              onChange={(e) => setMessage(prev => ({ ...prev, subject: e.target.value }))}
              className="flex-1"
            />
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2 p-2 border rounded-lg">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm">
                <Bold className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Italic className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Underline className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button variant="ghost" size="sm">
                <List className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <ListOrdered className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button variant="ghost" size="sm">
                <Link className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Image className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1" />
            
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={handleAttachment}>
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Smile className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              
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
          </div>

          {/* Message Body */}
          <div className="flex-1">
            <Tabs value={message.isHtml ? "html" : "text"} className="h-full">
              <TabsList>
                <TabsTrigger value="text">Plain Text</TabsTrigger>
                <TabsTrigger value="html">Rich Text</TabsTrigger>
              </TabsList>
              
              <TabsContent value="text" className="h-full">
                <Textarea
                  placeholder="Type your message here..."
                  value={message.body || ''}
                  onChange={(e) => setMessage(prev => ({ ...prev, body: e.target.value }))}
                  className="h-full resize-none"
                />
              </TabsContent>
              
              <TabsContent value="html" className="h-full">
                <div
                  ref={editorRef}
                  contentEditable
                  className="h-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  dangerouslySetInnerHTML={{ __html: message.body || '' }}
                  onInput={(e) => {
                    const content = e.currentTarget.innerHTML
                    setMessage(prev => ({ ...prev, body: content }))
                  }}
                  style={{ minHeight: '200px' }}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Attachments</h4>
              <div className="space-y-1">
                {message.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{attachment.filename}</span>
                    <Button variant="ghost" size="sm">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Options */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={message.requestReadReceipt || false}
                  onChange={(e) => setMessage(prev => ({ ...prev, requestReadReceipt: e.target.checked }))}
                />
                Request read receipt
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={message.isEncrypted || false}
                  onChange={(e) => setMessage(prev => ({ ...prev, isEncrypted: e.target.checked }))}
                />
                Encrypt message
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={message.isSigned || false}
                  onChange={(e) => setMessage(prev => ({ ...prev, isSigned: e.target.checked }))}
                />
                Digitally sign
              </label>
            </div>
            
            <div className="flex items-center gap-2">
              <span>Priority:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {message.priority || 'Normal'}
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setMessage(prev => ({ ...prev, priority: 'low' }))}>
                    Low
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setMessage(prev => ({ ...prev, priority: 'normal' }))}>
                    Normal
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setMessage(prev => ({ ...prev, priority: 'high' }))}>
                    High
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </DialogContent>
    </Dialog>
  )
}
