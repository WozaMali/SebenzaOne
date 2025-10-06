'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  HelpCircle, 
  BookOpen, 
  Video, 
  ExternalLink, 
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface HelpItem {
  id: string
  title: string
  description: string
  type: 'guide' | 'video' | 'article' | 'tip'
  url?: string
  duration?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}

interface InfoRailProps {
  title?: string
  description?: string
  helpItems?: HelpItem[]
  tips?: string[]
  className?: string
}

const defaultHelpItems: HelpItem[] = [
  {
    id: '1',
    title: 'Domain Setup Guide',
    description: 'Complete walkthrough for adding and verifying your first domain',
    type: 'guide',
    url: '/help/domain-setup',
    duration: '5 min',
    difficulty: 'beginner'
  },
  {
    id: '2',
    title: 'DNS Configuration',
    description: 'How to configure MX, SPF, DKIM, and DMARC records',
    type: 'video',
    url: '/help/dns-config',
    duration: '8 min',
    difficulty: 'intermediate'
  },
  {
    id: '3',
    title: 'Migration Best Practices',
    description: 'Tips for successful email migrations with minimal downtime',
    type: 'article',
    url: '/help/migration-tips',
    duration: '12 min',
    difficulty: 'advanced'
  },
  {
    id: '4',
    title: 'Security Policies',
    description: 'Setting up effective spam and DLP policies',
    type: 'guide',
    url: '/help/security-policies',
    duration: '6 min',
    difficulty: 'intermediate'
  }
]

const defaultTips = [
  'Always test DNS changes in a staging environment first',
  'Enable DMARC monitoring before enforcing strict policies',
  'Use migration dry-runs to identify potential issues',
  'Set up monitoring alerts for critical email infrastructure',
  'Regularly review and update security policies'
]

export function InfoRail({ 
  title = "Help & Resources",
  description = "Get the most out of your Sebenza Mail admin console",
  helpItems = defaultHelpItems,
  tips = defaultTips,
  className 
}: InfoRailProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return Video
      case 'article':
        return BookOpen
      case 'guide':
        return HelpCircle
      default:
        return Info
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'article':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'guide':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-emerald-500/10 text-emerald-400'
      case 'intermediate':
        return 'bg-yellow-500/10 text-yellow-400'
      case 'advanced':
        return 'bg-red-500/10 text-red-400'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className={cn("w-80 bg-surface border-l border-border/50 h-full overflow-y-auto", className)}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>

        {/* Quick Tips */}
        <Card className="bg-muted/30 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              Quick Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-2 text-xs">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 flex-shrink-0" />
                <span className="text-muted-foreground">{tip}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Help Resources */}
        <Card className="bg-muted/30 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-400" />
              Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {helpItems.map((item) => {
              const Icon = getTypeIcon(item.type)
              const isExpanded = expandedSection === item.id
              
              return (
                <div key={item.id} className="space-y-2">
                  <div
                    className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2"
                    onClick={() => setExpandedSection(isExpanded ? null : item.id)}
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="secondary" 
                          className={cn("text-xs", getTypeColor(item.type))}
                        >
                          {item.type}
                        </Badge>
                        {item.duration && (
                          <span className="text-xs text-muted-foreground">
                            {item.duration}
                          </span>
                        )}
                        {item.difficulty && (
                          <Badge 
                            variant="secondary" 
                            className={cn("text-xs", getDifficultyColor(item.difficulty))}
                          >
                            {item.difficulty}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ChevronRight 
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
                        isExpanded && "rotate-90"
                      )}
                    />
                  </div>
                  
                  {isExpanded && (
                    <div className="pl-6 space-y-2">
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                      {item.url && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(item.url, '_blank')
                          }}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Open
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="bg-muted/30 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <HelpCircle className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <BookOpen className="h-4 w-4 mr-2" />
              Documentation
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
