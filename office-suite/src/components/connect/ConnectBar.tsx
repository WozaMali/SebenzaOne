"use client"

import { useState } from "react"
import { 
  MessageCircle, Users, ChevronUp, Plus, X, Video, Phone, 
  MoreHorizontal, Search, Bell, Settings, Camera, Mic, MicOff,
  Send, Paperclip, Smile, Heart, ThumbsUp, Reply, Forward,
  Bookmark, Flag, Calendar, FileText, Image, Music, Play, Pause,
  Volume2, Globe, Lock, Shield, Zap, Star, Award, TrendingUp,
  Coffee, Pizza, Cake, Gift, PartyPopper, Confetti, MapPin,
  Clock, CheckCircle, AlertCircle, Info, ChevronDown, ChevronRight,
  Download, Upload, Edit, Trash2, Archive, Pin
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Organization people data
const organizationPeople = [
  {
    id: "john-doe",
    name: "John Doe",
    email: "john.doe@company.com",
    role: "CEO",
    department: "Executive",
    avatar: "/placeholder-avatar.jpg",
    status: "online",
    lastSeen: "2 minutes ago",
    isAvailable: true
  },
  {
    id: "sarah-johnson",
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    role: "CTO",
    department: "Engineering",
    avatar: "/placeholder-avatar.jpg",
    status: "online",
    lastSeen: "5 minutes ago",
    isAvailable: true
  },
  {
    id: "mike-chen",
    name: "Mike Chen",
    email: "mike.chen@company.com",
    role: "Design Director",
    department: "Design",
    avatar: "/placeholder-avatar.jpg",
    status: "away",
    lastSeen: "1 hour ago",
    isAvailable: false
  },
]

interface ConnectBarProps {
  onOpenChat: (person: any) => void
  activeChats: Array<{
    id: string
    person: any
    unreadCount: number
  }>
  onCloseChat: (chatId: string) => void
}

export function ConnectBar({ onOpenChat, activeChats, onCloseChat }: ConnectBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPeople = organizationPeople.filter(person =>
    person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.department.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
    <div className="fixed bottom-4 left-4 z-50 flex items-end gap-2">
      {/* Connect Button + Popover */}
      <div className="relative">
        <Popover open={isExpanded} onOpenChange={setIsExpanded}>
          <PopoverTrigger asChild>
            <Button
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white btn-3d orange-glow font-semibold shadow-lg"
              size="lg"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Connect
              <ChevronUp className="h-4 w-4 ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-80 p-0 mb-2" 
            side="top"
            align="start"
            sideOffset={8}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Connect with Team</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search people..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {filteredPeople.map((person) => (
                    <div
                      key={person.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => { onOpenChat(person); setIsExpanded(false) }}
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={person.avatar} />
                          <AvatarFallback>{person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(person.status)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{person.name}</p>
                          {person.isAvailable && (
                            <Badge variant="outline" className="text-xs">Available</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{person.role}</p>
                        <p className="text-xs text-muted-foreground">{person.department}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{person.lastSeen}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Chats Rail */}
      {activeChats.length > 0 && (
        <div className="rounded-lg border bg-background shadow-lg p-2 flex flex-col gap-2 max-h-[60vh] overflow-auto">
          {activeChats.map(chat => (
            <div key={chat.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted cursor-pointer" onClick={() => onOpenChat(chat.person)}>
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={chat.person.avatar} />
                  <AvatarFallback>{chat.person.name.split(' ').map((n:string)=>n[0]).join('')}</AvatarFallback>
                </Avatar>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate max-w-[10rem]">{chat.person.name}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[10rem]">{chat.person.role ?? ""}</p>
              </div>
              {chat.unreadCount > 0 && (
                <Badge variant="outline" className="ml-auto text-xs">{chat.unreadCount}</Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
