"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Search, Plus, MoreHorizontal, Pin, PinOff, Archive, ArchiveRestore, Tag as TagIcon, Star, StarOff, Edit2, Trash2, Download, Upload, Save, AlertCircle } from "lucide-react"
import { supabase, isSupabaseEnabled } from "@/lib/supabase-client"

type Note = {
  id: string
  title: string
  content: string
  tags: string[]
  notebookId: string
  createdAt: string
  updatedAt: string
  pinned: boolean
  archived: boolean
}

type Notebook = {
  id: string
  name: string
}

const sampleNotebooks: Notebook[] = [
  { id: "nb-1", name: "Personal" },
  { id: "nb-2", name: "Work" },
  { id: "nb-3", name: "Ideas" },
]

const nowIso = () => new Date().toISOString()

const initialNotes: Note[] = [
  { id: "n-1", title: "Kickoff Agenda", content: "- Introductions\n- Goals\n- Timeline", tags: ["meeting","work"], notebookId: "nb-2", createdAt: nowIso(), updatedAt: nowIso(), pinned: true, archived: false },
  { id: "n-2", title: "Book List", content: "- Atomic Habits\n- Deep Work", tags: ["reading","personal"], notebookId: "nb-1", createdAt: nowIso(), updatedAt: nowIso(), pinned: false, archived: false },
  { id: "n-3", title: "Feature Ideas", content: "- Smart filters\n- Offline caching\n- Calendar sync", tags: ["ideas"], notebookId: "nb-3", createdAt: nowIso(), updatedAt: nowIso(), pinned: false, archived: false },
]

export function NotesPage() {
  const [notebooks, setNotebooks] = useState<Notebook[]>(sampleNotebooks)
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [activeNotebook, setActiveNotebook] = useState<string>(notebooks[0]?.id || "")
  const [query, setQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id || null)
  const [userId, setUserId] = useState<string | null>(null)
  const [editingNotebook, setEditingNotebook] = useState<string | null>(null)
  const [notebookName, setNotebookName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const { toast } = useToast()

  // Initialize Supabase session user
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getUser().then(({ data }) => {
      const uid = data?.user?.id || null
      setUserId(uid)
    }).catch(() => {})
  }, [])

  // Force right panel to stretch horizontally
  useEffect(() => {
    const stretchRightPanel = () => {
      const container = document.getElementById('notes-page-container')
      const rightPanel = document.getElementById('notes-right-panel')
      const leftPanel = document.getElementById('notes-left-panel')
      const middlePanel = document.getElementById('notes-middle-panel')
      
      if (container && rightPanel && leftPanel && middlePanel) {
        // Get actual widths of fixed panels
        const leftPanelWidth = leftPanel.offsetWidth
        const middlePanelWidth = middlePanel.offsetWidth
        const containerWidth = container.offsetWidth
        const rightPanelWidth = containerWidth - leftPanelWidth - middlePanelWidth
        
        // Force the right panel to stretch
        rightPanel.style.width = `${rightPanelWidth}px`
        rightPanel.style.minWidth = `${rightPanelWidth}px`
        rightPanel.style.maxWidth = `${rightPanelWidth}px`
        rightPanel.style.flex = 'none'
        rightPanel.style.flexGrow = '0'
        rightPanel.style.flexShrink = '0'
        rightPanel.style.flexBasis = `${rightPanelWidth}px`
        rightPanel.style.position = 'relative'
        rightPanel.style.overflow = 'hidden'
        
        // Ensure container uses full width
        container.style.width = '100%'
        container.style.maxWidth = '100%'
        container.style.minWidth = '100%'
        container.style.display = 'flex'
        container.style.flexDirection = 'row'
        container.style.alignItems = 'stretch'
      }
    }
    
    // Run immediately and on resize
    stretchRightPanel()
    window.addEventListener('resize', stretchRightPanel)
    
    // Also run after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(stretchRightPanel, 100)
    
    return () => {
      window.removeEventListener('resize', stretchRightPanel)
      clearTimeout(timeoutId)
    }
  }, [])

  // Fetch from Supabase (if enabled)
  const { fetchNotebooks, fetchNotes } = useSupabaseNotes(
    notebooks,
    setNotebooks,
    setNotes,
    setSelectedNoteId
  )

  // When notebooks load from DB and none selected, select first
  useEffect(() => {
    if (!activeNotebook && notebooks.length > 0) {
      setActiveNotebook(notebooks[0].id)
    }
  }, [notebooks, activeNotebook])

  const selectedNote = notes.find(n => n.id === selectedNoteId) || null

  const filteredNotes = useMemo(() => {
    let list = notes
    if (activeTab === "pinned") list = list.filter(n => n.pinned)
    if (activeTab === "archived") list = list.filter(n => n.archived)
    if (activeNotebook) list = list.filter(n => n.notebookId === activeNotebook)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some(t => t.toLowerCase().includes(q))
      )
    }
    // Sort: pinned first, then updatedAt desc
    return list.slice().sort((a,b) => (Number(b.pinned) - Number(a.pinned)) || (new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()))
  }, [notes, activeNotebook, query, activeTab])

  const createNote = () => {
    const id = `n-${Date.now()}`
    const newNote: Note = {
      id,
      title: "Untitled",
      content: "",
      tags: [],
      notebookId: activeNotebook || notebooks[0]?.id || "",
      createdAt: nowIso(),
      updatedAt: nowIso(),
      pinned: false,
      archived: false,
    }
    setNotes(prev => [newNote, ...prev])
    setSelectedNoteId(id)
    if (isSupabaseEnabled && supabase) {
      supabase.from('notes').insert({
        user_id: userId,
        title: newNote.title,
        content: newNote.content,
        tags: newNote.tags,
        pinned: newNote.pinned,
        archived: newNote.archived,
        notebook_id: newNote.notebookId,
      }).then(()=>{
        // Refresh list
        fetchNotes()
      })
    }
  }

  const updateNote = (updates: Partial<Note>) => {
    if (!selectedNote) return
    setNotes(prev => prev.map(n => n.id === selectedNote.id ? { ...n, ...updates, updatedAt: nowIso() } : n))
    if (isSupabaseEnabled && supabase) {
      const payload: any = {}
      if (typeof updates.title !== 'undefined') payload.title = updates.title
      if (typeof updates.content !== 'undefined') payload.content = updates.content
      if (typeof updates.tags !== 'undefined') payload.tags = updates.tags
      if (typeof updates.pinned !== 'undefined') payload.pinned = updates.pinned
      if (typeof updates.archived !== 'undefined') payload.archived = updates.archived
      if (typeof updates.notebookId !== 'undefined') payload.notebook_id = updates.notebookId
      if (Object.keys(payload).length) {
        supabase.from('notes').update(payload).eq('id', selectedNote.id).then(()=>{
          fetchNotes()
        })
      }
    }
  }

  const togglePinned = (note: Note) => {
    setNotes(prev => prev.map(n => n.id === note.id ? { ...n, pinned: !n.pinned, updatedAt: nowIso() } : n))
    if (isSupabaseEnabled && supabase) {
      supabase.from('notes').update({ pinned: !note.pinned }).eq('id', note.id).then(()=>fetchNotes())
    }
  }
  const toggleArchived = (note: Note) => {
    setNotes(prev => prev.map(n => n.id === note.id ? { ...n, archived: !n.archived, updatedAt: nowIso() } : n))
    if (selectedNoteId === note.id && !note.archived) setSelectedNoteId(null)
    if (isSupabaseEnabled && supabase) {
      supabase.from('notes').update({ archived: !note.archived }).eq('id', note.id).then(()=>fetchNotes())
    }
  }
  const addTag = (note: Note, tag: string) => {
    setNotes(prev => prev.map(n => n.id === note.id ? { ...n, tags: Array.from(new Set([...n.tags, tag])), updatedAt: nowIso() } : n))
    toast({
      title: "Tag added",
      description: `Added "${tag}" to note`,
    })
  }
  
  const removeTag = (note: Note, tag: string) => {
    setNotes(prev => prev.map(n => n.id === note.id ? { ...n, tags: n.tags.filter(t => t !== tag), updatedAt: nowIso() } : n))
    toast({
      title: "Tag removed",
      description: `Removed "${tag}" from note`,
    })
  }

  // Auto-save functionality
  useEffect(() => {
    if (!selectedNote) return
    
    const autoSave = setTimeout(() => {
      if (isSupabaseEnabled && supabase) {
        supabase.from('notes').update({
          title: selectedNote.title,
          content: selectedNote.content,
          tags: selectedNote.tags,
          pinned: selectedNote.pinned,
          archived: selectedNote.archived,
          notebook_id: selectedNote.notebookId,
        }).eq('id', selectedNote.id).then(() => {
          setLastSaved(new Date())
        })
      }
    }, 2000) // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(autoSave)
  }, [selectedNote, isSupabaseEnabled])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault()
            createNote()
            break
          case 's':
            e.preventDefault()
            if (selectedNote) {
              updateNote({ updatedAt: nowIso() })
              setLastSaved(new Date())
              toast({
                title: "Note saved",
                description: "Your changes have been saved",
              })
            }
            break
          case 'f':
            e.preventDefault()
            document.querySelector('input[placeholder="Search notes..."]')?.focus()
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNote])

  useEffect(() => {
    // Persist tags when selectedNote changes locally
    const note = notes.find(n => n.id === selectedNoteId)
    if (!note) return
    if (isSupabaseEnabled && supabase) {
      supabase.from('notes').update({
        title: note.title,
        content: note.content,
        tags: note.tags,
        pinned: note.pinned,
        archived: note.archived,
        notebook_id: note.notebookId,
      }).eq('id', note.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes])

  const createNotebook = () => {
    const id = `nb-${Date.now()}`
    const name = `Notebook ${notebooks.length + 1}`
    setNotebooks(prev => prev.concat({ id, name }))
    setActiveNotebook(id)
    if (isSupabaseEnabled && supabase) {
      supabase.from('notes_notebooks').insert({
        user_id: userId,
        name,
      }).then(()=>{
        fetchNotebooks()
        toast({
          title: "Notebook created",
          description: `Created "${name}"`,
        })
      })
    }
  }

  const updateNotebook = (notebookId: string, newName: string) => {
    setNotebooks(prev => prev.map(nb => nb.id === notebookId ? { ...nb, name: newName } : nb))
    setEditingNotebook(null)
    setNotebookName("")
    
    if (isSupabaseEnabled && supabase) {
      supabase.from('notes_notebooks').update({ name: newName }).eq('id', notebookId).then(() => {
        fetchNotebooks()
        toast({
          title: "Notebook updated",
          description: `Renamed to "${newName}"`,
        })
      })
    }
  }

  const deleteNotebook = (notebookId: string) => {
    const notebook = notebooks.find(nb => nb.id === notebookId)
    if (!notebook) return

    // Move notes to first available notebook or create a default one
    const otherNotebooks = notebooks.filter(nb => nb.id !== notebookId)
    const targetNotebook = otherNotebooks[0] || { id: 'default', name: 'Default' }
    
    if (otherNotebooks.length === 0) {
      setNotebooks([targetNotebook])
    } else {
      setNotebooks(otherNotebooks)
    }

    // Update notes to use the target notebook
    setNotes(prev => prev.map(note => 
      note.notebookId === notebookId ? { ...note, notebookId: targetNotebook.id } : note
    ))

    if (activeNotebook === notebookId) {
      setActiveNotebook(targetNotebook.id)
    }

    if (isSupabaseEnabled && supabase) {
      // Update notes in database
      supabase.from('notes').update({ notebook_id: targetNotebook.id }).eq('notebook_id', notebookId)
        .then(() => {
          // Delete notebook
          supabase.from('notes_notebooks').delete().eq('id', notebookId)
            .then(() => {
              fetchNotebooks()
              fetchNotes()
              toast({
                title: "Notebook deleted",
                description: `Deleted "${notebook.name}" and moved notes to "${targetNotebook.name}"`,
              })
            })
        })
    }
  }

  const exportNotes = () => {
    const data = {
      notebooks,
      notes,
      exportDate: new Date().toISOString(),
      version: "1.0"
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `notes-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Notes exported",
      description: "Your notes have been exported successfully",
    })
  }

  const importNotes = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (data.notebooks && data.notes) {
          setNotebooks(data.notebooks)
          setNotes(data.notes)
          toast({
            title: "Notes imported",
            description: "Your notes have been imported successfully",
          })
        } else {
          throw new Error("Invalid file format")
        }
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Invalid file format. Please select a valid notes export file.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="h-full flex notes-page-container" style={{width: '100%', maxWidth: '100%', minWidth: '100%', display: 'flex', flexDirection: 'row', alignItems: 'stretch'}} data-page="notes" id="notes-page-container">
      <style dangerouslySetInnerHTML={{
        __html: `
          .notes-page-container {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 100% !important;
            display: flex !important;
            flex-direction: row !important;
            align-items: stretch !important;
          }
          .notes-left-panel {
            width: 192px !important;
            min-width: 192px !important;
            max-width: 192px !important;
            flex-shrink: 0 !important;
            flex-grow: 0 !important;
            flex-basis: 192px !important;
          }
          .notes-middle-panel {
            width: 307px !important;
            min-width: 307px !important;
            max-width: 307px !important;
            flex-shrink: 0 !important;
            flex-grow: 0 !important;
            flex-basis: 307px !important;
          }
          .notes-right-panel {
            flex: none !important;
            min-width: 0 !important;
            width: auto !important;
            max-width: none !important;
            flex-grow: 0 !important;
            flex-shrink: 0 !important;
            flex-basis: auto !important;
            position: relative !important;
            overflow: hidden !important;
          }
          #notes-page-container {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 100% !important;
            display: flex !important;
            flex-direction: row !important;
            align-items: stretch !important;
          }
          #notes-left-panel {
            width: 192px !important;
            min-width: 192px !important;
            max-width: 192px !important;
            flex-shrink: 0 !important;
            flex-grow: 0 !important;
            flex-basis: 192px !important;
          }
          #notes-middle-panel {
            width: 307px !important;
            min-width: 307px !important;
            max-width: 307px !important;
            flex-shrink: 0 !important;
            flex-grow: 0 !important;
            flex-basis: 307px !important;
          }
          #notes-right-panel {
            flex: none !important;
            min-width: 0 !important;
            width: auto !important;
            max-width: none !important;
            flex-grow: 0 !important;
            flex-shrink: 0 !important;
            flex-basis: auto !important;
            position: relative !important;
            overflow: hidden !important;
          }
          /* NUCLEAR OPTION - FORCE RIGHT PANEL TO STRETCH */
          .notes-page-container > div:last-child {
            flex: none !important;
            min-width: 0 !important;
            width: auto !important;
            max-width: none !important;
            flex-grow: 0 !important;
            flex-shrink: 0 !important;
            flex-basis: auto !important;
            position: relative !important;
            overflow: hidden !important;
          }
        `
      }} />
      {/* Left rail: notebooks */}
      <div className="w-48 border-r p-3 space-y-3 notes-left-panel" style={{width: '192px', minWidth: '192px', maxWidth: '192px'}} id="notes-left-panel" data-panel="notes-left">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Notebooks</h3>
          <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={createNotebook}><Plus className="h-4 w-4"/></Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline"><MoreHorizontal className="h-4 w-4"/></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportNotes}>
                  <Download className="h-4 w-4 mr-2"/>Export
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => document.getElementById('import-notes')?.click()}>
                  <Upload className="h-4 w-4 mr-2"/>Import
                </DropdownMenuItem>
                <input
                  id="import-notes"
                  type="file"
                  accept=".json"
                  onChange={importNotes}
                  className="hidden"
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="space-y-1">
          {notebooks.map(nb => (
            <div key={nb.id} className="flex items-center group">
              <Button 
                variant={activeNotebook===nb.id?"default":"ghost"} 
                className="flex-1 justify-start" 
                onClick={()=>setActiveNotebook(nb.id)}
              >
                {editingNotebook === nb.id ? (
                  <Input
                    value={notebookName}
                    onChange={(e) => setNotebookName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateNotebook(nb.id, notebookName)
                      } else if (e.key === 'Escape') {
                        setEditingNotebook(null)
                        setNotebookName("")
                      }
                    }}
                    onBlur={() => {
                      if (notebookName.trim()) {
                        updateNotebook(nb.id, notebookName)
                      } else {
                        setEditingNotebook(null)
                        setNotebookName("")
                      }
                    }}
                    className="h-6 text-xs"
                    autoFocus
                  />
                ) : (
                  <span className="truncate">{nb.name}</span>
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-3 w-3"/>
            </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    setEditingNotebook(nb.id)
                    setNotebookName(nb.name)
                  }}>
                    <Edit2 className="h-4 w-4 mr-2"/>Rename
                  </DropdownMenuItem>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Trash2 className="h-4 w-4 mr-2"/>Delete
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Notebook</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{nb.name}"? All notes in this notebook will be moved to the default notebook.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteNotebook(nb.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </div>

      {/* Middle: list */}
      <div className="w-80 border-r flex flex-col notes-middle-panel" style={{width: '307px', minWidth: '307px', maxWidth: '307px'}} id="notes-middle-panel" data-panel="notes-middle">
        <div className="p-3 border-b flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
            <Input 
              value={query} 
              onChange={(e)=>setQuery(e.target.value)} 
              placeholder="Search notes... (Ctrl+F)" 
              className="pl-9"
            />
          </div>
          <Button onClick={createNote} title="Create new note (Ctrl+N)">
            <Plus className="h-4 w-4 mr-2"/>New
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-2">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pinned">Pinned</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
        </Tabs>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {filteredNotes.map(note => (
              <Card key={note.id} className={`cursor-pointer transition-all ${selectedNoteId===note.id? 'ring-1 ring-primary' : ''} ${note.pinned ? 'border-l-4 border-l-yellow-500' : ''} ${note.archived ? 'opacity-75' : ''}`} onClick={()=>setSelectedNoteId(note.id)}>
                <CardHeader className="py-3 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {note.pinned && <Pin className="h-3 w-3 text-yellow-500 flex-shrink-0"/>}
                    {note.archived && <Archive className="h-3 w-3 text-muted-foreground flex-shrink-0"/>}
                    <CardTitle className="text-sm truncate">{note.title || 'Untitled'}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4"/></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={()=>togglePinned(note)}>{note.pinned ? <><PinOff className="h-4 w-4 mr-2"/>Unpin</> : <><Pin className="h-4 w-4 mr-2"/>Pin</>}</DropdownMenuItem>
                      <DropdownMenuItem onClick={()=>toggleArchived(note)}>{note.archived ? <><ArchiveRestore className="h-4 w-4 mr-2"/>Unarchive</> : <><Archive className="h-4 w-4 mr-2"/>Archive</>}</DropdownMenuItem>
                      <DropdownMenuSeparator/>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2"/>Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Note</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{note.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => {
                                setNotes(prev => prev.filter(n => n.id !== note.id))
                                if (selectedNoteId === note.id) setSelectedNoteId(null)
                        if (isSupabaseEnabled && supabase) {
                                  supabase.from('notes').delete().eq('id', note.id).then(() => {
                                    fetchNotes()
                                    toast({
                                      title: "Note deleted",
                                      description: "The note has been permanently deleted",
                                    })
                                  })
                                }
                              }}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="py-0 pb-3">
                  <div className="text-xs text-muted-foreground truncate">{note.content.replace(/\n/g," ") || 'No content'}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {note.tags.map(t => (<Badge key={t} variant="outline" className="text-xs"><TagIcon className="h-3 w-3 mr-1"/>{t}</Badge>))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right: editor */}
      <div className="flex-1 flex flex-col notes-right-panel" id="notes-right-panel" data-panel="notes-right" style={{flex: 'none', minWidth: '0', width: 'auto', maxWidth: 'none', flexGrow: '0', flexShrink: '0', flexBasis: 'auto', position: 'relative', overflow: 'hidden'}}>
        {selectedNote ? (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b flex items-center gap-2">
              <Input 
                value={selectedNote.title} 
                onChange={(e)=>updateNote({ title: e.target.value })} 
                className="text-lg font-semibold"
                placeholder="Note title..."
              />
              <div className="ml-auto flex items-center gap-2">
                {lastSaved && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Save className="h-3 w-3"/>
                    Saved {lastSaved.toLocaleTimeString()}
                  </div>
                )}
                <Button variant="outline" size="sm" onClick={()=>togglePinned(selectedNote)}>
                  {selectedNote.pinned ? <><Star className="h-4 w-4 mr-1"/>Pinned</> : <><StarOff className="h-4 w-4 mr-1"/>Pin</>}
                </Button>
                <Button variant="outline" size="sm" onClick={()=>toggleArchived(selectedNote)}>
                  {selectedNote.archived ? <><ArchiveRestore className="h-4 w-4 mr-1"/>Unarchive</> : <><Archive className="h-4 w-4 mr-1"/>Archive</>}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4"/>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Note</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{selectedNote.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => {
                          setNotes(prev => prev.filter(n => n.id !== selectedNote.id))
                          setSelectedNoteId(null)
                          if (isSupabaseEnabled && supabase) {
                            supabase.from('notes').delete().eq('id', selectedNote.id).then(() => {
                              fetchNotes()
                              toast({
                                title: "Note deleted",
                                description: "The note has been permanently deleted",
                              })
                            })
                          }
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-3 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm text-muted-foreground">Content</Label>
                  <div className="text-xs text-muted-foreground">
                    {selectedNote.content.length} characters
                  </div>
                </div>
                <Textarea 
                  value={selectedNote.content} 
                  onChange={(e)=>updateNote({ content: e.target.value })} 
                  className="flex-1 min-h-[300px] resize-none"
                  placeholder="Start writing your note..."
                />
              </div>
              <div className="lg:col-span-1 space-y-4">
                <div>
                  <Label className="mb-2 text-sm text-muted-foreground">Tags</Label>
                  <div className="flex items-center gap-2 mb-2">
                    <Input 
                      placeholder="Add tag..." 
                      onKeyDown={(e:any)=>{ 
                        if(e.key==='Enter'&&e.currentTarget.value.trim()){ 
                          addTag(selectedNote, e.currentTarget.value.trim()); 
                          e.currentTarget.value=''; 
                        } 
                      }} 
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedNote.tags.map(t => (
                      <Badge key={t} variant="secondary" className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground" onClick={()=>removeTag(selectedNote, t)}>
                        {t} ×
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="mb-2 text-sm text-muted-foreground">Notebook</Label>
                  <select 
                    value={selectedNote.notebookId} 
                    onChange={(e) => updateNote({ notebookId: e.target.value })}
                    className="w-full p-2 border rounded-md text-sm bg-background text-foreground border-input focus:ring-2 focus:ring-ring focus:border-ring"
                  >
                    {notebooks.map(nb => (
                      <option key={nb.id} value={nb.id} className="bg-background text-foreground">{nb.name}</option>
                    ))}
                  </select>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertCircle className="h-4 w-4"/>
                      Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground space-y-1">
                    <div>Created: {new Date(selectedNote.createdAt).toLocaleString()}</div>
                    <div>Updated: {new Date(selectedNote.updatedAt).toLocaleString()}</div>
                    <div>Notebook: {notebooks.find(n=>n.id===selectedNote.notebookId)?.name || '-'}</div>
                    <div>Status: {selectedNote.pinned ? 'Pinned' : selectedNote.archived ? 'Archived' : 'Active'}</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
            <div className="text-center space-y-4">
              <div className="text-6xl">📝</div>
              <h3 className="text-lg font-semibold">No note selected</h3>
              <p className="text-sm">Select a note from the list or create a new one to get started.</p>
              <div className="flex flex-col gap-2 text-xs">
                <p><kbd className="px-1 py-0.5 bg-muted rounded">Ctrl+N</kbd> Create new note</p>
                <p><kbd className="px-1 py-0.5 bg-muted rounded">Ctrl+F</kbd> Search notes</p>
                <p><kbd className="px-1 py-0.5 bg-muted rounded">Ctrl+S</kbd> Save note</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Supabase helpers
function useSupabaseNotes(
  notebooks: Notebook[],
  setNotebooks: (n: Notebook[])=>void,
  setNotes: (n: Note[])=>void,
  setSelectedNoteId: (id: string | null)=>void
) {
  useEffect(() => {
    if (isSupabaseEnabled && supabase) {
      fetchNotebooks()
      fetchNotes()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchNotebooks() {
    if (!supabase) return
    const { data } = await supabase.from('notes_notebooks').select('*').order('created_at', { ascending: true })
    if (data) setNotebooks(data.map((r: any) => ({ id: r.id, name: r.name })))
  }

  async function fetchNotes() {
    if (!supabase) return
    const { data } = await supabase.from('notes').select('*').order('updated_at', { ascending: false })
    if (data) setNotes(data.map((r: any) => ({
      id: r.id,
      title: r.title,
      content: r.content,
      tags: r.tags || [],
      notebookId: r.notebook_id || '',
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      pinned: !!r.pinned,
      archived: !!r.archived,
    })))
  }

  return { fetchNotebooks, fetchNotes }
}


