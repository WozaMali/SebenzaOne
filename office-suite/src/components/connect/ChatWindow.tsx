"use client"

import { useState, useRef, useEffect } from "react"
import { 
  MessageCircle, Send, Paperclip, Smile, MoreHorizontal, 
  Video, Phone, Search, Settings, X, Heart, ThumbsUp, 
  Reply, Forward, Bookmark, Flag, Copy, Download, 
  Trash2, Archive, Pin, Mic, MicOff, Camera, 
  FileText, Image, Music, Play, Pause, Volume2, ChevronRight, Minus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Message {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: Date
  isRead: boolean
  type: 'text' | 'image' | 'file' | 'emoji'
  attachments?: Array<{
    id: string
    filename: string
    type: string
    size: number
    url: string
  }>
  reactions?: Array<{
    emoji: string
    count: number
    users: string[]
  }>
}

interface ChatWindowProps {
  person: any
  onClose: () => void
  onMinimize: () => void
  onExpand?: () => void
}

export function ChatWindow({ person, onClose, onMinimize, onExpand }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showFilePicker, setShowFilePicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Sample messages
  const sampleMessages: Message[] = [
    {
      id: "1",
      senderId: person.id,
      senderName: person.name,
      content: "Hey! How's the project going?",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: true,
      type: 'text'
    },
    {
      id: "2",
      senderId: "current-user",
      senderName: "You",
      content: "Going great! We're on track to finish by Friday.",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      isRead: true,
      type: 'text'
    },
    {
      id: "3",
      senderId: person.id,
      senderName: person.name,
      content: "That's awesome! Can you send me the latest updates?",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isRead: true,
      type: 'text'
    },
    {
      id: "4",
      senderId: "current-user",
      senderName: "You",
      content: "Sure! I'll send them over in a few minutes.",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      isRead: true,
      type: 'text'
    },
    {
      id: "5",
      senderId: person.id,
      senderName: person.name,
      content: "Perfect, thanks! 👍",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      isRead: false,
      type: 'text',
      reactions: [
        { emoji: "👍", count: 1, users: ["current-user"] }
      ]
    }
  ]

  useEffect(() => {
    setMessages(sampleMessages)
  }, [person.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        senderId: "current-user",
        senderName: "You",
        content: newMessage,
        timestamp: new Date(),
        isRead: false,
        type: 'text'
      }
      setMessages(prev => [...prev, message])
      setNewMessage("")
      
      // Simulate typing indicator
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        // Simulate response
        const response: Message = {
          id: (Date.now() + 1).toString(),
          senderId: person.id,
          senderName: person.name,
          content: "Thanks for the message! I'll get back to you soon.",
          timestamp: new Date(),
          isRead: false,
          type: 'text'
        }
        setMessages(prev => [...prev, response])
      }, 2000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500"
      case "away": return "bg-yellow-500"
      case "busy": return "bg-red-500"
      case "offline": return "bg-gray-400"
      default: return "bg-gray-400"
    }
  }

  return (
    <div className="flex flex-col h-96 w-80 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-lg border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white/70 dark:bg-gray-800/70 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-8 w-8">
              <AvatarImage src={person.avatar} />
              <AvatarFallback>{person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(person.status)}`} />
          </div>
          <div>
            <p className="font-medium text-sm">{person.name}</p>
            <p className="text-xs text-muted-foreground">{person.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Expand to Connect Page */}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onExpand} title="Open in Connect">
            <ChevronRight className="h-4 w-4" />
          </Button>
          {/* Minimize */}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onMinimize} title="Minimize">
            <Minus className="h-4 w-4" />
          </Button>
          {/* More */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Search className="h-4 w-4 mr-2" />
                Search Messages
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Chat Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Archive className="h-4 w-4 mr-2" />
                Archive Chat
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Close */}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose} title="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === "current-user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] ${message.senderId === "current-user" ? "order-2" : "order-1"}`}>
                {message.senderId !== "current-user" && (
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={person.avatar} />
                      <AvatarFallback>{person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium text-muted-foreground">{message.senderName}</span>
                  </div>
                )}
                <div
                  className={`rounded-lg px-3 py-2 border ${
                    message.senderId === "current-user"
                      ? "bg-gray-300 text-gray-900 border-gray-300"
                      : "bg-white text-gray-900 border-gray-200"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs opacity-70">
                      {formatTime(message.timestamp)}
                    </span>
                    {message.senderId === "current-user" && (
                      <div className="flex items-center gap-1">
                        {message.isRead ? (
                          <div className="flex">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full -ml-1"></div>
                          </div>
                        ) : (
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {message.reactions && message.reactions.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {message.reactions.map((reaction, idx) => (
                      <Button
                        key={idx}
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                      >
                        {reaction.emoji} {reaction.count}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-white/70 dark:bg-gray-800/70 backdrop-blur">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Paperclip className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="border-0 focus-visible:ring-0 bg-transparent"
            />
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Smile className="h-4 w-4" />
          </Button>
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            size="sm"
            className="bg-gray-800 hover:bg-gray-900 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
