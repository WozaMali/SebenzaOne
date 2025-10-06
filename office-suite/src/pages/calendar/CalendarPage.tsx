"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, MoreHorizontal, Plus, 
  Search, Filter, Download, Upload, Share2, Bell, Repeat, Users, Tag, Trash2, Edit, 
  Eye, EyeOff, Settings, Star, AlertCircle, CheckCircle, X
} from "lucide-react"
import { supabase, isSupabaseEnabled } from "@/lib/supabase-client"

type CalendarEvent = {
  id: string
  title: string
  description?: string
  start: string // ISO
  end: string   // ISO
  location?: string
  calendar: string // e.g., "Work", "Personal"
  color?: string
  isAllDay?: boolean
  isRecurring?: boolean
  recurrencePattern?: string
  attendees?: string[]
  reminders?: number[] // minutes before
  isPrivate?: boolean
  priority?: 'low' | 'medium' | 'high'
  tags?: string[]
}

type Calendar = {
  id: string
  name: string
  color: string
  isVisible: boolean
  isShared: boolean
}

const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0,0,0,0); return x }
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate()+n); return x }
const sameDay = (a: Date, b: Date) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate()

const nowIso = () => new Date().toISOString()

const initialEvents: CalendarEvent[] = [
  { 
    id: "e-1", 
    title: "Daily Standup", 
    description: "Team sync meeting", 
    start: new Date().toISOString(), 
    end: new Date(Date.now()+30*60*1000).toISOString(), 
    location: "Zoom", 
    calendar: "Work",
    color: "#3b82f6",
    isAllDay: false,
    isRecurring: true,
    recurrencePattern: "daily",
    attendees: ["john@company.com", "jane@company.com"],
    reminders: [15, 5],
    priority: "high",
    tags: ["meeting", "team"]
  },
  { 
    id: "e-2", 
    title: "Gym Session", 
    start: new Date(Date.now()+2*60*60*1000).toISOString(), 
    end: new Date(Date.now()+3*60*60*1000).toISOString(), 
    location: "Local Gym", 
    calendar: "Personal",
    color: "#10b981",
    isAllDay: false,
    reminders: [30],
    priority: "medium",
    tags: ["fitness", "health"]
  },
  {
    id: "e-3",
    title: "Project Deadline",
    description: "Submit final report",
    start: new Date(Date.now()+24*60*60*1000).toISOString(),
    end: new Date(Date.now()+24*60*60*1000).toISOString(),
    calendar: "Work",
    color: "#ef4444",
    isAllDay: true,
    priority: "high",
    tags: ["deadline", "project"]
  }
]

const initialCalendars: Calendar[] = [
  { id: "work", name: "Work", color: "#3b82f6", isVisible: true, isShared: false },
  { id: "personal", name: "Personal", color: "#10b981", isVisible: true, isShared: false },
  { id: "team", name: "Team", color: "#8b5cf6", isVisible: true, isShared: true },
  { id: "holidays", name: "Holidays", color: "#f59e0b", isVisible: true, isShared: true }
]

export function CalendarPage() {
  const [view, setView] = useState<"month"|"week"|"day">("month")
  const [cursor, setCursor] = useState<Date>(startOfDay(new Date()))
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)
  const [calendars, setCalendars] = useState<Calendar[]>(initialCalendars)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<CalendarEvent | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCalendar, setFilterCalendar] = useState<string>("all")
  const [showSettings, setShowSettings] = useState(false)
  const [showCalendarManager, setShowCalendarManager] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showEventDetails, setShowEventDetails] = useState(false)

  // Initialize Supabase session and load events
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data?.user?.id || null)
      fetchEvents()
    }).catch(() => {})
  }, [])

  async function fetchEvents() {
    if (!isSupabaseEnabled || !supabase) return
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('start_time', { ascending: true })
    if (error) return
    if (data) {
      setEvents(data.map((r: any) => ({
        id: r.id,
        title: r.title,
        description: r.description || '',
        start: r.start_time,
        end: r.end_time,
        location: r.location || '',
        calendar: r.calendar || 'Work',
      })))
    }
  }

  const monthMatrix = useMemo(() => {
    // Build 6x7 grid for month view
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
    const start = addDays(first, -((first.getDay()+6)%7)) // Monday-first grid
    const weeks: Date[][] = []
    for (let w=0; w<6; w++) {
      const row: Date[] = []
      for (let d=0; d<7; d++) row.push(addDays(start, w*7+d))
      weeks.push(row)
    }
    return weeks
  }, [cursor])

  const weekDays = useMemo(() => {
    const start = addDays(cursor, -((cursor.getDay()+6)%7)) // Monday start
    return Array.from({ length: 7 }, (_,i)=> addDays(start, i))
  }, [cursor])

  const dayHours = useMemo(()=> Array.from({length:24},(_,i)=>i), [])

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = !searchQuery || 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCalendar = filterCalendar === "all" || event.calendar === filterCalendar
      const calendarVisible = calendars.find(c => c.name === event.calendar)?.isVisible !== false
      
      return matchesSearch && matchesCalendar && calendarVisible
    })
  }, [events, searchQuery, filterCalendar, calendars])

  const dayEvents = (date: Date) => filteredEvents.filter(e => sameDay(new Date(e.start), date))

  const openCreate = (date?: Date) => {
    setEditing({ id: `e-${Date.now()}`, title: "", description: "", start: (date||cursor).toISOString(), end: (date||cursor).toISOString(), location: "", calendar: "Work" })
    setDialogOpen(true)
  }
  const openEdit = (event: CalendarEvent) => { setEditing(event); setDialogOpen(true) }
  const saveEvent = async () => {
    if (!editing) return
    const exists = events.some(e=>e.id===editing.id)
    setEvents(prev => exists ? prev.map(e=>e.id===editing.id? editing : e) : prev.concat(editing))

    if (isSupabaseEnabled && supabase) {
      if (exists) {
        await supabase.from('calendar_events').update({
          title: editing.title,
          description: editing.description || '',
          start_time: editing.start,
          end_time: editing.end,
          location: editing.location || '',
          calendar: editing.calendar,
        }).eq('id', editing.id)
      } else {
        await supabase.from('calendar_events').insert({
          user_id: userId,
          title: editing.title,
          description: editing.description || '',
          start_time: editing.start,
          end_time: editing.end,
          location: editing.location || '',
          calendar: editing.calendar,
        })
      }
      fetchEvents()
    }
    setDialogOpen(false); setEditing(null)
  }
  const deleteEvent = async (id: string) => {
    setEvents(prev => prev.filter(e=>e.id!==id))
    if (isSupabaseEnabled && supabase) {
      await supabase.from('calendar_events').delete().eq('id', id)
      fetchEvents()
    }
  }

  const headerLabel = useMemo(() => {
    if (view === "month") return cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })
    if (view === "week") {
      const start = weekDays[0]; const end = weekDays[6]
      return `${start.toLocaleDateString()} – ${end.toLocaleDateString()}`
    }
    return cursor.toLocaleDateString()
  }, [view, cursor, weekDays])

  // Calendar page positioning - now handled globally
  useEffect(() => {
    // Add data-page attribute for global CSS targeting
    const mainElement = document.querySelector('main')
    if (mainElement) {
      mainElement.setAttribute('data-page', 'calendar')
    }
  }, [])

  return (
    <div className="h-full flex flex-col" data-page="calendar">
      <div className="enterprise-card" style={{
        padding: '1rem', 
        marginBottom: '1rem'
      }}>
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={()=>setCursor(addDays(cursor, view==="month"? -30 : view==="week"? -7 : -1))}><ChevronLeft className="h-4 w-4"/></Button>
          <Button variant="outline" size="sm" onClick={()=>setCursor(addDays(cursor, view==="month"? 30 : view==="week"? 7 : 1))}><ChevronRight className="h-4 w-4"/></Button>
          <Button size="sm" onClick={()=>setCursor(startOfDay(new Date()))}>Today</Button>
          <h2 className="text-xl font-semibold ml-3 flex items-center gap-2"><CalendarIcon className="h-5 w-5"/>{headerLabel}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(v)=>setView(v as any)} className="mr-2">
            <TabsList>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="day">Day</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={()=>openCreate()}><Plus className="h-4 w-4 mr-2"/>New Event</Button>
            <Button variant="outline" onClick={()=>setShowCalendarManager(true)}><Settings className="h-4 w-4 mr-2"/>Calendars</Button>
          </div>
        </div>
        
        {/* Search and Filter Bar */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterCalendar} onValueChange={setFilterCalendar}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Calendars" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Calendars</SelectItem>
              {calendars.map(cal => (
                <SelectItem key={cal.id} value={cal.name}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: cal.color}} />
                    {cal.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </div>
      </div>

      {/* Views */}
      {view === "month" && (
        <Card className="flex-1">
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-2">
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d)=>(<div key={d} className="text-xs text-muted-foreground px-2">{d}</div>))}
            </div>
            <div className="grid grid-cols-7 gap-2 mt-2">
              {monthMatrix.flat().map((day, idx)=> (
                <div key={idx} className={`min-h-28 p-2 rounded-md border ${day.getMonth()===cursor.getMonth()? 'bg-card' : 'bg-muted/30'}`}> 
                  <div className="flex items-center justify-between mb-1">
                    <div className={`text-xs ${sameDay(day, new Date())? 'font-semibold text-primary' : 'text-muted-foreground'}`}>{day.getDate()}</div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0"><MoreHorizontal className="h-3 w-3"/></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={()=>openCreate(day)}>Add event</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="space-y-1">
                    {dayEvents(day).slice(0, 3).map(e => {
                      const calendar = calendars.find(c => c.name === e.calendar)
                      const color = e.color || calendar?.color || "#3b82f6"
                      return (
                        <Button 
                          key={e.id} 
                          variant="outline" 
                          size="sm" 
                          className="h-6 w-full justify-start truncate text-xs" 
                          onClick={() => {
                            setSelectedEvent(e)
                            setShowEventDetails(true)
                          }}
                          style={{ 
                            borderLeftColor: color, 
                            borderLeftWidth: '3px',
                            backgroundColor: `${color}10`
                          }}
                        >
                          <div className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: color}} />
                        {e.title}
                      </Button>
                      )
                    })}
                    {dayEvents(day).length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{dayEvents(day).length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {view === "week" && (
        <Card className="flex-1">
          <CardContent className="p-4">
            <div className="grid grid-cols-8 gap-2">
              <div></div>
              {weekDays.map((d,i)=>(<div key={i} className="text-xs text-muted-foreground">{d.toLocaleDateString(undefined,{weekday:'short', day:'numeric'})}</div>))}
            </div>
            <div className="grid grid-cols-8 gap-2 mt-2">
              <div className="space-y-3">
                {dayHours.map(h=>(<div key={h} className="text-xs text-muted-foreground h-12"><div className="translate-y-[-6px]">{h}:00</div></div>))}
              </div>
              {weekDays.map((d,idx)=> (
                <div key={idx} className="border rounded-md p-1">
                  {events.filter(e=> sameDay(new Date(e.start), d)).map(e=> (
                    <Button key={e.id} variant="secondary" size="sm" className="block w-full mb-1 truncate" onClick={()=>openEdit(e)}>
                      {e.title}
                    </Button>
                  ))}
                  <Button variant="ghost" size="sm" className="w-full" onClick={()=>openCreate(d)}>+ Add</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {view === "day" && (
        <Card className="flex-1">
          <CardContent className="p-4">
            <div className="grid grid-cols-8 gap-2">
              <div className="text-xs text-muted-foreground">{cursor.toLocaleDateString(undefined,{weekday:'long', day:'numeric', month:'short'})}</div>
            </div>
            <div className="mt-2 space-y-2">
              {events.filter(e=> sameDay(new Date(e.start), cursor)).map(e => (
                <Card key={e.id} className="p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4"/>
                      <div className="text-sm">
                        {new Date(e.start).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} – {new Date(e.end).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                      </div>
                      <span className="font-medium">{e.title}</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4"/></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={()=>openEdit(e)}>Edit</DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem className="text-destructive" onClick={()=>deleteEvent(e.id)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {e.location && <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1"><MapPin className="h-3 w-3"/>{e.location}</div>}
                  {e.description && <div className="text-sm mt-1">{e.description}</div>}
                </Card>
              ))}
              <Button variant="outline" onClick={()=>openCreate(cursor)}>+ Add event</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing && events.some(e=>e.id===editing.id) ? 'Edit Event' : 'New Event'}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title *</Label>
                  <Input value={editing.title} onChange={(e)=>setEditing({...editing, title: e.target.value })} placeholder="Event title"/>
                </div>
                <div>
                  <Label>Calendar</Label>
                  <Select value={editing.calendar} onValueChange={(v)=>setEditing({...editing, calendar: v})}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      {calendars.map(cal => (
                        <SelectItem key={cal.id} value={cal.name}>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{backgroundColor: cal.color}} />
                            {cal.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Description</Label>
                <Textarea value={editing.description || ''} onChange={(e)=>setEditing({...editing, description: e.target.value })} placeholder="Event description"/>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <Input type="datetime-local" value={new Date(editing.start).toISOString().slice(0,16)} onChange={(e)=>setEditing({...editing, start: new Date(e.target.value).toISOString() })}/>
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input type="datetime-local" value={new Date(editing.end).toISOString().slice(0,16)} onChange={(e)=>setEditing({...editing, end: new Date(e.target.value).toISOString() })}/>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="allDay" 
                  checked={editing.isAllDay || false} 
                  onCheckedChange={(checked) => setEditing({...editing, isAllDay: checked as boolean})}
                />
                <Label htmlFor="allDay">All day event</Label>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Location</Label>
                  <Input value={editing.location || ''} onChange={(e)=>setEditing({...editing, location: e.target.value })} placeholder="Event location"/>
              </div>
              <div>
                  <Label>Priority</Label>
                  <Select value={editing.priority || 'medium'} onValueChange={(v)=>setEditing({...editing, priority: v as any})}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Tags (comma separated)</Label>
                <Input 
                  value={editing.tags?.join(', ') || ''} 
                  onChange={(e)=>setEditing({...editing, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)})} 
                  placeholder="meeting, important, project"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="recurring" 
                  checked={editing.isRecurring || false} 
                  onCheckedChange={(checked) => setEditing({...editing, isRecurring: checked as boolean})}
                />
                <Label htmlFor="recurring">Recurring event</Label>
              </div>
              
              {editing.isRecurring && (
                <div>
                  <Label>Recurrence Pattern</Label>
                  <Select value={editing.recurrencePattern || 'daily'} onValueChange={(v)=>setEditing({...editing, recurrencePattern: v})}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              )}
              
              <div className="flex items-center justify-end gap-2 pt-4">
                <Button variant="outline" onClick={()=>{ setDialogOpen(false); setEditing(null) }}>Cancel</Button>
                <Button onClick={saveEvent}>Save Event</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={showEventDetails} onOpenChange={setShowEventDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {new Date(selectedEvent.start).toLocaleString()} - {new Date(selectedEvent.end).toLocaleString()}
                </span>
              </div>
              {selectedEvent.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedEvent.location}</span>
                </div>
              )}
              {selectedEvent.description && (
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedEvent.description}</p>
                </div>
              )}
              {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedEvent.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: selectedEvent.color || "#3b82f6"}} />
                  <span className="text-sm">{selectedEvent.calendar}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    setShowEventDetails(false)
                    openEdit(selectedEvent)
                  }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    deleteEvent(selectedEvent.id)
                    setShowEventDetails(false)
                  }}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Calendar Manager Dialog */}
      <Dialog open={showCalendarManager} onOpenChange={setShowCalendarManager}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Calendars</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              {calendars.map(cal => (
                <div key={cal.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{backgroundColor: cal.color}} />
                    <div>
                      <div className="font-medium">{cal.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {cal.isShared ? 'Shared' : 'Personal'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={cal.isVisible} 
                      onCheckedChange={(checked) => setCalendars(prev => 
                        prev.map(c => c.id === cal.id ? {...c, isVisible: checked} : c)
                      )}
                    />
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => {
                const newCal: Calendar = {
                  id: `cal-${Date.now()}`,
                  name: 'New Calendar',
                  color: '#3b82f6',
                  isVisible: true,
                  isShared: false
                }
                setCalendars(prev => [...prev, newCal])
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Calendar
              </Button>
              <Button onClick={() => setShowCalendarManager(false)}>
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


