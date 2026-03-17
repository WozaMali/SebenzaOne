'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MessageSquare, Users, Bell, AtSign } from 'lucide-react'
import { crmService } from '@/lib/crm-service'
import { Activity } from '@/types/crm'
import { format } from 'date-fns'

export function CollaborationPage() {
  const [feed, setFeed] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [comment, setComment] = useState('')

  useEffect(() => {
    loadFeed()
  }, [])

  const loadFeed = () => {
    setIsLoading(true)
    try {
      const allActivities = crmService.getActivities()
      // Get recent activities for feed
      const recent = allActivities
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 20)
      setFeed(recent)
    } catch (error) {
      console.error('Error loading feed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePostComment = () => {
    if (!comment.trim()) return
    // TODO: Implement comment posting
    setComment('')
    loadFeed()
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Collaboration</h1>
          <p className="text-muted-foreground mt-1">
            Team collaboration, comments, and activity feeds
          </p>
        </div>
      </div>

      <Tabs defaultValue="feed" className="space-y-4">
        <TabsList>
          <TabsTrigger value="feed">Activity Feed</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Feed</CardTitle>
              <CardDescription>Recent activities across your CRM</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading feed...</p>
                </div>
              ) : feed.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No activities yet</p>
                  <p className="text-sm mt-2">Activities will appear here as you interact with contacts, companies, and deals</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feed.map((activity) => (
                    <div key={activity.id} className="flex gap-3 p-3 border rounded-lg hover:bg-muted/50">
                      <Avatar>
                        <AvatarFallback>
                          {activity.user?.firstName?.[0] || activity.user?.email?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">
                            {activity.user?.firstName} {activity.user?.lastName}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(activity.createdAt), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm">{activity.title}</p>
                        {activity.description && (
                          <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                        )}
                        {activity.contact && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Related to: {activity.contact.firstName} {activity.contact.lastName}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
              <CardDescription>Add comments to deals, contacts, and companies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea 
                  placeholder="Add a comment..." 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />
                <Button onClick={handlePostComment} disabled={!comment.trim()}>
                  Post Comment
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage your team and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Team management will be available here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Notification settings will be available here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
