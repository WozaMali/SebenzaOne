"use client"

import React, { useState } from "react"
import { 
  Linkedin, Twitter, Facebook, Instagram, Globe, 
  Share2, Heart, MessageCircle, Bookmark, Flag,
  Plus, Settings, Zap, TrendingUp, Users, Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface SocialAccount {
  id: string
  platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram'
  username: string
  displayName: string
  avatar: string
  followers: number
  isConnected: boolean
  lastSync: Date
}

interface SocialPost {
  id: string
  platform: string
  content: string
  author: string
  timestamp: Date
  likes: number
  comments: number
  shares: number
  engagement: number
  hashtags: string[]
  mentions: string[]
  media?: string[]
}

const sampleAccounts: SocialAccount[] = [
  {
    id: "linkedin-1",
    platform: "linkedin",
    username: "sebenza-tech",
    displayName: "Sebenza Technologies",
    avatar: "/placeholder-avatar.jpg",
    followers: 12500,
    isConnected: true,
    lastSync: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: "twitter-1",
    platform: "twitter",
    username: "@sebenza_tech",
    displayName: "Sebenza Tech",
    avatar: "/placeholder-avatar.jpg",
    followers: 8500,
    isConnected: true,
    lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "facebook-1",
    platform: "facebook",
    username: "sebenzatechnologies",
    displayName: "Sebenza Technologies",
    avatar: "/placeholder-avatar.jpg",
    followers: 3200,
    isConnected: false,
    lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: "instagram-1",
    platform: "instagram",
    username: "sebenza_tech",
    displayName: "Sebenza Tech",
    avatar: "/placeholder-avatar.jpg",
    followers: 5600,
    isConnected: true,
    lastSync: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
]

const samplePosts: SocialPost[] = [
  {
    id: "post-1",
    platform: "linkedin",
    content: "We're excited to announce our latest product update! Our engineering team has been working hard to bring you new features that will streamline your workflow. #ProductUpdate #Innovation #Tech",
    author: "Sebenza Technologies",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    likes: 45,
    comments: 12,
    shares: 8,
    engagement: 65,
    hashtags: ["#ProductUpdate", "#Innovation", "#Tech"],
    mentions: ["@engineering-team"],
  },
  {
    id: "post-2",
    platform: "twitter",
    content: "Just wrapped up an amazing team meeting! The energy and creativity in the room was incredible. Can't wait to see what we build next! 🚀 #TeamWork #Innovation",
    author: "Sebenza Tech",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    likes: 23,
    comments: 5,
    shares: 3,
    engagement: 31,
    hashtags: ["#TeamWork", "#Innovation"],
    mentions: [],
  },
  {
    id: "post-3",
    platform: "instagram",
    content: "Behind the scenes of our latest product photoshoot! Our design team always brings such creativity to every project. 📸 #BehindTheScenes #Design #Creativity",
    author: "Sebenza Tech",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    likes: 67,
    comments: 15,
    shares: 4,
    engagement: 86,
    hashtags: ["#BehindTheScenes", "#Design", "#Creativity"],
    mentions: ["@design-team"],
  },
]

const platformIcons = {
  linkedin: Linkedin,
  twitter: Twitter,
  facebook: Facebook,
  instagram: Instagram,
}

const platformColors = {
  linkedin: "text-blue-600",
  twitter: "text-blue-400",
  facebook: "text-blue-700",
  instagram: "text-pink-600",
}

export function SocialIntegration() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all")
  const [showComposeDialog, setShowComposeDialog] = useState(false)
  const [composeContent, setComposeContent] = useState("")
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [scheduledTime, setScheduledTime] = useState("")

  const handleConnectAccount = (accountId: string) => {
    // In a real implementation, this would initiate OAuth flow
    console.log("Connecting account:", accountId)
  }

  const handleDisconnectAccount = (accountId: string) => {
    // In a real implementation, this would disconnect the account
    console.log("Disconnecting account:", accountId)
  }

  const handlePost = () => {
    // In a real implementation, this would post to selected platforms
    console.log("Posting to platforms:", selectedPlatforms, "Content:", composeContent)
    setShowComposeDialog(false)
    setComposeContent("")
    setSelectedPlatforms([])
  }

  const filteredPosts = selectedPlatform === "all" 
    ? samplePosts 
    : samplePosts.filter(post => post.platform === selectedPlatform)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Social Media Integration</h2>
          <p className="text-muted-foreground">Manage your company's social media presence</p>
        </div>
        <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Social Media Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Platforms</label>
                <div className="grid grid-cols-2 gap-2">
                  {sampleAccounts.filter(acc => acc.isConnected).map((account) => (
                    <div key={account.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={account.id}
                        checked={selectedPlatforms.includes(account.platform)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedPlatforms([...selectedPlatforms, account.platform])
                          } else {
                            setSelectedPlatforms(selectedPlatforms.filter(p => p !== account.platform))
                          }
                        }}
                      />
                      <label htmlFor={account.id} className="flex items-center gap-2 text-sm">
                        {React.createElement(platformIcons[account.platform], { className: "h-4 w-4" })}
                        {account.displayName}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Content</label>
                <Textarea
                  placeholder="What's happening at your company?"
                  value={composeContent}
                  onChange={(e) => setComposeContent(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Schedule</label>
                  <Select value={scheduledTime} onValueChange={setScheduledTime}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Post now" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="now">Post now</SelectItem>
                      <SelectItem value="1h">In 1 hour</SelectItem>
                      <SelectItem value="4h">In 4 hours</SelectItem>
                      <SelectItem value="tomorrow">Tomorrow morning</SelectItem>
                      <SelectItem value="custom">Custom time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowComposeDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handlePost}
                  disabled={!composeContent.trim() || selectedPlatforms.length === 0}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Post
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Platform Filter */}
      <div className="flex items-center gap-2">
        <Button
          variant={selectedPlatform === "all" ? "default" : "outline"}
          onClick={() => setSelectedPlatform("all")}
        >
          All Platforms
        </Button>
        {Object.keys(platformIcons).map((platform) => {
          const Icon = platformIcons[platform as keyof typeof platformIcons]
          return (
            <Button
              key={platform}
              variant={selectedPlatform === platform ? "default" : "outline"}
              onClick={() => setSelectedPlatform(platform)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </Button>
          )
        })}
      </div>

      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Connected Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sampleAccounts.map((account) => {
              const Icon = platformIcons[account.platform]
              return (
                <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${platformColors[account.platform]} bg-opacity-10`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{account.displayName}</p>
                      <p className="text-sm text-muted-foreground">{account.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {account.followers.toLocaleString()} followers
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={account.isConnected ? "default" : "secondary"}>
                      {account.isConnected ? "Connected" : "Disconnected"}
                    </Badge>
                    {account.isConnected ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnectAccount(account.id)}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleConnectAccount(account.id)}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPosts.map((post) => {
              const Icon = platformIcons[post.platform as keyof typeof platformIcons]
              return (
                <div key={post.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${platformColors[post.platform]} bg-opacity-10`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{post.author}</span>
                        <Badge variant="outline" className="text-xs">
                          {post.platform}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {post.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm mb-3">{post.content}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {post.comments}
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="h-3 w-3" />
                          {post.shares}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {post.engagement}% engagement
                        </span>
                      </div>
                      {post.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {post.hashtags.map((hashtag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {hashtag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Bookmark className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Flag className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
