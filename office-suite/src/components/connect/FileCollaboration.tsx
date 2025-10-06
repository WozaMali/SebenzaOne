"use client"

import { useState } from "react"
import { 
  FileText, Image, Music, Video, Archive, Download, Upload, 
  Share2, Eye, Edit, Trash2, Star, Bookmark, MoreHorizontal,
  Search, Filter, Grid, List, Calendar, User, Clock, Lock,
  Plus, Folder, FolderOpen, Copy, Move, Tag
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"

interface FileItem {
  id: string
  name: string
  type: 'file' | 'folder'
  mimeType?: string
  size: number
  modified: Date
  owner: string
  sharedWith: string[]
  isStarred: boolean
  isBookmarked: boolean
  tags: string[]
  permissions: 'view' | 'edit' | 'admin'
  thumbnail?: string
  version: number
  isLocked?: boolean
  lockedBy?: string
}

interface CollaborationSession {
  id: string
  fileId: string
  fileName: string
  activeUsers: Array<{
    id: string
    name: string
    avatar: string
    cursorPosition?: { line: number; column: number }
    isTyping: boolean
  }>
  lastActivity: Date
}

const sampleFiles: FileItem[] = [
  {
    id: "file-1",
    name: "Q4 Marketing Strategy.pdf",
    type: "file",
    mimeType: "application/pdf",
    size: 2048576,
    modified: new Date(Date.now() - 2 * 60 * 60 * 1000),
    owner: "Sarah Johnson",
    sharedWith: ["Mike Chen", "Lisa Rodriguez"],
    isStarred: true,
    isBookmarked: false,
    tags: ["marketing", "strategy", "q4"],
    permissions: "edit",
    version: 3,
  },
  {
    id: "file-2",
    name: "Product Mockups",
    type: "folder",
    size: 0,
    modified: new Date(Date.now() - 4 * 60 * 60 * 1000),
    owner: "David Kim",
    sharedWith: ["Sarah Johnson", "Mike Chen"],
    isStarred: false,
    isBookmarked: true,
    tags: ["design", "mockups"],
    permissions: "view",
  },
  {
    id: "file-3",
    name: "Team Meeting Notes.docx",
    type: "file",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    size: 512000,
    modified: new Date(Date.now() - 6 * 60 * 60 * 1000),
    owner: "Lisa Rodriguez",
    sharedWith: ["Sarah Johnson", "Mike Chen", "David Kim"],
    isStarred: false,
    isBookmarked: false,
    tags: ["meeting", "notes"],
    permissions: "edit",
    version: 2,
    isLocked: true,
    lockedBy: "Mike Chen",
  },
  {
    id: "file-4",
    name: "Company Logo.png",
    type: "file",
    mimeType: "image/png",
    size: 1024000,
    modified: new Date(Date.now() - 8 * 60 * 60 * 1000),
    owner: "David Kim",
    sharedWith: ["Sarah Johnson"],
    isStarred: true,
    isBookmarked: true,
    tags: ["logo", "branding"],
    permissions: "view",
    thumbnail: "/company-logo-thumb.png",
  },
  {
    id: "file-5",
    name: "Project Timeline.xlsx",
    type: "file",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    size: 256000,
    modified: new Date(Date.now() - 12 * 60 * 60 * 1000),
    owner: "Mike Chen",
    sharedWith: ["Sarah Johnson", "Lisa Rodriguez", "David Kim"],
    isStarred: false,
    isBookmarked: false,
    tags: ["project", "timeline", "excel"],
    permissions: "edit",
    version: 1,
  },
]

const sampleCollaborations: CollaborationSession[] = [
  {
    id: "collab-1",
    fileId: "file-1",
    fileName: "Q4 Marketing Strategy.pdf",
    activeUsers: [
      {
        id: "user-1",
        name: "Sarah Johnson",
        avatar: "/placeholder-avatar.jpg",
        isTyping: false,
      },
      {
        id: "user-2",
        name: "Mike Chen",
        avatar: "/placeholder-avatar.jpg",
        cursorPosition: { line: 15, column: 8 },
        isTyping: true,
      },
    ],
    lastActivity: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: "collab-2",
    fileId: "file-5",
    fileName: "Project Timeline.xlsx",
    activeUsers: [
      {
        id: "user-3",
        name: "Lisa Rodriguez",
        avatar: "/placeholder-avatar.jpg",
        isTyping: false,
      },
      {
        id: "user-4",
        name: "David Kim",
        avatar: "/placeholder-avatar.jpg",
        isTyping: false,
      },
    ],
    lastActivity: new Date(Date.now() - 15 * 60 * 1000),
  },
]

const getFileIcon = (file: FileItem) => {
  if (file.type === "folder") return FolderOpen
  
  const mimeType = file.mimeType || ""
  if (mimeType.startsWith("image/")) return Image
  if (mimeType.startsWith("video/")) return Video
  if (mimeType.startsWith("audio/")) return Music
  if (mimeType.includes("pdf")) return FileText
  if (mimeType.includes("zip") || mimeType.includes("rar")) return Archive
  return FileText
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
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

export function FileCollaboration() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const filteredFiles = sampleFiles.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    )
  }

  const handleSelectAll = () => {
    setSelectedFiles(
      selectedFiles.length === filteredFiles.length
        ? []
        : filteredFiles.map(file => file.id)
    )
  }

  const handleUpload = (files: FileList) => {
    setIsUploading(true)
    setUploadProgress(0)
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          setShowUploadDialog(false)
          return 0
        }
        return prev + 10
      })
    }, 200)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">File Collaboration</h2>
          <p className="text-muted-foreground">Share, collaborate, and manage files with your team</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Files</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop files here, or click to select
                  </p>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    id="file-upload"
                    onChange={(e) => e.target.files && handleUpload(e.target.files)}
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" className="cursor-pointer">
                      Select Files
                    </Button>
                  </label>
                </div>
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search files, folders, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>File Type</DropdownMenuLabel>
            <DropdownMenuCheckboxItem>Documents</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Images</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Videos</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Audio</DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Permissions</DropdownMenuLabel>
            <DropdownMenuCheckboxItem>Can Edit</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>View Only</DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            <DropdownMenuCheckboxItem>Starred</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Bookmarked</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Recently Modified</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active Collaborations */}
      {sampleCollaborations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Collaborations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sampleCollaborations.map((collab) => (
                <div key={collab.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{collab.fileName}</p>
                      <p className="text-sm text-muted-foreground">
                        Last activity: {formatDate(collab.lastActivity)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {collab.activeUsers.map((user) => (
                        <Avatar key={user.id} className="h-6 w-6 border-2 border-background">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="text-xs">{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Files List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Files & Folders</CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                {selectedFiles.length} selected
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "list" ? (
            <div className="space-y-2">
              {filteredFiles.map((file) => {
                const Icon = getFileIcon(file)
                return (
                  <div
                    key={file.id}
                    className={`flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer ${
                      selectedFiles.includes(file.id) ? 'bg-orange-50 dark:bg-orange-900/10' : ''
                    }`}
                    onClick={() => handleFileSelect(file.id)}
                  >
                    <Checkbox
                      checked={selectedFiles.includes(file.id)}
                      onChange={() => handleFileSelect(file.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    {file.thumbnail && (
                      <img
                        src={file.thumbnail}
                        alt={file.name}
                        className="h-8 w-8 rounded object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{file.name}</p>
                        {file.isStarred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                        {file.isBookmarked && <Bookmark className="h-4 w-4 text-blue-500 fill-current" />}
                        {file.isLocked && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Lock className="h-3 w-3" />
                            <span>Locked by {file.lockedBy}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{formatFileSize(file.size)}</span>
                        <span>Modified {formatDate(file.modified)}</span>
                        <span>by {file.owner}</span>
                        <span>v{file.version}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {file.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        {file.permissions}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Move className="h-4 w-4 mr-2" />
                            Move
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFiles.map((file) => {
                const Icon = getFileIcon(file)
                return (
                  <div
                    key={file.id}
                    className={`p-4 border rounded-lg hover:shadow-md cursor-pointer transition-shadow ${
                      selectedFiles.includes(file.id) ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-200' : ''
                    }`}
                    onClick={() => handleFileSelect(file.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Checkbox
                        checked={selectedFiles.includes(file.id)}
                        onChange={() => handleFileSelect(file.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>View</DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Share</DropdownMenuItem>
                          <DropdownMenuItem>Download</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="text-center">
                      {file.thumbnail ? (
                        <img
                          src={file.thumbnail}
                          alt={file.name}
                          className="h-16 w-16 mx-auto mb-2 rounded object-cover"
                        />
                      ) : (
                        <Icon className="h-16 w-16 mx-auto mb-2 text-muted-foreground" />
                      )}
                      <p className="font-medium text-sm truncate mb-1">{file.name}</p>
                      <p className="text-xs text-muted-foreground mb-2">
                        {formatFileSize(file.size)}
                      </p>
                      <div className="flex items-center justify-center gap-1">
                        {file.isStarred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                        {file.isBookmarked && <Bookmark className="h-3 w-3 text-blue-500 fill-current" />}
                        {file.isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
