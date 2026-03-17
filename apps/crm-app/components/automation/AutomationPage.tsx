'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Zap, Play, Pause, Trash2, Edit } from 'lucide-react'

export function AutomationPage() {
  const [workflows, setWorkflows] = useState<any[]>([])

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automation & Workflows</h1>
          <p className="text-muted-foreground mt-1">
            Automate repetitive tasks and streamline your sales process
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="lead-scoring">Lead Scoring</TabsTrigger>
          <TabsTrigger value="email-sequences">Email Sequences</TabsTrigger>
          <TabsTrigger value="task-automation">Task Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Workflows</CardTitle>
              <CardDescription>Automated workflows that are currently running</CardDescription>
            </CardHeader>
            <CardContent>
              {workflows.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No workflows created yet</p>
                  <Button className="mt-4" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Workflow
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {workflows.map((workflow) => (
                    <div key={workflow.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{workflow.name}</h3>
                        <p className="text-sm text-muted-foreground">{workflow.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>{workflow.status}</Badge>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lead-scoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lead Scoring Rules</CardTitle>
              <CardDescription>Automatically score leads based on behavior and attributes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Lead scoring configuration will be available here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email-sequences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Sequences</CardTitle>
              <CardDescription>Automated email campaigns and follow-ups</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Email sequence builder will be available here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="task-automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Automation</CardTitle>
              <CardDescription>Automatically create tasks based on triggers</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Task automation rules will be available here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
