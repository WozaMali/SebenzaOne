'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Save, 
  X, 
  User, 
  Mail, 
  Shield, 
  Key, 
  Plus, 
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface UserFormData {
  name: string
  email: string
  role: 'owner' | 'admin' | 'helpdesk' | 'auditor' | 'user'
  status: 'active' | 'suspended' | 'pending'
  quota: number
  aliases: string[]
  permissions: string[]
  password: string
  confirmPassword: string
}

interface Permission {
  id: string
  name: string
  description: string
  category: string
}

// ============================================================================
// PERMISSIONS DATA
// ============================================================================

const permissions: Permission[] = [
  // User Management
  { id: 'users.create', name: 'Create Users', description: 'Create new user accounts', category: 'User Management' },
  { id: 'users.edit', name: 'Edit Users', description: 'Modify existing user accounts', category: 'User Management' },
  { id: 'users.delete', name: 'Delete Users', description: 'Remove user accounts', category: 'User Management' },
  { id: 'users.suspend', name: 'Suspend Users', description: 'Suspend user accounts', category: 'User Management' },
  
  // Domain Management
  { id: 'domains.create', name: 'Create Domains', description: 'Add new domains', category: 'Domain Management' },
  { id: 'domains.edit', name: 'Edit Domains', description: 'Modify domain settings', category: 'Domain Management' },
  { id: 'domains.delete', name: 'Delete Domains', description: 'Remove domains', category: 'Domain Management' },
  { id: 'domains.dns', name: 'DNS Management', description: 'Manage DNS records', category: 'Domain Management' },
  
  // Security
  { id: 'security.policies', name: 'Security Policies', description: 'Manage security policies', category: 'Security' },
  { id: 'security.audit', name: 'Audit Logs', description: 'View audit logs', category: 'Security' },
  { id: 'security.encryption', name: 'Encryption', description: 'Manage encryption settings', category: 'Security' },
  
  // Mail Configuration
  { id: 'mail.routing', name: 'Mail Routing', description: 'Configure mail routing rules', category: 'Mail Configuration' },
  { id: 'mail.filters', name: 'Mail Filters', description: 'Manage mail filters', category: 'Mail Configuration' },
  { id: 'mail.quotas', name: 'Mail Quotas', description: 'Set mail quotas', category: 'Mail Configuration' },
  
  // Monitoring
  { id: 'monitoring.dashboard', name: 'Dashboard', description: 'View monitoring dashboard', category: 'Monitoring' },
  { id: 'monitoring.reports', name: 'Reports', description: 'Generate reports', category: 'Monitoring' },
  { id: 'monitoring.alerts', name: 'Alerts', description: 'Manage alerts', category: 'Monitoring' }
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getRolePermissions = (role: string): string[] => {
  switch (role) {
    case 'owner':
      return permissions.map(p => p.id)
    case 'admin':
      return permissions.filter(p => !p.id.includes('delete')).map(p => p.id)
    case 'helpdesk':
      return ['users.edit', 'mail.routing', 'mail.filters', 'monitoring.dashboard']
    case 'auditor':
      return ['security.audit', 'monitoring.dashboard', 'monitoring.reports']
    case 'user':
      return ['mail.filters']
    default:
      return []
  }
}

const getPermissionCategory = (permissionId: string) => {
  const permission = permissions.find(p => p.id === permissionId)
  return permission?.category || 'Other'
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface UserEditorProps {
  user?: any // User object if editing, undefined if creating
  onSave: (userData: UserFormData) => void
  onCancel: () => void
}

export default function UserEditor({ user, onSave, onCancel }: UserEditorProps) {
  const isEditing = !!user
  
  const [formData, setFormData] = useState<UserFormData>({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'user',
    status: user?.status || 'active',
    quota: user?.quota || 1000,
    aliases: user?.aliases || [],
    permissions: user?.permissions || [],
    password: '',
    confirmPassword: ''
  })

  const [newAlias, setNewAlias] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  const handleInputChange = (field: keyof UserFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleRoleChange = (role: string) => {
    setFormData(prev => ({ 
      ...prev, 
      role: role as any,
      permissions: getRolePermissions(role)
    }))
  }

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }))
  }

  const handleAddAlias = () => {
    if (newAlias && !formData.aliases.includes(newAlias)) {
      setFormData(prev => ({
        ...prev,
        aliases: [...prev.aliases, newAlias]
      }))
      setNewAlias('')
    }
  }

  const handleRemoveAlias = (alias: string) => {
    setFormData(prev => ({
      ...prev,
      aliases: prev.aliases.filter(a => a !== alias)
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!isEditing && !formData.password) {
      newErrors.password = 'Password is required for new users'
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (formData.quota < 100) {
      newErrors.quota = 'Quota must be at least 100MB'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData)
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {isEditing ? 'Edit User' : 'Create User'}
          </h2>
          <p className="text-muted-foreground">
            {isEditing ? 'Modify user account settings' : 'Create a new user account'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="aliases">Aliases</TabsTrigger>
        </TabsList>

        {/* Basic Information */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter full name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="user@sebenza.co.za"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="helpdesk">Helpdesk</SelectItem>
                      <SelectItem value="auditor">Auditor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quota">Mail Quota (MB)</Label>
                  <Input
                    id="quota"
                    type="number"
                    value={formData.quota}
                    onChange={(e) => handleInputChange('quota', parseInt(e.target.value) || 0)}
                    placeholder="1000"
                    className={errors.quota ? 'border-red-500' : ''}
                  />
                  {errors.quota && <p className="text-sm text-red-500">{errors.quota}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isEditing && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Enter password"
                        className={errors.password ? 'border-red-500' : ''}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Confirm password"
                      className={errors.confirmPassword ? 'border-red-500' : ''}
                    />
                    {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                  </div>
                </>
              )}
              
              {isEditing && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Key className="h-4 w-4" />
                    Password management is handled separately for security reasons.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions */}
        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(
                  permissions.reduce((acc, permission) => {
                    if (!acc[permission.category]) {
                      acc[permission.category] = []
                    }
                    acc[permission.category].push(permission)
                    return acc
                  }, {} as Record<string, Permission[]>)
                ).map(([category, categoryPermissions]) => (
                  <div key={category} className="space-y-3">
                    <h4 className="font-medium text-foreground">{category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {categoryPermissions.map((permission) => (
                        <div key={permission.id} className="flex items-start gap-3 p-3 border border-border rounded-lg">
                          <Checkbox
                            id={permission.id}
                            checked={formData.permissions.includes(permission.id)}
                            onCheckedChange={() => handlePermissionToggle(permission.id)}
                          />
                          <div className="space-y-1">
                            <Label htmlFor={permission.id} className="font-medium">
                              {permission.name}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              {permission.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aliases */}
        <TabsContent value="aliases" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Aliases
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newAlias}
                  onChange={(e) => setNewAlias(e.target.value)}
                  placeholder="alias@sebenza.co.za"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddAlias()}
                />
                <Button onClick={handleAddAlias} disabled={!newAlias}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              
              {formData.aliases.length > 0 && (
                <div className="space-y-2">
                  <Label>Current Aliases</Label>
                  <div className="space-y-2">
                    {formData.aliases.map((alias, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                        <span className="text-sm">{alias}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAlias(alias)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
