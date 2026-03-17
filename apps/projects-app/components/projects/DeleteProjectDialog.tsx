import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Shield } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'

interface DeleteProjectDialogProps {
  open: boolean
  onClose: () => void
  onDeleted: () => void
  project: { id: string; name: string; code: string } | null
  isAdmin: boolean
}

export function DeleteProjectDialog({ 
  open, 
  onClose, 
  onDeleted, 
  project, 
  isAdmin 
}: DeleteProjectDialogProps) {
  const [loading, setLoading] = useState(false)
  const [confirmationText, setConfirmationText] = useState('')
  const [adminApprovalRequired, setAdminApprovalRequired] = useState(!isAdmin)
  const [adminPassword, setAdminPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const requiredText = project ? `DELETE ${project.code}` : ''
  const isConfirmed = confirmationText === requiredText

  const handleDelete = async () => {
    if (!project || !supabase) {
      setError('Project or Supabase client is missing')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // If admin approval is required, verify admin credentials
      if (adminApprovalRequired && adminPassword) {
        // Get current user from auth session
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (!authUser) {
          setError('You must be logged in to delete projects.')
          setLoading(false)
          return
        }

        // Check if user is admin in admin_users table
        let isUserAdmin = false
        try {
          const { data: adminUser } = await supabase
            .from('admin_users')
            .select('id, role, email')
            .eq('email', authUser.email)
            .in('role', ['admin', 'owner'])
            .single()

          isUserAdmin = !!adminUser
        } catch (err) {
          // admin_users table might not exist, that's okay
          console.warn('Could not check admin_users table:', err)
        }

        if (!isUserAdmin) {
          // User is not admin, verify admin password
          // Try to find an admin user and verify password
          try {
            const { data: adminUsers } = await supabase
              .from('admin_users')
              .select('email')
              .in('role', ['admin', 'owner'])
              .limit(1)

            if (adminUsers && adminUsers.length > 0) {
              // Try to sign in as admin to verify password
              const { error: signInError } = await supabase.auth.signInWithPassword({
                email: adminUsers[0].email,
                password: adminPassword
              })

              if (signInError) {
                setError('Invalid admin password. Only administrators can approve project deletion.')
                setLoading(false)
                return
              }
            } else {
              // No admin users in table, check against stored admin password (for development)
              const storedAdminPassword = typeof window !== 'undefined' 
                ? window.localStorage.getItem('admin.password')
                : null
              
              if (!storedAdminPassword || adminPassword !== storedAdminPassword) {
                setError('Invalid admin password. Only administrators can approve project deletion.')
                setLoading(false)
                return
              }
            }
          } catch (err) {
            setError('Could not verify admin credentials. Please contact an administrator.')
            setLoading(false)
            return
          }
        } else {
          // User is admin, verify their own password
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: authUser.email!,
            password: adminPassword
          })

          if (signInError) {
            setError('Invalid password. Please enter your admin password.')
            setLoading(false)
            return
          }
        }
      }

      // Delete the project
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id)

      if (deleteError) {
        throw new Error(deleteError.message)
      }

      // Also delete related tasks
      await supabase
        .from('tasks')
        .delete()
        .eq('project_id', project.id)

      // Reset form
      setConfirmationText('')
      setAdminPassword('')
      setError(null)
      
      onDeleted()
    } catch (err: any) {
      setError(err.message || 'Failed to delete project')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setConfirmationText('')
    setAdminPassword('')
    setError(null)
    setAdminApprovalRequired(!isAdmin)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Project
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the project and all associated tasks.
          </DialogDescription>
        </DialogHeader>

        {project && (
          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You are about to delete <strong>{project.name}</strong> ({project.code}).
                All tasks and data associated with this project will be permanently removed.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="confirmation">
                Type <strong>{requiredText}</strong> to confirm:
              </Label>
              <Input
                id="confirmation"
                placeholder={requiredText}
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                disabled={loading}
              />
            </div>

            {adminApprovalRequired && (
              <div className="space-y-2 border-t pt-4">
                <div className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
                  <Shield className="h-4 w-4" />
                  Admin Approval Required
                </div>
                <p className="text-sm text-muted-foreground">
                  Project deletion requires administrator approval. Please enter an admin password to proceed.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="adminPassword">Admin Password</Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    placeholder="Enter admin password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading || !isConfirmed || (adminApprovalRequired && !adminPassword)}
          >
            {loading ? 'Deleting...' : 'Delete Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
