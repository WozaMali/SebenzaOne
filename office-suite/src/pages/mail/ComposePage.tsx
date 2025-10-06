'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Textarea } from '@/components/ui/textarea'
import { 
  Send, 
  Clock, 
  Save, 
  X, 
  Paperclip, 
  Image, 
  Link, 
  Table, 
  FileText, 
  Smile, 
  Calendar, 
  CheckSquare, 
  Bookmark, 
  Bot, 
  Mic, 
  Camera, 
  QrCode, 
  Building2, 
  Leaf, 
  Sparkles,
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
  Eraser,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Settings,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  ExternalLink,
  Download,
  Upload,
  Copy,
  Move,
  Trash2,
  Archive,
  Star,
  Flag,
  Tag,
  Filter,
  Search,
  RefreshCw,
  Wifi,
  WifiOff,
  Bell,
  BellOff,
  Cloud,
  CloudOff,
  Zap,
  Target,
  DollarSign,
  TrendingUp,
  Shield,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Users,
  Building,
  Home,
  Briefcase,
  GraduationCap,
  Award,
  Gift,
  Coffee,
  Sun,
  Moon,
  Star as StarIcon,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move3D,
  Layers,
  Grid3X3,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Pentagon,
  Octagon,
  Diamond,
  Heart as HeartIcon,
  Smile as SmileIcon,
  Frown,
  Meh,
  Laugh,
  Angry,
  Surprised,
  Confused,
  Kiss,
  Wink,
  Tongue,
  ThumbsUp as ThumbsUpIcon,
  ThumbsDown as ThumbsDownIcon,
  Clap,
  Fire,
  PartyPopper,
  Cake,
  Gift as GiftIcon,
  Crown,
  Gem,
  Sparkle,
  Rainbow,
  Sun as SunIcon,
  Moon as MoonIcon,
  Cloud as CloudIcon,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Thermometer,
  Droplets,
  Snowflake,
  Umbrella,
  TreePine,
  Trees,
  Flower2,
  Bug,
  Bird,
  Fish,
  Cat,
  Dog,
  Rabbit,
  Squirrel,
  Whale,
  Butterfly,
  Bee,
  Ladybug,
  Snail,
  Turtle,
  Frog,
  Lizard,
  Snake,
  Spider,
  Ant,
  Fly,
  Mosquito,
  Dragonfly,
  Mantis,
  Cricket,
  Grasshopper,
  Beetle,
  Worm,
  Octopus,
  Squid,
  Jellyfish,
  Starfish,
  Crab,
  Lobster,
  Shrimp,
  Fish as FishIcon,
  Whale as WhaleIcon,
  Dolphin,
  Shark,
  Penguin,
  Owl,
  Eagle,
  Hawk,
  Parrot,
  Peacock,
  Flamingo,
  Toucan,
  Hummingbird,
  Robin,
  Cardinal,
  Bluebird,
  Canary,
  Finch,
  Sparrow,
  Crow,
  Raven,
  Magpie,
  Jay,
  Woodpecker,
  Kingfisher,
  Heron,
  Stork,
  Crane,
  Swan,
  Duck,
  Goose,
  Chicken,
  Rooster,
  Turkey,
  Pheasant,
  Quail,
  Partridge,
  Grouse,
  Ptarmigan,
  Sandpiper,
  Plover,
  Curlew,
  Godwit,
  Snipe,
  Woodcock,
  Sanderling,
  Dunlin,
  Knot,
  Turnstone,
  Oystercatcher,
  Avocet,
  Stilt,
  Lapwing,
  Plover as PloverIcon,
  Sandpiper as SandpiperIcon,
  Curlew as CurlewIcon,
  Godwit as GodwitIcon,
  Snipe as SnipeIcon,
  Woodcock as WoodcockIcon,
  Sanderling as SanderlingIcon,
  Dunlin as DunlinIcon,
  Knot as KnotIcon,
  Turnstone as TurnstoneIcon,
  Oystercatcher as OystercatcherIcon,
  Avocet as AvocetIcon,
  Stilt as StiltIcon,
  Lapwing as LapwingIcon
} from 'lucide-react'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Draft {
  id: string
  subject: string
  lastModified: Date
  isActive: boolean
  content: string
  to: string[]
  cc: string[]
  bcc: string[]
  priority: 'low' | 'normal' | 'high' | 'urgent'
  labels: string[]
  isConfidential: boolean
  readReceipt: boolean
  encryption: boolean
  ecoBadge: boolean
}

interface Contact {
  id: string
  name: string
  email: string
  avatar?: string
  company?: string
  role?: string
  isRecent: boolean
  isFrequent: boolean
}

interface Attachment {
  id: string
  name: string
  size: number
  type: string
  url?: string
  isLocal: boolean
  isCloud: boolean
  preview?: string
}

interface Template {
  id: string
  name: string
  category: string
  content: string
  isSebenza: boolean
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

const sampleContacts: Contact[] = [
  { id: '1', name: 'FNB Partnership Team', email: 'partnerships@fnb.co.za', company: 'FNB', role: 'Partnerships', isRecent: true, isFrequent: true },
  { id: '2', name: 'Cape Town Municipality', email: 'waste-management@capetown.gov.za', company: 'City of Cape Town', role: 'Waste Management', isRecent: true, isFrequent: false },
  { id: '3', name: 'Woza Mali Community', email: 'community@wozamali.org', company: 'Woza Mali', role: 'Community', isRecent: false, isFrequent: true },
  { id: '4', name: 'GreenTech Partners', email: 'partnerships@greentech.co.za', company: 'GreenTech', role: 'Partnerships', isRecent: false, isFrequent: false },
  { id: '5', name: 'Sarah Mthembu', email: 'sarah@community.org', company: 'Community Leader', role: 'Leader', isRecent: true, isFrequent: true }
]

const sampleTemplates: Template[] = [
  { id: '1', name: 'FNB Pitch Proposal', category: 'Business', content: 'Dear FNB Team,\n\nWe are excited to present our Upcycle Day initiative...', isSebenza: true },
  { id: '2', name: 'Workshop Invitation', category: 'Community', content: 'Join us for our next sustainability workshop...', isSebenza: true },
  { id: '3', name: 'Woza Mali Update', category: 'Community', content: 'Weekly update on community activities...', isSebenza: true },
  { id: '4', name: 'Partnership Inquiry', category: 'Business', content: 'We would like to explore partnership opportunities...', isSebenza: false }
]

// ============================================================================
// COMPONENTS
// ============================================================================

const Taskbar = ({ 
  onSend, 
  onSchedule, 
  onSave, 
  onDiscard, 
  onAttach, 
  onInsertImage, 
  onInsertLink, 
  onInsertTable, 
  onInsertSignature, 
  onInsertTemplate, 
  onInsertEmoji, 
  onInsertCalendar, 
  onInsertTask, 
  onInsertBookmark,
  onAIAssist,
  onVoiceToText,
  onCameraAttach,
  onConvertToProposal,
  onEcoBadgeToggle,
  ecoBadge
}: {
  onSend: () => void
  onSchedule: () => void
  onSave: () => void
  onDiscard: () => void
  onAttach: () => void
  onInsertImage: () => void
  onInsertLink: () => void
  onInsertTable: () => void
  onInsertSignature: () => void
  onInsertTemplate: () => void
  onInsertEmoji: () => void
  onInsertCalendar: () => void
  onInsertTask: () => void
  onInsertBookmark: () => void
  onAIAssist: () => void
  onVoiceToText: () => void
  onCameraAttach: () => void
  onConvertToProposal: () => void
  onEcoBadgeToggle: () => void
  ecoBadge: boolean
}) => {
  return (
    <div className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="flex items-center justify-between p-4">
        {/* Left Actions */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={onSend}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
              >
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Send email (Ctrl+Enter)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={onSchedule}>
                <Clock className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Schedule send</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={onSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Save as draft (Ctrl+S)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={onDiscard}>
                <X className="h-4 w-4 mr-2" />
                Discard
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Discard changes</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Center Actions */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onAttach}>
                <Paperclip className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Attach files</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onInsertImage}>
                <Image className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Insert image</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onInsertLink}>
                <Link className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Insert link</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onInsertTable}>
                <Table className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Insert table</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onInsertSignature}>
                <FileText className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Insert signature</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onInsertTemplate}>
                <FileText className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Insert template</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onInsertEmoji}>
                <Smile className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Insert emoji</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onInsertCalendar}>
                <Calendar className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Insert calendar invite</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onInsertTask}>
                <CheckSquare className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Insert task/note</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onInsertBookmark}>
                <Bookmark className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Insert bookmark</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onAIAssist}>
                <Bot className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>AI Assist</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onVoiceToText}>
                <Mic className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Voice to text</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onCameraAttach}>
                <Camera className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Quick attach from camera</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onConvertToProposal}>
                <Sparkles className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Convert to Sebenza proposal</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={ecoBadge ? "default" : "ghost"} 
                size="sm" 
                onClick={onEcoBadgeToggle}
                className={ecoBadge ? "bg-emerald-600 hover:bg-emerald-700" : ""}
              >
                <Leaf className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Eco-badge: "Sent with Sebenza Nathi Waste"</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}

const Editor = ({ 
  content, 
  onChange, 
  onFormatChange 
}: {
  content: string
  onChange: (content: string) => void
  onFormatChange: (format: string) => void
}) => {
  const [isFormatting, setIsFormatting] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  const formatButtons = [
    { name: 'bold', icon: Bold, command: 'bold' },
    { name: 'italic', icon: Italic, command: 'italic' },
    { name: 'underline', icon: Underline, command: 'underline' },
    { name: 'strikethrough', icon: Strikethrough, command: 'strikeThrough' },
    { name: 'color', icon: Palette, command: 'foreColor' },
    { name: 'highlight', icon: Highlighter, command: 'backColor' },
    { name: 'bullet', icon: List, command: 'insertUnorderedList' },
    { name: 'numbered', icon: ListOrdered, command: 'insertOrderedList' },
    { name: 'indent', icon: Indent, command: 'indent' },
    { name: 'outdent', icon: Outdent, command: 'outdent' },
    { name: 'alignLeft', icon: AlignLeft, command: 'justifyLeft' },
    { name: 'alignCenter', icon: AlignCenter, command: 'justifyCenter' },
    { name: 'alignRight', icon: AlignRight, command: 'justifyRight' },
    { name: 'quote', icon: Quote, command: 'formatBlock', value: 'blockquote' },
    { name: 'code', icon: Code, command: 'formatBlock', value: 'pre' },
    { name: 'clear', icon: Eraser, command: 'removeFormat' }
  ]

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  const handleContentChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Formatting Toolbar */}
      <div className="bg-muted/50 border-b border-border p-2">
        <div className="flex items-center gap-1 flex-wrap">
          {formatButtons.map((button) => (
            <Tooltip key={button.name}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFormat(button.command, button.value)}
                  className="h-8 w-8 p-0"
                >
                  <button.icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{button.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-4">
        <div
          ref={editorRef}
          contentEditable
          className="min-h-[400px] w-full p-4 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          onInput={handleContentChange}
          dangerouslySetInnerHTML={{ __html: content }}
          style={{ minHeight: '400px' }}
        />
      </div>
    </div>
  )
}

const SidebarInsert = ({ 
  onInsertWorkshopFlyer, 
  onInsertQRCode, 
  onInsertPartnerLogo 
}: {
  onInsertWorkshopFlyer: () => void
  onInsertQRCode: () => void
  onInsertPartnerLogo: () => void
}) => {
  return (
    <div className="w-16 bg-muted/30 border-r border-border flex flex-col items-center py-4 gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" onClick={onInsertWorkshopFlyer}>
            <Calendar className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Insert Workshop Flyer</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" onClick={onInsertQRCode}>
            <QrCode className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Insert Woza Mali QR Code</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" onClick={onInsertPartnerLogo}>
            <Building2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Insert Partner Logo</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

const InfoPanel = ({ 
  contacts, 
  onContactSelect, 
  reminders, 
  attachments 
}: {
  contacts: Contact[]
  onContactSelect: (contact: Contact) => void
  reminders: string[]
  attachments: Attachment[]
}) => {
  return (
    <div className="w-80 bg-muted/30 border-l border-border p-4">
      <div className="space-y-6">
        {/* Smart Contact Suggestions */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Smart Suggestions</h3>
          <div className="space-y-2">
            {contacts.slice(0, 5).map((contact) => (
              <div
                key={contact.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                onClick={() => onContactSelect(contact)}
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm">
                  {contact.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{contact.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{contact.email}</p>
                </div>
                {contact.isFrequent && (
                  <Star className="h-3 w-3 text-yellow-500" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Reminders */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Reminders</h3>
          <div className="space-y-2">
            {reminders.map((reminder, index) => (
              <div key={index} className="text-xs text-muted-foreground p-2 bg-muted rounded">
                {reminder}
              </div>
            ))}
          </div>
        </div>

        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Attachments</h3>
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                  <Paperclip className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-foreground truncate">{attachment.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const DraftTabs = ({ 
  drafts, 
  activeDraft, 
  onDraftSelect, 
  onDraftClose, 
  onNewDraft 
}: {
  drafts: Draft[]
  activeDraft: string | null
  onDraftSelect: (draftId: string) => void
  onDraftClose: (draftId: string) => void
  onNewDraft: () => void
}) => {
  return (
    <div className="bg-muted/50 border-b border-border">
      <div className="flex items-center">
        {drafts.map((draft) => (
          <div
            key={draft.id}
            className={`flex items-center gap-2 px-4 py-2 border-r border-border cursor-pointer transition-colors ${
              activeDraft === draft.id 
                ? 'bg-background text-foreground border-b-2 border-primary' 
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
            onClick={() => onDraftSelect(draft.id)}
          >
            <span className="text-sm font-medium truncate max-w-32">
              {draft.subject || 'Untitled'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDraftClose(draft.id)
              }}
              className="h-4 w-4 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <Button variant="ghost" size="sm" onClick={onNewDraft} className="ml-2">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ComposePage() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [drafts, setDrafts] = useState<Draft[]>([
    {
      id: '1',
      subject: 'FNB Partnership Proposal',
      lastModified: new Date(),
      isActive: true,
      content: '',
      to: [],
      cc: [],
      bcc: [],
      priority: 'normal',
      labels: [],
      isConfidential: false,
      readReceipt: false,
      encryption: false,
      ecoBadge: true
    }
  ])
  
  const [activeDraft, setActiveDraft] = useState<string>('1')
  const [currentDraft, setCurrentDraft] = useState<Draft>(drafts[0])
  const [contacts] = useState<Contact[]>(sampleContacts)
  const [templates] = useState<Template[]>(sampleTemplates)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [reminders] = useState<string[]>([
    'Follow up on FNB proposal in 3 days',
    'Schedule workshop for next week',
    'Send Woza Mali community update'
  ])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleSend = useCallback(() => {
    console.log('Sending email:', currentDraft)
    // TODO: Implement send functionality
  }, [currentDraft])

  const handleSchedule = useCallback(() => {
    console.log('Scheduling email:', currentDraft)
    // TODO: Implement schedule functionality
  }, [currentDraft])

  const handleSave = useCallback(() => {
    console.log('Saving draft:', currentDraft)
    // TODO: Implement save functionality
  }, [currentDraft])

  const handleDiscard = useCallback(() => {
    console.log('Discarding changes')
    // TODO: Implement discard functionality
  }, [])

  const handleAttach = useCallback(() => {
    console.log('Attaching files')
    // TODO: Implement attach functionality
  }, [])

  const handleInsertImage = useCallback(() => {
    console.log('Inserting image')
    // TODO: Implement insert image functionality
  }, [])

  const handleInsertLink = useCallback(() => {
    console.log('Inserting link')
    // TODO: Implement insert link functionality
  }, [])

  const handleInsertTable = useCallback(() => {
    console.log('Inserting table')
    // TODO: Implement insert table functionality
  }, [])

  const handleInsertSignature = useCallback(() => {
    console.log('Inserting signature')
    // TODO: Implement insert signature functionality
  }, [])

  const handleInsertTemplate = useCallback(() => {
    console.log('Inserting template')
    // TODO: Implement insert template functionality
  }, [])

  const handleInsertEmoji = useCallback(() => {
    console.log('Inserting emoji')
    // TODO: Implement insert emoji functionality
  }, [])

  const handleInsertCalendar = useCallback(() => {
    console.log('Inserting calendar invite')
    // TODO: Implement insert calendar functionality
  }, [])

  const handleInsertTask = useCallback(() => {
    console.log('Inserting task/note')
    // TODO: Implement insert task functionality
  }, [])

  const handleInsertBookmark = useCallback(() => {
    console.log('Inserting bookmark')
    // TODO: Implement insert bookmark functionality
  }, [])

  const handleAIAssist = useCallback(() => {
    console.log('AI Assist')
    // TODO: Implement AI assist functionality
  }, [])

  const handleVoiceToText = useCallback(() => {
    console.log('Voice to text')
    // TODO: Implement voice to text functionality
  }, [])

  const handleCameraAttach = useCallback(() => {
    console.log('Camera attach')
    // TODO: Implement camera attach functionality
  }, [])

  const handleConvertToProposal = useCallback(() => {
    console.log('Convert to proposal')
    // TODO: Implement convert to proposal functionality
  }, [])

  const handleEcoBadgeToggle = useCallback(() => {
    setCurrentDraft(prev => ({ ...prev, ecoBadge: !prev.ecoBadge }))
  }, [])

  const handleInsertWorkshopFlyer = useCallback(() => {
    console.log('Inserting workshop flyer')
    // TODO: Implement insert workshop flyer functionality
  }, [])

  const handleInsertQRCode = useCallback(() => {
    console.log('Inserting QR code')
    // TODO: Implement insert QR code functionality
  }, [])

  const handleInsertPartnerLogo = useCallback(() => {
    console.log('Inserting partner logo')
    // TODO: Implement insert partner logo functionality
  }, [])

  const handleContactSelect = useCallback((contact: Contact) => {
    setCurrentDraft(prev => ({
      ...prev,
      to: [...prev.to, contact.email]
    }))
  }, [])

  const handleDraftSelect = useCallback((draftId: string) => {
    setActiveDraft(draftId)
    const draft = drafts.find(d => d.id === draftId)
    if (draft) {
      setCurrentDraft(draft)
    }
  }, [drafts])

  const handleDraftClose = useCallback((draftId: string) => {
    setDrafts(prev => prev.filter(d => d.id !== draftId))
    if (activeDraft === draftId) {
      const remainingDrafts = drafts.filter(d => d.id !== draftId)
      if (remainingDrafts.length > 0) {
        setActiveDraft(remainingDrafts[0].id)
        setCurrentDraft(remainingDrafts[0])
      } else {
        setActiveDraft('')
        setCurrentDraft(drafts[0])
      }
    }
  }, [activeDraft, drafts])

  const handleNewDraft = useCallback(() => {
    const newDraft: Draft = {
      id: Date.now().toString(),
      subject: '',
      lastModified: new Date(),
      isActive: true,
      content: '',
      to: [],
      cc: [],
      bcc: [],
      priority: 'normal',
      labels: [],
      isConfidential: false,
      readReceipt: false,
      encryption: false,
      ecoBadge: false
    }
    setDrafts(prev => [...prev, newDraft])
    setActiveDraft(newDraft.id)
    setCurrentDraft(newDraft)
  }, [])

  const handleContentChange = useCallback((content: string) => {
    setCurrentDraft(prev => ({ ...prev, content }))
  }, [])

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        {/* Draft Tabs */}
        <DraftTabs
          drafts={drafts}
          activeDraft={activeDraft}
          onDraftSelect={handleDraftSelect}
          onDraftClose={handleDraftClose}
          onNewDraft={handleNewDraft}
        />

        {/* Taskbar */}
        <Taskbar
          onSend={handleSend}
          onSchedule={handleSchedule}
          onSave={handleSave}
          onDiscard={handleDiscard}
          onAttach={handleAttach}
          onInsertImage={handleInsertImage}
          onInsertLink={handleInsertLink}
          onInsertTable={handleInsertTable}
          onInsertSignature={handleInsertSignature}
          onInsertTemplate={handleInsertTemplate}
          onInsertEmoji={handleInsertEmoji}
          onInsertCalendar={handleInsertCalendar}
          onInsertTask={handleInsertTask}
          onInsertBookmark={handleInsertBookmark}
          onAIAssist={handleAIAssist}
          onVoiceToText={handleVoiceToText}
          onCameraAttach={handleCameraAttach}
          onConvertToProposal={handleConvertToProposal}
          onEcoBadgeToggle={handleEcoBadgeToggle}
          ecoBadge={currentDraft.ecoBadge}
        />

        <div className="flex h-[calc(100vh-120px)]">
          {/* Left Sidebar */}
          <SidebarInsert
            onInsertWorkshopFlyer={handleInsertWorkshopFlyer}
            onInsertQRCode={handleInsertQRCode}
            onInsertPartnerLogo={handleInsertPartnerLogo}
          />

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Addressing Fields */}
            <div className="p-4 border-b border-border bg-muted/30">
              <div className="space-y-3">
                {/* From */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-foreground w-12">From:</label>
                  <Select>
                    <SelectTrigger className="flex-1">
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
                  <label className="text-sm font-medium text-foreground w-12">To:</label>
                  <Input 
                    placeholder="Enter recipients" 
                    className="flex-1"
                    value={currentDraft.to.join(', ')}
                    onChange={(e) => setCurrentDraft(prev => ({ ...prev, to: e.target.value.split(',').map(email => email.trim()) }))}
                  />
                </div>

                {/* Cc */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-foreground w-12">Cc:</label>
                  <Input 
                    placeholder="Enter CC recipients" 
                    className="flex-1"
                    value={currentDraft.cc.join(', ')}
                    onChange={(e) => setCurrentDraft(prev => ({ ...prev, cc: e.target.value.split(',').map(email => email.trim()) }))}
                  />
                </div>

                {/* Bcc */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-foreground w-12">Bcc:</label>
                  <Input 
                    placeholder="Enter BCC recipients" 
                    className="flex-1"
                    value={currentDraft.bcc.join(', ')}
                    onChange={(e) => setCurrentDraft(prev => ({ ...prev, bcc: e.target.value.split(',').map(email => email.trim()) }))}
                  />
                </div>

                {/* Subject */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-foreground w-12">Subject:</label>
                  <Input 
                    placeholder="Enter subject" 
                    className="flex-1"
                    value={currentDraft.subject}
                    onChange={(e) => setCurrentDraft(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>

                {/* Options */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="confidential"
                      checked={currentDraft.isConfidential}
                      onCheckedChange={(checked) => setCurrentDraft(prev => ({ ...prev, isConfidential: !!checked }))}
                    />
                    <label htmlFor="confidential" className="text-sm text-foreground">Confidential</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="readReceipt"
                      checked={currentDraft.readReceipt}
                      onCheckedChange={(checked) => setCurrentDraft(prev => ({ ...prev, readReceipt: !!checked }))}
                    />
                    <label htmlFor="readReceipt" className="text-sm text-foreground">Read Receipt</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="encryption"
                      checked={currentDraft.encryption}
                      onCheckedChange={(checked) => setCurrentDraft(prev => ({ ...prev, encryption: !!checked }))}
                    />
                    <label htmlFor="encryption" className="text-sm text-foreground">Encryption</label>
                  </div>
                </div>
              </div>
            </div>

            {/* Editor */}
            <Editor
              content={currentDraft.content}
              onChange={handleContentChange}
              onFormatChange={() => {}}
            />
          </div>

          {/* Right Info Panel */}
          <InfoPanel
            contacts={contacts}
            onContactSelect={handleContactSelect}
            reminders={reminders}
            attachments={attachments}
          />
        </div>
      </div>
    </TooltipProvider>
  )
}
