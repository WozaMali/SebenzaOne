"use client"

import { useState, useRef, useEffect } from "react"
import { 
  MessageCircle, Users, Video, Phone, Paperclip, Smile, Send, 
  MoreHorizontal, Search, Bell, Settings, Camera, Mic, MicOff,
  Share2, Heart, ThumbsUp, Reply, Forward, Bookmark, Flag,
  Calendar, FileText, Image, Music, Play, Pause, Volume2,
  Globe, Lock, Shield, Zap, Star, Award, TrendingUp,
  Coffee, Pizza, Cake, Gift, PartyPopper,
  MapPin, Clock, CheckCircle, AlertCircle, Info,
  ChevronDown, ChevronRight, Plus, Minus, X,
  Download, Upload, Edit, Trash2, Archive, Pin
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { SocialIntegration } from "./SocialIntegration"
import { FileCollaboration } from "./FileCollaboration"

// Types
interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  status: 'online' | 'away' | 'busy' | 'offline'
  role: string
  department: string
  lastSeen: Date
  isTyping?: boolean
}

interface Message {
  id: string
  content: string
  type: 'text' | 'image' | 'file' | 'voice' | 'video' | 'reaction' | 'announcement'
  sender: User
  timestamp: Date
  edited?: boolean
  reactions?: { emoji: string; users: string[] }[]
  replyTo?: Message
  attachments?: Attachment[]
  isPinned?: boolean
  isAnnouncement?: boolean
}

interface Attachment {
  id: string
  name: string
  type: string
  size: number
  url: string
  thumbnail?: string
}

interface Channel {
  id: string
  name: string
  type: 'public' | 'private' | 'dm'
  description?: string
  members: User[]
  unreadCount: number
  lastMessage?: Message
  isPinned?: boolean
  isMuted?: boolean
}

interface SocialPost {
  id: string
  platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'internal'
  content: string
  author: User
  timestamp: Date
  likes: number
  comments: number
  shares: number
  media?: Attachment[]
  hashtags?: string[]
  mentions?: User[]
}

// Sample data
const sampleUsers: User[] = [
  {
    id: "user-1",
    name: "Sarah Johnson",
    email: "sarah@company.com",
    avatar: "/placeholder-avatar.jpg",
    status: "online",
    role: "Marketing Director",
    department: "Marketing",
    lastSeen: new Date(),
  },
  {
    id: "user-2",
    name: "Mike Chen",
    email: "mike@company.com",
    avatar: "/placeholder-avatar.jpg",
    status: "away",
    role: "Senior Developer",
    department: "Engineering",
    lastSeen: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: "user-3",
    name: "Lisa Rodriguez",
    email: "lisa@company.com",
    avatar: "/placeholder-avatar.jpg",
    status: "busy",
    role: "Sales Manager",
    department: "Sales",
    lastSeen: new Date(Date.now() - 10 * 60 * 1000),
  },
  {
    id: "user-4",
    name: "David Kim",
    email: "david@company.com",
    avatar: "/placeholder-avatar.jpg",
    status: "online",
    role: "Designer",
    department: "Design",
    lastSeen: new Date(),
  },
  {
    id: "user-5",
    name: "Emma Wilson",
    email: "emma@company.com",
    avatar: "/placeholder-avatar.jpg",
    status: "offline",
    role: "HR Manager",
    department: "Human Resources",
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
]

const sampleChannels: Channel[] = [
  {
    id: "general",
    name: "General",
    type: "public",
    description: "Company-wide announcements and general discussion",
    members: sampleUsers,
    unreadCount: 3,
    isPinned: true,
  },
  {
    id: "marketing",
    name: "Marketing",
    type: "public",
    description: "Marketing team discussions",
    members: sampleUsers.filter(u => u.department === "Marketing"),
    unreadCount: 1,
  },
  {
    id: "engineering",
    name: "Engineering",
    type: "public",
    description: "Engineering team discussions",
    members: sampleUsers.filter(u => u.department === "Engineering"),
    unreadCount: 0,
  },
  {
    id: "sales",
    name: "Sales",
    type: "public",
    description: "Sales team discussions",
    members: sampleUsers.filter(u => u.department === "Sales"),
    unreadCount: 2,
  },
  {
    id: "random",
    name: "Random",
    type: "public",
    description: "Non-work banter and fun",
    members: sampleUsers,
    unreadCount: 0,
  },
]

const sampleMessages: Message[] = [
  {
    id: "msg-1",
    content: "Good morning team! Ready for our Q4 planning meeting?",
    type: "text",
    sender: sampleUsers[0],
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    reactions: [
      { emoji: "👍", users: ["user-2", "user-3"] },
      { emoji: "🚀", users: ["user-4"] }
    ],
    isAnnouncement: true,
  },
  {
    id: "msg-2",
    content: "Absolutely! I've prepared the marketing strategy presentation.",
    type: "text",
    sender: sampleUsers[1],
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    replyTo: {
      id: "msg-1",
      content: "Good morning team! Ready for our Q4 planning meeting?",
      type: "text",
      sender: sampleUsers[0],
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
    },
  },
  {
    id: "msg-3",
    content: "Here's the updated design mockups for the new feature",
    type: "image",
    sender: sampleUsers[3],
    timestamp: new Date(Date.now() - 20 * 60 * 1000),
    attachments: [
      {
        id: "att-1",
        name: "design-mockup-v2.png",
        type: "image/png",
        size: 2048576,
        url: "/design-mockup-v2.png",
        thumbnail: "/design-mockup-v2-thumb.png",
      }
    ],
    reactions: [
      { emoji: "❤️", users: ["user-0", "user-1"] },
      { emoji: "🔥", users: ["user-2"] }
    ],
  },
  {
    id: "msg-4",
    content: "This looks amazing! The UX flow is much cleaner now.",
    type: "text",
    sender: sampleUsers[2],
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    reactions: [
      { emoji: "👍", users: ["user-1", "user-3"] }
    ],
  },
  {
    id: "msg-5",
    content: "Thanks everyone! Let's schedule a review meeting for tomorrow.",
    type: "text",
    sender: sampleUsers[3],
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    isPinned: true,
  },
]

const sampleSocialPosts: SocialPost[] = [
  {
    id: "post-1",
    platform: "linkedin",
    content: "Excited to share our latest product launch! The team has been working incredibly hard on this new feature that will revolutionize how our customers manage their workflows. #ProductLaunch #Innovation #TeamWork",
    author: sampleUsers[0],
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    likes: 24,
    comments: 8,
    shares: 12,
    hashtags: ["#ProductLaunch", "#Innovation", "#TeamWork"],
    mentions: [sampleUsers[1], sampleUsers[3]],
  },
  {
    id: "post-2",
    platform: "internal",
    content: "🎉 Congratulations to our Engineering team for completing the Q3 sprint ahead of schedule! Your dedication and hard work doesn't go unnoticed. #TeamAppreciation #Engineering #Success",
    author: sampleUsers[4],
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    likes: 45,
    comments: 12,
    shares: 6,
    hashtags: ["#TeamAppreciation", "#Engineering", "#Success"],
    mentions: sampleUsers.filter(u => u.department === "Engineering"),
  },
  {
    id: "post-3",
    platform: "twitter",
    content: "Just had an amazing brainstorming session with the team! The creativity and energy in the room was incredible. Can't wait to see what we build next! 🚀",
    author: sampleUsers[3],
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    likes: 18,
    comments: 5,
    shares: 3,
    hashtags: ["#Brainstorming", "#Creativity", "#Innovation"],
  },
]

export function ConnectPage() {
  const [activeTab, setActiveTab] = useState("chat")
  const [channels, setChannels] = useState<Channel[]>(sampleChannels)
  const [selectedChannel, setSelectedChannel] = useState<Channel>(sampleChannels[0])
  const [message, setMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showUserStatus, setShowUserStatus] = useState(true)
  const [showNotifications, setShowNotifications] = useState(true)
  const [createChannelOpen, setCreateChannelOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<{channels: Channel[], messages: Message[], users: User[]}>({channels: [], messages: [], users: []})
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedEmoji, setSelectedEmoji] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [showChannelSettings, setShowChannelSettings] = useState(false)
  const [showUserProfile, setShowUserProfile] = useState<User | null>(null)
  const [notificationCount, setNotificationCount] = useState(0)
  const [isOnline, setIsOnline] = useState(true)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [newChannelName, setNewChannelName] = useState("")
  const [newChannelDescription, setNewChannelDescription] = useState("")
  const [newChannelType, setNewChannelType] = useState<'public' | 'private'>('public')
  const [messagesByChannel, setMessagesByChannel] = useState<Record<string, Message[]>>({
    [sampleChannels[0].id]: [...sampleMessages],
  })
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [showOnlineUsers, setShowOnlineUsers] = useState(true)
  const [showChannelMembers, setShowChannelMembers] = useState(false)
  const [pinnedMessages, setPinnedMessages] = useState<Message[]>([])
  const [showPinnedMessages, setShowPinnedMessages] = useState(false)
  const [recentFiles, setRecentFiles] = useState<Attachment[]>([])
  const [showRecentFiles, setShowRecentFiles] = useState(false)
  const me: User = sampleUsers[0]
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRecorderRef = useRef<MediaRecorder | null>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messagesByChannel, selectedChannel])

  const handleSendMessage = () => {
    if (message.trim()) {
      const msg: Message = {
        id: `msg-${Date.now()}`,
        content: message.trim(),
        type: 'text',
        sender: me,
        timestamp: new Date(),
      }
      setMessagesByChannel(prev => ({
        ...prev,
        [selectedChannel.id]: [...(prev[selectedChannel.id] || []), msg]
      }))
      setMessage("")
      setIsTyping(false)
      setTypingUsers([])
    }
  }

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    if (e.target.value.trim() && !isTyping) {
      setIsTyping(true)
      // Simulate other users typing
      setTimeout(() => {
        setTypingUsers(prev => [...prev.filter(id => id !== me.id), me.id])
      }, 1000)
    } else if (!e.target.value.trim()) {
      setIsTyping(false)
      setTypingUsers(prev => prev.filter(id => id !== me.id))
    }
  }

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults({channels: [], messages: [], users: []})
      setShowSearchResults(false)
      return
    }

    const searchLower = query.toLowerCase()
    const channelResults = channels.filter(channel => 
      channel.name.toLowerCase().includes(searchLower) ||
      channel.description?.toLowerCase().includes(searchLower)
    )
    
    const messageResults: Message[] = []
    Object.values(messagesByChannel).flat().forEach(msg => {
      if (msg.content.toLowerCase().includes(searchLower)) {
        messageResults.push(msg)
      }
    })
    
    const userResults = sampleUsers.filter(user =>
      user.name.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower) ||
      user.department.toLowerCase().includes(searchLower)
    )

    setSearchResults({
      channels: channelResults,
      messages: messageResults,
      users: userResults
    })
    setShowSearchResults(true)
  }

  const handleReaction = (messageId: string, emoji: string) => {
    setMessagesByChannel(prev => {
      const channelMessages = prev[selectedChannel.id] || []
      const updatedMessages = channelMessages.map(msg => {
        if (msg.id === messageId) {
          const existingReaction = msg.reactions?.find(r => r.emoji === emoji)
          if (existingReaction) {
            if (existingReaction.users.includes(me.id)) {
              // Remove reaction
              existingReaction.users = existingReaction.users.filter(id => id !== me.id)
              if (existingReaction.users.length === 0) {
                msg.reactions = msg.reactions?.filter(r => r.emoji !== emoji)
              }
            } else {
              // Add user to reaction
              existingReaction.users.push(me.id)
            }
          } else {
            // Add new reaction
            msg.reactions = [...(msg.reactions || []), { emoji, users: [me.id] }]
          }
        }
        return msg
      })
      return { ...prev, [selectedChannel.id]: updatedMessages }
    })
  }

  const handlePinMessage = (messageId: string) => {
    const message = messagesByChannel[selectedChannel.id]?.find(m => m.id === messageId)
    if (message) {
      setPinnedMessages(prev => [...prev, message])
      setMessagesByChannel(prev => {
        const channelMessages = prev[selectedChannel.id] || []
        const updatedMessages = channelMessages.map(msg => 
          msg.id === messageId ? { ...msg, isPinned: true } : msg
        )
        return { ...prev, [selectedChannel.id]: updatedMessages }
      })
    }
  }

  const handleReplyToMessage = (messageId: string) => {
    const message = messagesByChannel[selectedChannel.id]?.find(m => m.id === messageId)
    if (message) {
      setMessage(`@${message.sender.name} `)
      // Focus on message input
      document.querySelector('textarea')?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const atts: Attachment[] = Array.from(files).map((f, idx) => ({
        id: `att-${Date.now()}-${idx}`,
        name: f.name,
        type: f.type || 'application/octet-stream',
        size: f.size,
        url: '',
      }))
      const msg: Message = {
        id: `msg-${Date.now()}`,
        content: `Sent ${atts.length} file(s)`,
        type: 'file',
        sender: me,
        timestamp: new Date(),
        attachments: atts,
      }
      setMessagesByChannel(prev => ({
        ...prev,
        [selectedChannel.id]: [...(prev[selectedChannel.id] || []), msg]
      }))
    }
  }

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      audioRecorderRef.current = recorder
      setIsRecording(true)
      
      const audioChunks: Blob[] = []
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
        }
      }
      
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
        const audioUrl = URL.createObjectURL(audioBlob)
        
        // Create a voice message
        const voiceMessage: Message = {
          id: `voice-${Date.now()}`,
          content: "🎤 Voice message",
          type: 'voice',
          sender: me,
          timestamp: new Date(),
          attachments: [{
            id: `voice-${Date.now()}`,
            name: `Voice message ${new Date().toLocaleTimeString()}`,
            type: 'audio',
            url: audioUrl,
            size: audioBlob.size
          }]
        }
        
        setMessagesByChannel(prev => ({
          ...prev,
          [selectedChannel.id]: [...(prev[selectedChannel.id] || []), voiceMessage]
        }))
        
        // Clean up
        stream.getTracks().forEach(track => track.stop())
        setIsRecording(false)
        audioRecorderRef.current = null
      }
      
      recorder.start()
    } catch (error) {
      console.error("Error starting voice recording:", error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopVoiceRecording = () => {
    if (audioRecorderRef.current && isRecording) {
      audioRecorderRef.current.stop()
    }
  }

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'busy': return 'bg-red-500'
      case 'offline': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="h-full flex bg-background connect-page-container" style={{paddingTop: '4rem', marginTop: '0', marginLeft: '0', paddingLeft: '0', position: 'relative', zIndex: '10', left: '0'}}>
      <style dangerouslySetInnerHTML={{
        __html: `
          .connect-page-container {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 100% !important;
            display: flex !important;
            flex-direction: row !important;
            align-items: stretch !important;
            margin-top: 0 !important;
            margin-left: 0 !important;
            padding-top: 4rem !important;
            padding-left: 0 !important;
            position: relative !important;
            top: 0 !important;
            left: 0 !important;
            z-index: 10 !important;
            transform: translateY(0) !important;
            min-height: calc(100vh - 6rem) !important;
          }
          .connect-left-panel {
            width: 205px !important;
            min-width: 205px !important;
            max-width: 205px !important;
            flex-shrink: 0 !important;
            flex-grow: 0 !important;
            flex-basis: 205px !important;
          }
          .connect-left-panel > div:first-child {
            padding-top: 6rem !important;
            margin-top: 0 !important;
            position: relative !important;
            top: 0 !important;
            z-index: 11 !important;
          }
          .connect-right-panel {
            flex: 1 !important;
            min-width: 0 !important;
            width: auto !important;
            max-width: none !important;
            flex-grow: 1 !important;
            flex-shrink: 1 !important;
            flex-basis: auto !important;
            overflow: hidden !important;
            background: transparent !important;
            background-color: transparent !important;
          }
          .connect-messages-scroll {
            height: calc(100vh - 300px) !important;
            max-height: calc(100vh - 300px) !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            background: transparent !important;
            background-color: transparent !important;
          }
          .connect-messages-scroll:hover {
            background: transparent !important;
            background-color: transparent !important;
          }
          .connect-messages-scroll [data-radix-scroll-area-viewport] {
            background: transparent !important;
            background-color: transparent !important;
          }
          .connect-messages-scroll [data-radix-scroll-area-viewport]:hover {
            background: transparent !important;
            background-color: transparent !important;
          }
          /* FORCE TRANSPARENT BACKGROUNDS ON ALL HOVER STATES */
          .connect-messages-scroll *:hover {
            background: transparent !important;
            background-color: transparent !important;
          }
          .connect-messages-scroll * {
            background: transparent !important;
            background-color: transparent !important;
          }
          /* LEFT PANEL SCROLL OVERRIDES */
          .connect-left-panel [data-radix-scroll-area-viewport] {
            overflow-y: auto !important;
            max-height: calc(100vh - 200px) !important;
          }
          .connect-left-panel .overflow-y-auto {
            overflow-y: auto !important;
            max-height: calc(100vh - 200px) !important;
          }
          /* RIGHT PANEL SCROLL OVERRIDES */
          .connect-right-panel [data-radix-scroll-area-viewport] {
            overflow-y: auto !important;
            max-height: calc(100vh - 200px) !important;
          }
          .connect-right-panel .overflow-y-auto {
            overflow-y: auto !important;
            max-height: calc(100vh - 200px) !important;
          }
          /* ULTRA AGGRESSIVE CONNECT PAGE OVERRIDE */
          html body .connect-page-container,
          html body div[class*="connect-page-container"],
          html body main > div[class*="connect"],
          .connect-page-container,
          div[class*="connect-page-container"],
          main > div[class*="connect"] {
            padding-top: 4rem !important;
            margin-top: 0 !important;
            margin-left: 0 !important;
            padding-left: 0 !important;
            position: relative !important;
            top: 0 !important;
            left: 0 !important;
            z-index: 10 !important;
            transform: translateY(0) !important;
            min-height: calc(100vh - 6rem) !important;
          }
          /* NUCLEAR OPTION - FORCE ALL CONNECT ELEMENTS */
          html body div[class*="connect"] {
            padding-top: 4rem !important;
            margin-top: 0 !important;
            position: relative !important;
            top: 0 !important;
            z-index: 10 !important;
            transform: translateY(0) !important;
          }
        `
      }} />
      {/* Left Sidebar - Channels & Users */}
      <div className="w-52 border-r border-border bg-card/50 flex flex-col connect-left-panel" style={{width: '205px', minWidth: '205px', maxWidth: '205px'}}>
        {/* Header */}
        <div className="p-4 border-b border-border" style={{paddingTop: '6rem'}}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-orange-600">Connect</h2>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search channels, messages, or people..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                handleSearch(e.target.value)
              }}
              className="pl-10 text-sm"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2 mx-4 mb-4 bg-transparent">
            <TabsTrigger value="chat" className="text-xs bg-transparent data-[state=active]:bg-orange-100 data-[state=active]:text-orange-600">Chat</TabsTrigger>
            <TabsTrigger value="social" className="text-xs bg-transparent data-[state=active]:bg-orange-100 data-[state=active]:text-orange-600">Social</TabsTrigger>
            <TabsTrigger value="files" className="text-xs bg-transparent data-[state=active]:bg-orange-100 data-[state=active]:text-orange-600">Files</TabsTrigger>
            <TabsTrigger value="company" className="text-xs bg-transparent data-[state=active]:bg-orange-100 data-[state=active]:text-orange-600">Company</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/50">
            {/* Search Results */}
            {showSearchResults && searchQuery && (
              <div className="px-4 mb-4 border-b border-border pb-4">
                <h3 className="text-xs font-semibold text-muted-foreground mb-2">Search Results for "{searchQuery}"</h3>
                {searchResults.channels.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-xs font-medium mb-2">Channels</h4>
                    <div className="space-y-1">
                      {searchResults.channels.map(channel => (
                        <div
                          key={channel.id}
                          className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted cursor-pointer"
                          onClick={() => setSelectedChannel(channel)}
                        >
                          <div className="w-2 h-2 rounded-full bg-orange-500" />
                          <span className="text-sm">{channel.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {searchResults.users.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-xs font-medium mb-2">Users</h4>
                    <div className="space-y-1">
                      {searchResults.users.map(user => (
                        <div
                          key={user.id}
                          className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted cursor-pointer"
                          onClick={() => {
                            const dmId = `dm-${[me.id, user.id].sort().join('-')}`
                            let dm = channels.find(c => c.id === dmId)
                            if (!dm) {
                              dm = { id: dmId, name: user.name, type: 'dm', members: [me, user], unreadCount: 0 }
                              setChannels(prev => [...prev, dm!])
                            }
                            setSelectedChannel(dm)
                          }}
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{user.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => {
                    setShowSearchResults(false)
                    setSearchQuery("")
                  }}
                >
                  Clear Search
                </Button>
              </div>
            )}
            {/* Channels */}
            <div className="px-4 mb-4">
              <h3 className="text-xs font-semibold text-muted-foreground mb-2">Channels</h3>
              <div className="space-y-1">
                {channels.filter(c=>c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((channel) => (
                  <div
                    key={channel.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedChannel.id === channel.id
                        ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 border-l-4 border-orange-500'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedChannel(channel)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      <span className="font-medium text-sm">{channel.name}</span>
                      {channel.isPinned && <Pin className="h-3 w-3 text-orange-500" />}
                    </div>
                    {channel.unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {channel.unreadCount}
                      </Badge>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-2 text-xs" onClick={()=>setCreateChannelOpen(true)}>
                  <Plus className="h-3 w-3 mr-1"/>Create channel
                </Button>
              </div>
            </div>

            {/* Online Users */}
            <div className="px-4">
              <h3 className="text-xs font-semibold text-muted-foreground mb-2">Online Now</h3>
              <div className="space-y-2">
                {sampleUsers.filter(user => user.status === 'online' && (user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.role.toLowerCase().includes(searchQuery.toLowerCase()))).map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer" 
                    onClick={() => {
                    const dmId = `dm-${[me.id, user.id].sort().join('-')}`
                    let dm = channels.find(c => c.id === dmId)
                    if (!dm) {
                      dm = { id: dmId, name: user.name, type: 'dm', members: [me, user], unreadCount: 0 }
                      setChannels(prev => [...prev, dm!])
                    }
                    setSelectedChannel(dm)
                    }}
                    onDoubleClick={() => setShowUserProfile(user)}
                  >
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(user.status)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.role}</p>
                    </div>
                    {user.isTyping && (
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce" />
                        <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="social" className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/50">
            <div className="h-full overflow-auto">
              <SocialIntegration />
            </div>
          </TabsContent>

          <TabsContent value="files" className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/50">
            <div className="h-full overflow-auto">
              <FileCollaboration />
            </div>
          </TabsContent>

          <TabsContent value="company" className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/50">
            <div className="px-4">
              <h3 className="text-xs font-semibold text-muted-foreground mb-4">Company Hub</h3>
              <div className="space-y-4">
                {/* Company Announcements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Bell className="h-4 w-4" />
                      Announcements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-orange-50 dark:bg-orange-900/10 border-l-4 border-orange-500 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="destructive" className="text-xs">
                            <Bell className="h-3 w-3 mr-1" />
                            Important
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(new Date(Date.now() - 2 * 60 * 60 * 1000))}
                          </span>
                        </div>
                        <h4 className="font-semibold mb-1 text-sm">Q4 All-Hands Meeting</h4>
                        <p className="text-xs text-muted-foreground">
                          Join us this Friday at 2 PM for our quarterly all-hands meeting. We'll be discussing our Q4 achievements and 2024 roadmap.
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            <Info className="h-3 w-3 mr-1" />
                            Update
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(new Date(Date.now() - 6 * 60 * 60 * 1000))}
                          </span>
                        </div>
                        <h4 className="font-semibold mb-1">New Office Space</h4>
                        <p className="text-sm text-muted-foreground">
                          We're excited to announce our new office expansion! The new space will be ready by January 2024.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Events */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Upcoming Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">Team Building Event</h4>
                          <p className="text-sm text-muted-foreground">Escape Room Challenge</p>
                          <p className="text-xs text-muted-foreground">Tomorrow, 3:00 PM</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Join
                        </Button>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                          <Coffee className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">Coffee Chat</h4>
                          <p className="text-sm text-muted-foreground">Casual networking session</p>
                          <p className="text-xs text-muted-foreground">Friday, 10:00 AM</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Join
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Team Directory */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Team Directory
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {sampleUsers.map((user) => (
                        <div key={user.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted cursor-pointer">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(user.status)}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{user.name}</p>
                            <p className="text-sm text-muted-foreground truncate">{user.role}</p>
                            <p className="text-xs text-muted-foreground">{user.department}</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col connect-right-panel bg-transparent">
        {/* Chat Header */}
        <div className="p-4 border-b border-border bg-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <div>
                <h3 className="font-semibold">{selectedChannel.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedChannel.members.length} members • {selectedChannel.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  const msg: Message = {
                    id: `msg-${Date.now()}`,
                    content: "📹 Started a video call",
                    type: 'text',
                    sender: me,
                    timestamp: new Date(),
                  }
                  setMessagesByChannel(prev => ({
                    ...prev,
                    [selectedChannel.id]: [...(prev[selectedChannel.id] || []), msg]
                  }))
                }}
              >
                <Video className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  const msg: Message = {
                    id: `msg-${Date.now()}`,
                    content: "📞 Started a voice call",
                    type: 'text',
                    sender: me,
                    timestamp: new Date(),
                  }
                  setMessagesByChannel(prev => ({
                    ...prev,
                    [selectedChannel.id]: [...(prev[selectedChannel.id] || []), msg]
                  }))
                }}
              >
                <Phone className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowChannelMembers(!showChannelMembers)}
              >
                <Users className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Channel Info</DropdownMenuItem>
                  <DropdownMenuItem>Notifications</DropdownMenuItem>
                  <DropdownMenuItem>Add People</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Leave Channel</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/50 connect-messages-scroll bg-transparent hover:bg-transparent" style={{maxHeight: 'calc(100vh - 300px)', height: 'calc(100vh - 300px)'}}>
          <div className="space-y-2">
            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <span>
                  {typingUsers.length === 1 ? 'Someone is typing...' : `${typingUsers.length} people are typing...`}
                </span>
              </div>
            )}
            
            {(messagesByChannel[selectedChannel.id] || []).map((message) => (
              <div key={message.id} className={`flex gap-2 ${message.isAnnouncement ? 'bg-orange-50 dark:bg-orange-900/10 p-3 rounded-lg border-l-4 border-orange-500' : ''}`}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.sender.avatar} />
                  <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm">{message.sender.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message.timestamp)}
                    </span>
                    {message.isPinned && (
                      <Badge variant="outline" className="text-xs">
                        <Pin className="h-3 w-3 mr-1" />
                        Pinned
                      </Badge>
                    )}
                    {message.isAnnouncement && (
                      <Badge variant="destructive" className="text-xs">
                        <Bell className="h-3 w-3 mr-1" />
                        Announcement
                      </Badge>
                    )}
                  </div>
                  
                  {message.replyTo && (
                    <div className="ml-4 mb-1 p-2 bg-muted rounded-lg border-l-2 border-orange-500">
                      <p className="text-xs text-muted-foreground mb-1">
                        Replying to {message.replyTo.sender.name}
                      </p>
                      <p className="text-sm">{message.replyTo.content}</p>
                    </div>
                  )}
                  
                  <p className="text-sm mb-1">{message.content}</p>
                  
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="space-y-1 mb-1">
                      {message.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center gap-2 p-2 border rounded-lg">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{attachment.name}</span>
                          <Button variant="ghost" size="sm">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="flex gap-2 mb-1">
                      {message.reactions.map((reaction, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                        >
                          {reaction.emoji} {reaction.users.length}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2"
                      onClick={() => handleReaction(message.id, '👍')}
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2"
                      onClick={() => handleReplyToMessage(message.id)}
                    >
                      <Reply className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2"
                      onClick={() => handlePinMessage(message.id)}
                    >
                      <Pin className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2"
                      onClick={() => handleReaction(message.id, '❤️')}
                    >
                      <Heart className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t border-border bg-transparent">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Textarea
                placeholder={`Message #${selectedChannel.name}`}
                value={message}
                onChange={handleMessageChange}
                onKeyPress={handleKeyPress}
                className="min-h-[40px] max-h-32 resize-none"
              />
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="h-4 w-4" />
              </Button>
              {showEmojiPicker && (
                <div className="absolute bottom-12 right-12 bg-background border rounded-lg shadow-lg p-2 z-50">
                  <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto">
                    {['😀', '😂', '😍', '🥰', '😎', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💯', '👏', '🙌', '😊', '😢'].map(emoji => (
                      <button
                        key={emoji}
                        className="p-1 hover:bg-muted rounded text-lg"
                        onClick={() => {
                          setMessage(prev => prev + emoji)
                          setShowEmojiPicker(false)
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onMouseDown={startVoiceRecording}
                onMouseUp={stopVoiceRecording}
                onMouseLeave={stopVoiceRecording}
                className={isRecording ? 'bg-red-100 text-red-600' : ''}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-2 mt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
              onClick={() => {
                const msg: Message = {
                  id: `msg-${Date.now()}`,
                  content: "☕ Taking a coffee break!",
                  type: 'text',
                  sender: me,
                  timestamp: new Date(),
                }
                setMessagesByChannel(prev => ({
                  ...prev,
                  [selectedChannel.id]: [...(prev[selectedChannel.id] || []), msg]
                }))
              }}
            >
              <Coffee className="h-3 w-3 mr-1" />
              Coffee break
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
              onClick={() => {
                const msg: Message = {
                  id: `msg-${Date.now()}`,
                  content: "🍕 Going for lunch!",
                  type: 'text',
                  sender: me,
                  timestamp: new Date(),
                }
                setMessagesByChannel(prev => ({
                  ...prev,
                  [selectedChannel.id]: [...(prev[selectedChannel.id] || []), msg]
                }))
              }}
            >
              <Pizza className="h-3 w-3 mr-1" />
              Lunch
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
              onClick={() => {
                const msg: Message = {
                  id: `msg-${Date.now()}`,
                  content: "🎉 Let's celebrate!",
                  type: 'text',
                  sender: me,
                  timestamp: new Date(),
                }
                setMessagesByChannel(prev => ({
                  ...prev,
                  [selectedChannel.id]: [...(prev[selectedChannel.id] || []), msg]
                }))
              }}
            >
              <PartyPopper className="h-3 w-3 mr-1" />
              Celebrate
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
              onClick={() => {
                const msg: Message = {
                  id: `msg-${Date.now()}`,
                  content: "🎁 Sending virtual gifts!",
                  type: 'text',
                  sender: me,
                  timestamp: new Date(),
                }
                setMessagesByChannel(prev => ({
                  ...prev,
                  [selectedChannel.id]: [...(prev[selectedChannel.id] || []), msg]
                }))
              }}
            >
              <Gift className="h-3 w-3 mr-1" />
              Gift
            </Button>
          </div>
        </div>
      </div>

      {/* Channel Members Panel */}
      {showChannelMembers && (
        <div className="w-64 border-l border-border bg-card/50 flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Channel Members</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowChannelMembers(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/50">
            <div className="space-y-3">
              {selectedChannel.members.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{member.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{member.role}</p>
                    <p className="text-xs text-muted-foreground">{member.department}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileUpload}
      />
      
      {/* User Profile Dialog */}
      <Dialog open={!!showUserProfile} onOpenChange={() => setShowUserProfile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>
          {showUserProfile && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={showUserProfile.avatar} />
                  <AvatarFallback>{showUserProfile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{showUserProfile.name}</h3>
                  <p className="text-sm text-muted-foreground">{showUserProfile.role}</p>
                  <p className="text-sm text-muted-foreground">{showUserProfile.department}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(showUserProfile.status)}`} />
                    <span className="text-sm capitalize">{showUserProfile.status}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Contact Information</h4>
                <p className="text-sm text-muted-foreground">Email: {showUserProfile.email}</p>
                <p className="text-sm text-muted-foreground">Phone: {showUserProfile.phone || 'Not provided'}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    const dmId = `dm-${[me.id, showUserProfile.id].sort().join('-')}`
                    let dm = channels.find(c => c.id === dmId)
                    if (!dm) {
                      dm = { id: dmId, name: showUserProfile.name, type: 'dm', members: [me, showUserProfile], unreadCount: 0 }
                      setChannels(prev => [...prev, dm!])
                    }
                    setSelectedChannel(dm)
                    setShowUserProfile(null)
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Channel Dialog */}
      <Dialog open={createChannelOpen} onOpenChange={setCreateChannelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new channel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium" htmlFor="channelName">Channel name</label>
              <Input 
                id="channelName" 
                value={newChannelName} 
                onChange={(e)=>setNewChannelName(e.target.value)} 
                placeholder="e.g. product, design, hr"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="channelDescription">Description (optional)</label>
              <Textarea 
                id="channelDescription" 
                value={newChannelDescription} 
                onChange={(e)=>setNewChannelDescription(e.target.value)} 
                placeholder="What's this channel about?"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Channel type</label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="public"
                    checked={newChannelType === 'public'}
                    onChange={(e) => setNewChannelType(e.target.value as 'public' | 'private')}
                    className="text-orange-500"
                  />
                  <span className="text-sm">Public - Anyone can join</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="private"
                    checked={newChannelType === 'private'}
                    onChange={(e) => setNewChannelType(e.target.value as 'public' | 'private')}
                    className="text-orange-500"
                  />
                  <span className="text-sm">Private - Invite only</span>
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={()=>{
                setCreateChannelOpen(false)
                setNewChannelName("")
                setNewChannelDescription("")
                setNewChannelType('public')
              }}>Cancel</Button>
              <Button onClick={()=>{
                const name = newChannelName.trim()
                if (!name) return
                const id = name.toLowerCase().replace(/\s+/g,'-')
                const ch: Channel = { 
                  id, 
                  name, 
                  type: newChannelType, 
                  description: newChannelDescription.trim() || undefined, 
                  members: sampleUsers, 
                  unreadCount: 0 
                }
                setChannels(prev => [...prev, ch])
                setMessagesByChannel(prev => ({ ...prev, [id]: [] }))
                setSelectedChannel(ch)
                setNewChannelName("")
                setNewChannelDescription("")
                setNewChannelType('public')
                setCreateChannelOpen(false)
              }}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
