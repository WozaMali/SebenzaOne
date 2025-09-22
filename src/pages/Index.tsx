import { BarChart3, Users, Mail, Calendar, TrendingUp, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const quickStats = [
  { label: "Unread Emails", value: "12", icon: Mail, color: "text-blue-600" },
  { label: "Active Projects", value: "8", icon: BarChart3, color: "text-green-600" },
  { label: "Team Members", value: "24", icon: Users, color: "text-purple-600" },
  { label: "Today's Tasks", value: "6", icon: CheckCircle, color: "text-orange-600" },
]

const recentActivity = [
  { action: "New email from Sarah Johnson", time: "2 minutes ago", type: "email" },
  { action: "Project 'Website Redesign' updated", time: "1 hour ago", type: "project" },
  { action: "Meeting with marketing team", time: "2 hours ago", type: "calendar" },
  { action: "Invoice #INV-2024-001 sent", time: "3 hours ago", type: "accounting" },
  { action: "New file uploaded to Drive", time: "5 hours ago", type: "drive" },
]

const Index = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="enterprise-card p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground mb-2">
              Welcome to Sebenza One
            </h1>
            <p className="text-lg text-muted-foreground">
              Your complete business productivity suite. Everything you need to run your business efficiently.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Today's Date</p>
            <p className="text-lg font-medium">{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat) => (
          <Card key={stat.label} className="enterprise-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="enterprise-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest updates from across your workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="enterprise-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Jump into your most used features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-16 flex flex-col gap-1 hover:bg-primary/5">
                <Mail className="h-5 w-5" />
                <span className="text-xs">Compose Email</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col gap-1 hover:bg-primary/5">
                <BarChart3 className="h-5 w-5" />
                <span className="text-xs">New Project</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col gap-1 hover:bg-primary/5">
                <Calendar className="h-5 w-5" />
                <span className="text-xs">Schedule Meeting</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col gap-1 hover:bg-primary/5">
                <Users className="h-5 w-5" />
                <span className="text-xs">Add Contact</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Overview */}
      <Card className="enterprise-card">
        <CardHeader>
          <CardTitle>Module Overview</CardTitle>
          <CardDescription>
            Explore all available modules in your Sebenza One workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
              <h4 className="font-medium mb-2">Communication</h4>
              <p className="text-sm text-muted-foreground mb-3">Email, Connect, Calendar</p>
              <Badge className="bg-blue-100 text-blue-800">3 modules</Badge>
            </div>
            <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
              <h4 className="font-medium mb-2">Productivity</h4>
              <p className="text-sm text-muted-foreground mb-3">Projects, Drive, Notes, Planner</p>
              <Badge className="bg-green-100 text-green-800">4 modules</Badge>
            </div>
            <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
              <h4 className="font-medium mb-2">Business</h4>
              <p className="text-sm text-muted-foreground mb-3">CRM, Accounting</p>
              <Badge className="bg-orange-100 text-orange-800">2 modules</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
};

export default Index;
