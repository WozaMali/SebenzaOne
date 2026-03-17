'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, TrendingUp, Target, DollarSign, Users, Building2 } from 'lucide-react'
import { crmService } from '@/lib/crm-service'

export function AnalyticsDashboard() {
  const analytics = crmService.getAnalytics()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics & Reports</h1>
        <p className="text-muted-foreground mt-1">Comprehensive insights into your CRM performance</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R{analytics.deals.totalValue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.deals.won} deals won
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.deals.winRate}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.deals.won} won / {analytics.deals.lost} lost
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.contacts.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.contacts.active} active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R{analytics.pipeline.totalValue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Weighted: R{analytics.pipeline.weightedValue.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deals">
          <Card>
            <CardHeader>
              <CardTitle>Deal Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Deal analytics and trends will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <CardTitle>Contact Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Contact analytics and trends will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies">
          <Card>
            <CardHeader>
              <CardTitle>Company Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Company analytics and trends will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Activity Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Activity analytics and trends will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Pipeline analytics and forecasting will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Team performance metrics will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
