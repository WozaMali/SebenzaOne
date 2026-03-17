'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CollaborationFeedProps {
  projectId?: string
  userId?: string
}

export function CollaborationFeed({ projectId, userId }: CollaborationFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Collaboration Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Collaboration feed functionality will be implemented here. This requires API routes at /api/collaboration/feed and /api/collaboration/comments.
        </p>
      </CardContent>
    </Card>
  )
}
