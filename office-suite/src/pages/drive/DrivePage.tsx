"use client"

import { useMemo, useState } from "react"
import { 
  Upload, 
  Search, 
  Grid3X3, 
  List, 
  File, 
  Folder, 
  Image, 
  FileText, 
  Download,
  Share,
  MoreHorizontal,
  Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface DriveItem {
  id: string
  name: string
  type: "folder" | "file"
  fileType?: "image" | "document" | "pdf" | "other"
  size?: string
  modified: string
  shared: boolean
  starred: boolean
  children?: DriveItem[]
}

const sampleItems: DriveItem[] = [
  {
    id: "1",
    name: "Project Documents",
    type: "folder",
    modified: "2 days ago",
    shared: true,
    starred: false,
    children: [
      {
        id: "1-1",
        name: "Requirements.pdf",
        type: "file",
        fileType: "pdf",
        size: "1.1 MB",
        modified: "2 days ago",
        shared: false,
        starred: false
      },
      {
        id: "1-2",
        name: "Notes.docx",
        type: "file",
        fileType: "document",
        size: "84 KB",
        modified: "yesterday",
        shared: false,
        starred: false
      }
    ]
  },
  {
    id: "2",
    name: "Design Assets",
    type: "folder",
    modified: "1 week ago",
    shared: false,
    starred: true,
    children: [
      {
        id: "2-1",
        name: "Logo_Final.png",
        type: "file",
        fileType: "image",
        size: "890 KB",
        modified: "1 day ago",
        shared: false,
        starred: true
      },
      {
        id: "2-2",
        name: "Wireframe.sketch",
        type: "file",
        fileType: "other",
        size: "2.2 MB",
        modified: "3 days ago",
        shared: true,
        starred: false
      }
    ]
  },
  {
    id: "3",
    name: "Marketing Strategy 2024.pdf",
    type: "file",
    fileType: "pdf",
    size: "2.4 MB",
    modified: "3 hours ago",
    shared: true,
    starred: false
  },
  {
    id: "4",
    name: "Logo_Final.png",
    type: "file",
    fileType: "image",
    size: "890 KB",
    modified: "1 day ago",
    shared: false,
    starred: true
  },
  {
    id: "5",
    name: "Meeting Notes.docx",
    type: "file",
    fileType: "document",
    size: "156 KB",
    modified: "5 hours ago",
    shared: false,
    starred: false
  },
  {
    id: "6",
    name: "Wireframes",
    type: "folder",
    modified: "3 days ago",
    shared: true,
    starred: false
  }
]

const getFileIcon = (item: DriveItem) => {
  if (item.type === "folder") return Folder
  
  switch (item.fileType) {
    case "image": return Image
    case "document": return FileText
    case "pdf": return File
    default: return File
  }
}

const getFileTypeColor = (item: DriveItem) => {
  if (item.type === "folder") return "text-blue-600"
  
  switch (item.fileType) {
    case "image": return "text-green-600"
    case "document": return "text-blue-600"
    case "pdf": return "text-red-600"
    default: return "text-gray-600"
  }
}

export function DrivePage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [path, setPath] = useState<Array<{ id: string; name: string }>>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const currentItems = useMemo(() => {
    // Traverse sampleItems by path to get items for current folder
    let items: DriveItem[] = sampleItems
    for (const seg of path) {
      const folder = items.find(i => i.id === seg.id && i.type === 'folder')
      if (!folder || !folder.children) return []
      items = folder.children
    }
    // Filter by search
    const q = searchQuery.trim().toLowerCase()
    const filtered = q ? items.filter(i => i.name.toLowerCase().includes(q)) : items
    // Sort folders first, then by name
    return filtered.slice().sort((a,b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'folder' ? -1 : 1))
  }, [path, searchQuery])

  const clearSelection = () => setSelectedIds(new Set())
  const toggleSelect = (id: string, checked?: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      const shouldSelect = typeof checked === 'boolean' ? checked : !next.has(id)
      if (shouldSelect) next.add(id); else next.delete(id)
      return next
    })
  }

  const openFolder = (item: DriveItem) => {
    if (item.type !== 'folder') return
    setPath(prev => prev.concat({ id: item.id, name: item.name }))
    clearSelection()
  }

  const navigateTo = (index: number) => {
    // index -1 means root
    if (index < 0) setPath([])
    else setPath(prev => prev.slice(0, index + 1))
    clearSelection()
  }

  const ItemCard = ({ item }: { item: DriveItem }) => {
    const IconComponent = getFileIcon(item)
    
    return (
      <div className={`enterprise-card p-4 hover:shadow-lg transition-all cursor-pointer ${selectedIds.has(item.id) ? 'ring-2 ring-primary' : ''}`}
           onDoubleClick={() => openFolder(item)}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Checkbox checked={selectedIds.has(item.id)} onCheckedChange={(v:any)=>toggleSelect(item.id, Boolean(v))} />
            <div className={`${getFileTypeColor(item)}`}>
              <IconComponent className="h-8 w-8" />
            </div>
          </div>
          <div className="flex items-center gap-1">
            {item.starred && (
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            )}
            {item.shared && (
              <Badge variant="outline" className="text-xs">Shared</Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="dropdown-3d">
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Star className="h-4 w-4 mr-2" />
                  {item.starred ? "Unstar" : "Star"}
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <h4 className="font-medium text-sm mb-1 line-clamp-2">{item.name}</h4>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{item.modified}</span>
          {item.size && <span>{item.size}</span>}
        </div>
      </div>
    )
  }

  const ItemRow = ({ item }: { item: DriveItem }) => {
    const IconComponent = getFileIcon(item)
    
    return (
      <div className="flex items-center gap-4 p-3 hover:bg-muted/50 rounded-lg cursor-pointer" onDoubleClick={() => openFolder(item)}>
        <Checkbox checked={selectedIds.has(item.id)} onCheckedChange={(v:any)=>toggleSelect(item.id, Boolean(v))} />
        <div className={`${getFileTypeColor(item)}`}>
          <IconComponent className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{item.name}</span>
            {item.starred && (
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
            )}
            {item.shared && (
              <Badge variant="outline" className="text-xs">Shared</Badge>
            )}
          </div>
        </div>
        <div className="text-sm text-muted-foreground w-24">
          {item.size || "—"}
        </div>
        <div className="text-sm text-muted-foreground w-32">
          {item.modified}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="dropdown-3d">
            <DropdownMenuItem>
              <Download className="h-4 w-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share className="h-4 w-4 mr-2" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Star className="h-4 w-4 mr-2" />
              {item.starred ? "Unstar" : "Star"}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  const selectedSingle = selectedIds.size === 1 ? currentItems.find(i => selectedIds.has(i.id)) : undefined

  return (
    <div className="h-full flex flex-col">
      {/* Drive Header */}
      <div className="enterprise-card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">Sebenza Drive</h1>
            <p className="text-muted-foreground">Secure file storage and collaboration</p>
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <>
                <Button variant="outline">Download ({selectedIds.size})</Button>
                <Button variant="outline">Share</Button>
                <Button variant="destructive" onClick={clearSelection}>Clear</Button>
              </>
            )}
            <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </div>
        </div>

        {/* Breadcrumbs + Search & View Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Button variant="ghost" size="sm" onClick={() => navigateTo(-1)}>Root</Button>
            {path.map((seg, idx) => (
              <div key={seg.id} className="flex items-center gap-2">
                <span className="text-muted-foreground">/</span>
                <Button variant="ghost" size="sm" onClick={() => navigateTo(idx)}>{seg.name}</Button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search files and folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* File/Folder Content with optional preview */}
      <div className="flex-1 enterprise-card flex">
        <div className="flex-1">
          {viewMode === "grid" ? (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {currentItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6">
              {/* List Header */}
              <div className="flex items-center gap-4 p-3 border-b text-sm font-medium text-muted-foreground">
                <div className="w-5"></div>
                <div className="flex-1">Name</div>
                <div className="w-24">Size</div>
                <div className="w-32">Modified</div>
                <div className="w-6"></div>
              </div>
              {/* List Items */}
              <div className="mt-2">
                {currentItems.map((item) => (
                  <ItemRow key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>
        {selectedSingle && (
          <div className="w-80 border-l p-4 hidden lg:block">
            <h3 className="text-sm font-semibold mb-2">Preview</h3>
            <div className="rounded-md border p-4 mb-3">
              <div className="text-sm font-medium mb-1">{selectedSingle.name}</div>
              <div className="text-xs text-muted-foreground">{selectedSingle.type.toUpperCase()}</div>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              {selectedSingle.size && <div>Size: {selectedSingle.size}</div>}
              <div>Modified: {selectedSingle.modified}</div>
              <div>Shared: {selectedSingle.shared ? 'Yes' : 'No'}</div>
              <div>Starred: {selectedSingle.starred ? 'Yes' : 'No'}</div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Button size="sm" variant="outline"><Download className="h-4 w-4 mr-2"/>Download</Button>
              <Button size="sm" variant="outline"><Share className="h-4 w-4 mr-2"/>Share</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}