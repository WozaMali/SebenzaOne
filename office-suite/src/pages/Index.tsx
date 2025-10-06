"use client"

import { useState, useEffect } from "react"
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
  const [currentDate, setCurrentDate] = useState<string>('')

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }))
  }, [])

  return (
    <div className="dashboard-page-container h-full pr-6">
      <div className="dashboard-sidebar enterprise-card card-3d p-4 flex-shrink-0" style={{width: '256px', minWidth: '256px', maxWidth: '256px'}}>
        {/* Dashboard Sidebar Content */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">Quick Access</h3>
          <div className="space-y-1">
            <div className="p-2 rounded hover:bg-muted cursor-pointer">Overview</div>
            <div className="p-2 rounded hover:bg-muted cursor-pointer">Analytics</div>
            <div className="p-2 rounded hover:bg-muted cursor-pointer">Reports</div>
            <div className="p-2 rounded hover:bg-muted cursor-pointer">Settings</div>
          </div>
        </div>
      </div>
      
      <div className="dashboard-middle enterprise-card card-3d flex flex-col flex-shrink-0" style={{width: '400px', minWidth: '400px', maxWidth: '400px'}}>
        {/* Dashboard Middle Content */}
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Quick Stats</h2>
        </div>
        <div className="flex-1 p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {quickStats.map((stat, index) => (
                <div key={stat.label} className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{stat.label}</h3>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="dashboard-right flex flex-col overflow-hidden" style={{flex: '1 1 0', minWidth: '300px'}}>
        <div className="space-y-6">
          {/* Welcome Header */}
          <div className="enterprise-card p-8 w-full">
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
            <p className="text-sm text-muted-foreground">Today&apos;s Date</p>
            <p className="text-lg font-medium">{currentDate || 'Loading...'}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={stat.label} className="stats-card group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color} group-hover:scale-110 transition-transform duration-200`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold gradient-text">{stat.value}</div>
              <div className="h-1 w-full bg-muted rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-primary transition-all duration-1000"
                  style={{ width: `${60 + index * 10}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="glass-card">
          <CardHeader className="bg-gradient-secondary">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="gradient-text">Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Latest updates from across your workspace
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gradient-primary rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                    <Badge variant="outline" className="text-xs bg-gradient-secondary">
                      {activity.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="glass-card">
          <CardHeader className="bg-gradient-secondary">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span className="gradient-text">Quick Actions</span>
            </CardTitle>
            <CardDescription>
              Jump into your most used features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-20 flex flex-col gap-2 hover:bg-gradient-secondary hover:shadow-glow transition-all duration-300 group">
                <Mail className="h-6 w-6 group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium">Compose Email</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2 hover:bg-gradient-secondary hover:shadow-glow transition-all duration-300 group">
                <BarChart3 className="h-6 w-6 group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium">New Project</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2 hover:bg-gradient-secondary hover:shadow-glow transition-all duration-300 group">
                <Calendar className="h-6 w-6 group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium">Schedule Meeting</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2 hover:bg-gradient-secondary hover:shadow-glow transition-all duration-300 group">
                <Users className="h-6 w-6 group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium">Add Contact</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Overview */}
      <Card className="glass-card w-full">
        <CardHeader className="bg-gradient-secondary">
          <CardTitle className="gradient-text">Module Overview</CardTitle>
          <CardDescription>
            Explore all available modules in your Sebenza One workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group p-6 rounded-xl border-2 border-border bg-gradient-card hover:border-primary/30 hover:shadow-glow transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-lg">Communication</h4>
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Mail className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Email, Connect, Calendar</p>
              <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400">3 modules</Badge>
            </div>
            <div className="group p-6 rounded-xl border-2 border-border bg-gradient-card hover:border-primary/30 hover:shadow-glow transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-lg">Productivity</h4>
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Projects, Drive, Notes, Planner</p>
              <Badge className="bg-green-500/10 text-green-600 dark:text-green-400">4 modules</Badge>
            </div>
            <div className="group p-6 rounded-xl border-2 border-border bg-gradient-card hover:border-primary/30 hover:shadow-glow transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-lg">Business</h4>
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">CRM, Accounting</p>
              <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400">2 modules</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  )
};

export default Index;
