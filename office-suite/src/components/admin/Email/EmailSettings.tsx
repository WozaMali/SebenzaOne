'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Mail, 
  Settings,
  Server,
  Database,
  Shield,
  Key,
  Globe,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Save,
  RefreshCw,
  Download,
  Upload,
  TestTube,
  Zap,
  Bell,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Activity,
  TrendingUp,
  BarChart3,
  Users,
  MailPlus,
  Send,
  Archive,
  Trash2 as TrashIcon,
  Star,
  Flag,
  Tag,
  Folder,
  Inbox,
  Outbox,
  Draft,
  Spam,
  AlertCircle,
  CheckSquare,
  XSquare,
  Play,
  Pause,
  RotateCcw,
  Power,
  Wifi,
  WifiOff,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Lock,
  Unlock,
  User,
  UserCheck,
  UserX,
  MailOpen,
  MailCheck,
  MailX,
  MailWarning,
  MailClock,
  MailSearch,
  MailFilter,
  MailArchive,
  MailTrash,
  MailStar,
  MailFlag,
  MailTag,
  MailFolder,
  MailInbox,
  MailOutbox,
  MailDraft,
  MailSpam,
  Sun,
  Moon,
  Palette,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  Headphones,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Video,
  VideoOff,
  Phone,
  PhoneOff,
  MessageCircle,
  MessageSquare,
  MessageCircle2,
  MessageSquare2,
  MessageCircle3,
  MessageSquare3,
  MessageCircle4,
  MessageSquare4,
  MessageCircle5,
  MessageSquare5,
  MessageCircle6,
  MessageSquare6,
  MessageCircle7,
  MessageSquare7,
  MessageCircle8,
  MessageSquare8,
  MessageCircle9,
  MessageSquare9,
  MessageCircle10,
  MessageSquare10
} from 'lucide-react'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface EmailSettings {
  id: string
  category: string
  name: string
  description: string
  value: any
  type: 'boolean' | 'string' | 'number' | 'select' | 'textarea' | 'slider'
  options?: string[]
  min?: number
  max?: number
  step?: number
  unit?: string
  isAdvanced: boolean
  requiresRestart: boolean
  lastModified: string
  modifiedBy: string
}

interface EmailTheme {
  id: string
  name: string
  description: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  isDefault: boolean
  isActive: boolean
  preview: string
}

interface EmailNotification {
  id: string
  name: string
  description: string
  type: 'email' | 'push' | 'sms' | 'webhook'
  isEnabled: boolean
  conditions: string[]
  actions: string[]
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
  lastSent: string
  sentCount: number
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

const sampleSettings: EmailSettings[] = [
  {
    id: '1',
    category: 'General',
    name: 'Email Signature',
    description: 'Default email signature for all outgoing emails',
    value: 'Best regards,\nSebenza Team\n\nThis email was sent from Sebenza Mail System',
    type: 'textarea',
    isAdvanced: false,
    requiresRestart: false,
    lastModified: '2024-01-15T10:30:00Z',
    modifiedBy: 'admin@sebenza.co.za'
  },
  {
    id: '2',
    category: 'General',
    name: 'Auto-Reply',
    description: 'Enable automatic replies for out-of-office messages',
    value: true,
    type: 'boolean',
    isAdvanced: false,
    requiresRestart: false,
    lastModified: '2024-01-15T10:25:00Z',
    modifiedBy: 'admin@sebenza.co.za'
  },
  {
    id: '3',
    category: 'Security',
    name: 'Two-Factor Authentication',
    description: 'Require 2FA for all email access',
    value: true,
    type: 'boolean',
    isAdvanced: false,
    requiresRestart: false,
    lastModified: '2024-01-15T10:20:00Z',
    modifiedBy: 'admin@sebenza.co.za'
  },
  {
    id: '4',
    category: 'Security',
    name: 'Password Expiry',
    description: 'Days before password expires',
    value: 90,
    type: 'slider',
    min: 30,
    max: 365,
    step: 1,
    unit: 'days',
    isAdvanced: true,
    requiresRestart: true,
    lastModified: '2024-01-15T10:15:00Z',
    modifiedBy: 'admin@sebenza.co.za'
  },
  {
    id: '5',
    category: 'Performance',
    name: 'Cache Size',
    description: 'Email cache size in MB',
    value: 512,
    type: 'slider',
    min: 64,
    max: 2048,
    step: 64,
    unit: 'MB',
    isAdvanced: true,
    requiresRestart: true,
    lastModified: '2024-01-15T10:10:00Z',
    modifiedBy: 'admin@sebenza.co.za'
  },
  {
    id: '6',
    category: 'Performance',
    name: 'Max Connections',
    description: 'Maximum concurrent connections',
    value: 100,
    type: 'slider',
    min: 10,
    max: 500,
    step: 10,
    isAdvanced: true,
    requiresRestart: true,
    lastModified: '2024-01-15T10:05:00Z',
    modifiedBy: 'admin@sebenza.co.za'
  },
  {
    id: '7',
    category: 'Notifications',
    name: 'Email Notifications',
    description: 'Send email notifications for important events',
    value: true,
    type: 'boolean',
    isAdvanced: false,
    requiresRestart: false,
    lastModified: '2024-01-15T10:00:00Z',
    modifiedBy: 'admin@sebenza.co.za'
  },
  {
    id: '8',
    category: 'Notifications',
    name: 'Push Notifications',
    description: 'Send push notifications to mobile devices',
    value: false,
    type: 'boolean',
    isAdvanced: false,
    requiresRestart: false,
    lastModified: '2024-01-15T09:55:00Z',
    modifiedBy: 'admin@sebenza.co.za'
  }
]

const sampleThemes: EmailTheme[] = [
  {
    id: '1',
    name: 'Sebenza Dark',
    description: 'Dark theme with Sebenza branding',
    primaryColor: '#1a1a1a',
    secondaryColor: '#2d2d2d',
    accentColor: '#10b981',
    backgroundColor: '#0f0f0f',
    textColor: '#ffffff',
    isDefault: true,
    isActive: true,
    preview: 'dark-preview.png'
  },
  {
    id: '2',
    name: 'Sebenza Light',
    description: 'Light theme with Sebenza branding',
    primaryColor: '#ffffff',
    secondaryColor: '#f8f9fa',
    accentColor: '#10b981',
    backgroundColor: '#ffffff',
    textColor: '#1a1a1a',
    isDefault: false,
    isActive: false,
    preview: 'light-preview.png'
  },
  {
    id: '3',
    name: 'Corporate Blue',
    description: 'Professional blue theme',
    primaryColor: '#1e40af',
    secondaryColor: '#3b82f6',
    accentColor: '#06b6d4',
    backgroundColor: '#f8fafc',
    textColor: '#1e293b',
    isDefault: false,
    isActive: false,
    preview: 'blue-preview.png'
  }
]

const sampleNotifications: EmailNotification[] = [
  {
    id: '1',
    name: 'New Email Alert',
    description: 'Notify when new emails arrive',
    type: 'email',
    isEnabled: true,
    conditions: ['new_email'],
    actions: ['send_notification'],
    frequency: 'immediate',
    lastSent: '2024-01-15T14:30:00Z',
    sentCount: 1247
  },
  {
    id: '2',
    name: 'Security Alert',
    description: 'Notify about security events',
    type: 'email',
    isEnabled: true,
    conditions: ['failed_login', 'suspicious_activity'],
    actions: ['send_alert', 'log_event'],
    frequency: 'immediate',
    lastSent: '2024-01-15T13:45:00Z',
    sentCount: 23
  },
  {
    id: '3',
    name: 'Weekly Summary',
    description: 'Weekly email activity summary',
    type: 'email',
    isEnabled: false,
    conditions: ['weekly_summary'],
    actions: ['send_summary'],
    frequency: 'weekly',
    lastSent: '2024-01-08T09:00:00Z',
    sentCount: 0
  }
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'General': return <Settings className="h-4 w-4" />
    case 'Security': return <Shield className="h-4 w-4" />
    case 'Performance': return <Zap className="h-4 w-4" />
    case 'Notifications': return <Bell className="h-4 w-4" />
    default: return <Settings className="h-4 w-4" />
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function EmailSettings() {
  const [activeTab, setActiveTab] = useState('general')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [settings, setSettings] = useState<EmailSettings[]>(sampleSettings)
  const [themes, setThemes] = useState<EmailTheme[]>(sampleThemes)
  const [notifications, setNotifications] = useState<EmailNotification[]>(sampleNotifications)

  // ============================================================================
  // FILTERED DATA
  // ============================================================================
  
  const filteredSettings = settings.filter(setting =>
    setting.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    setting.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    setting.category.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(setting => showAdvanced || !setting.isAdvanced)

  const filteredThemes = themes.filter(theme =>
    theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    theme.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredNotifications = notifications.filter(notification =>
    notification.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notification.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  const handleSettingChange = (settingId: string, newValue: any) => {
    setSettings(prev => prev.map(setting => 
      setting.id === settingId 
        ? { ...setting, value: newValue, lastModified: new Date().toISOString() }
        : setting
    ))
  }

  const handleThemeChange = (themeId: string) => {
    setThemes(prev => prev.map(theme => 
      theme.id === themeId 
        ? { ...theme, isActive: true }
        : { ...theme, isActive: false }
    ))
  }

  const handleNotificationToggle = (notificationId: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === notificationId 
        ? { ...notification, isEnabled: !notification.isEnabled }
        : notification
    ))
  }

  const handleSaveSettings = () => {
    console.log('Saving settings...')
    // Implement save functionality here
  }

  const handleResetSettings = () => {
    console.log('Resetting settings...')
    // Implement reset functionality here
  }

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Email Settings</h2>
          <p className="text-muted-foreground">Configure email system settings, themes, and notifications</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleResetSettings}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSaveSettings} className="bg-emerald-600 hover:bg-emerald-700">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search settings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="advanced"
                checked={showAdvanced}
                onCheckedChange={setShowAdvanced}
              />
              <Label htmlFor="advanced" className="text-sm">
                Show Advanced Settings
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="themes">Themes</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSettings.map((setting) => (
              <Card key={setting.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(setting.category)}
                    <CardTitle className="text-lg">{setting.name}</CardTitle>
                    {setting.isAdvanced && (
                      <Badge variant="secondary" className="text-xs">
                        Advanced
                      </Badge>
                    )}
                    {setting.requiresRestart && (
                      <Badge variant="outline" className="text-xs">
                        Restart Required
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{setting.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {setting.type === 'boolean' && (
                    <div className="flex items-center justify-between">
                      <Label htmlFor={setting.id} className="text-sm">
                        {setting.name}
                      </Label>
                      <Switch
                        id={setting.id}
                        checked={setting.value}
                        onCheckedChange={(checked) => handleSettingChange(setting.id, checked)}
                      />
                    </div>
                  )}
                  
                  {setting.type === 'string' && (
                    <div className="space-y-2">
                      <Label htmlFor={setting.id} className="text-sm">
                        {setting.name}
                      </Label>
                      <Input
                        id={setting.id}
                        value={setting.value}
                        onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                        placeholder={setting.description}
                      />
                    </div>
                  )}
                  
                  {setting.type === 'textarea' && (
                    <div className="space-y-2">
                      <Label htmlFor={setting.id} className="text-sm">
                        {setting.name}
                      </Label>
                      <Textarea
                        id={setting.id}
                        value={setting.value}
                        onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                        placeholder={setting.description}
                        rows={4}
                      />
                    </div>
                  )}
                  
                  {setting.type === 'slider' && (
                    <div className="space-y-2">
                      <Label htmlFor={setting.id} className="text-sm">
                        {setting.name}: {setting.value}{setting.unit}
                      </Label>
                      <Slider
                        id={setting.id}
                        value={[setting.value]}
                        onValueChange={(value) => handleSettingChange(setting.id, value[0])}
                        min={setting.min}
                        max={setting.max}
                        step={setting.step}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{setting.min}{setting.unit}</span>
                        <span>{setting.max}{setting.unit}</span>
                      </div>
                    </div>
                  )}
                  
                  {setting.type === 'select' && setting.options && (
                    <div className="space-y-2">
                      <Label htmlFor={setting.id} className="text-sm">
                        {setting.name}
                      </Label>
                      <Select
                        value={setting.value}
                        onValueChange={(value) => handleSettingChange(setting.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={setting.description} />
                        </SelectTrigger>
                        <SelectContent>
                          {setting.options.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Last modified: {formatDate(setting.lastModified)} by {setting.modifiedBy}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Themes */}
        <TabsContent value="themes" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredThemes.map((theme) => (
              <Card key={theme.id} className={`hover:shadow-lg transition-shadow cursor-pointer ${
                theme.isActive ? 'ring-2 ring-emerald-500' : ''
              }`} onClick={() => handleThemeChange(theme.id)}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{theme.name}</CardTitle>
                    {theme.isDefault && (
                      <Badge variant="default">Default</Badge>
                    )}
                    {theme.isActive && (
                      <Badge variant="secondary">Active</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{theme.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Theme Preview */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Preview</Label>
                    <div 
                      className="w-full h-32 rounded-lg border"
                      style={{
                        backgroundColor: theme.backgroundColor,
                        color: theme.textColor
                      }}
                    >
                      <div className="p-4 space-y-2">
                        <div className="h-4 rounded" style={{ backgroundColor: theme.primaryColor, width: '80%' }} />
                        <div className="h-3 rounded" style={{ backgroundColor: theme.secondaryColor, width: '60%' }} />
                        <div className="h-3 rounded" style={{ backgroundColor: theme.accentColor, width: '40%' }} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Color Palette */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Color Palette</Label>
                    <div className="flex gap-2">
                      <div 
                        className="w-8 h-8 rounded-full border"
                        style={{ backgroundColor: theme.primaryColor }}
                        title="Primary"
                      />
                      <div 
                        className="w-8 h-8 rounded-full border"
                        style={{ backgroundColor: theme.secondaryColor }}
                        title="Secondary"
                      />
                      <div 
                        className="w-8 h-8 rounded-full border"
                        style={{ backgroundColor: theme.accentColor }}
                        title="Accent"
                      />
                      <div 
                        className="w-8 h-8 rounded-full border"
                        style={{ backgroundColor: theme.backgroundColor }}
                        title="Background"
                      />
                      <div 
                        className="w-8 h-8 rounded-full border"
                        style={{ backgroundColor: theme.textColor }}
                        title="Text"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant={theme.isActive ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => handleThemeChange(theme.id)}
                    >
                      {theme.isActive ? 'Active' : 'Activate'}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <Card key={notification.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">{notification.name}</h3>
                        <Badge variant="outline" className="capitalize">
                          {notification.type}
                        </Badge>
                        <Badge variant="secondary" className="capitalize">
                          {notification.frequency}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Conditions: {notification.conditions.join(', ')}</span>
                        <span>Actions: {notification.actions.join(', ')}</span>
                        <span>Sent: {notification.sentCount} times</span>
                        <span>Last: {formatDate(notification.lastSent)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={notification.isEnabled}
                        onCheckedChange={() => handleNotificationToggle(notification.id)}
                      />
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{settings.length}</div>
                <div className="text-sm text-muted-foreground">Total Settings</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Palette className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{themes.length}</div>
                <div className="text-sm text-muted-foreground">Available Themes</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {notifications.filter(n => n.isEnabled).length}
                </div>
                <div className="text-sm text-muted-foreground">Active Notifications</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {settings.filter(s => s.requiresRestart).length}
                </div>
                <div className="text-sm text-muted-foreground">Pending Restarts</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
