// Cross-Module Search Component
// Provides unified search across CRM, Mail, Projects, Accounting, and Drive

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  Search, 
  Filter, 
  X, 
  Mail, 
  Users, 
  Building2, 
  Target, 
  CheckSquare, 
  FileText, 
  BarChart3, 
  Folder,
  Clock,
  Star,
  Tag,
  ArrowRight,
  ExternalLink,
  Download,
  Eye,
  MoreVertical,
  Calendar,
  Phone,
  MapPin,
  Globe,
  MessageSquare,
  Activity,
  TrendingUp,
  FileImage,
  FileSpreadsheet,
  FilePdf
} from 'lucide-react'
import { integrationService } from '@/lib/integration-service'
import { CrossModuleData } from '@/lib/integration-service'

interface SearchResult {
  id: string
  type: 'contact' | 'company' | 'deal' | 'email' | 'task' | 'project' | 'invoice' | 'file' | 'activity'
  title: string
  description: string
  module: 'crm' | 'mail' | 'projects' | 'accounting' | 'drive'
  score: number
  data: any
  highlights: string[]
  relatedEntities: RelatedEntity[]
  lastModified: Date
  url: string
}

interface RelatedEntity {
  id: string
  type: string
  title: string
  module: string
}

interface SearchFilters {
  modules: string[]
  types: string[]
  dateRange: {
    start: Date | null
    end: Date | null
  }
  tags: string[]
  status: string[]
}

interface CrossModuleSearchProps {
  onResultClick?: (result: SearchResult) => void
  onClose?: () => void
  className?: string
}

const CrossModuleSearch: React.FC<CrossModuleSearchProps> = ({
  onResultClick,
  onClose,
  className = ''
}) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedTab, setSelectedTab] = useState('all')
  const [filters, setFilters] = useState<SearchFilters>({
    modules: [],
    types: [],
    dateRange: { start: null, end: null },
    tags: [],
    status: []
  })
  const [showFilters, setShowFilters] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchHistory, setSearchHistory] = useState<SearchResult[]>([])

  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Focus search input on mount
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }

    // Load recent searches from localStorage
    const saved = localStorage.getItem('sebenza-recent-searches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }

    // Load search history
    const history = localStorage.getItem('sebenza-search-history')
    if (history) {
      setSearchHistory(JSON.parse(history))
    }
  }, [])

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (query.trim().length > 0) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(query)
      }, 300)
    } else {
      setResults([])
      setSuggestions([])
      setShowSuggestions(false)
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query])

  const performSearch = async (searchQuery: string) => {
    if (searchQuery.trim().length === 0) return

    setIsSearching(true)
    setShowSuggestions(false)

    try {
      const searchResults = await integrationService.searchAcrossModules(searchQuery)
      const formattedResults = formatSearchResults(searchResults)
      
      setResults(formattedResults)
      
      // Update recent searches
      updateRecentSearches(searchQuery)
      
      // Generate suggestions based on results
      generateSuggestions(formattedResults)
      
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const formatSearchResults = (data: any): SearchResult[] => {
    const results: SearchResult[] = []

    // Format contacts
    data.contacts?.forEach((contact: any) => {
      results.push({
        id: contact.id,
        type: 'contact',
        title: `${contact.firstName} ${contact.lastName}`,
        description: contact.email || contact.phone || 'No contact info',
        module: 'crm',
        score: calculateScore(contact, query),
        data: contact,
        highlights: generateHighlights(contact, query),
        relatedEntities: getRelatedEntities(contact),
        lastModified: new Date(contact.updatedAt || contact.createdAt),
        url: `/crm/contacts/${contact.id}`
      })
    })

    // Format companies
    data.companies?.forEach((company: any) => {
      results.push({
        id: company.id,
        type: 'company',
        title: company.name,
        description: company.industry || company.website || 'No description',
        module: 'crm',
        score: calculateScore(company, query),
        data: company,
        highlights: generateHighlights(company, query),
        relatedEntities: getRelatedEntities(company),
        lastModified: new Date(company.updatedAt || company.createdAt),
        url: `/crm/companies/${company.id}`
      })
    })

    // Format deals
    data.deals?.forEach((deal: any) => {
      results.push({
        id: deal.id,
        type: 'deal',
        title: deal.name,
        description: deal.description || `Value: R${deal.value?.toLocaleString()}`,
        module: 'crm',
        score: calculateScore(deal, query),
        data: deal,
        highlights: generateHighlights(deal, query),
        relatedEntities: getRelatedEntities(deal),
        lastModified: new Date(deal.updatedAt || deal.createdAt),
        url: `/crm/deals/${deal.id}`
      })
    })

    // Format emails
    data.emails?.forEach((email: any) => {
      results.push({
        id: email.id,
        type: 'email',
        title: email.subject || 'No subject',
        description: email.from?.name || email.from?.email || 'Unknown sender',
        module: 'mail',
        score: calculateScore(email, query),
        data: email,
        highlights: generateHighlights(email, query),
        relatedEntities: getRelatedEntities(email),
        lastModified: new Date(email.date),
        url: `/mail/thread/${email.threadId}`
      })
    })

    // Format activities
    data.activities?.forEach((activity: any) => {
      results.push({
        id: activity.id,
        type: 'activity',
        title: activity.title,
        description: activity.description || activity.type,
        module: 'crm',
        score: calculateScore(activity, query),
        data: activity,
        highlights: generateHighlights(activity, query),
        relatedEntities: getRelatedEntities(activity),
        lastModified: new Date(activity.date),
        url: `/crm/activities/${activity.id}`
      })
    })

    // Sort by score and relevance
    return results.sort((a, b) => b.score - a.score)
  }

  const calculateScore = (item: any, query: string): number => {
    const queryLower = query.toLowerCase()
    let score = 0

    // Title match (highest priority)
    if (item.title?.toLowerCase().includes(queryLower)) score += 100
    if (item.name?.toLowerCase().includes(queryLower)) score += 100
    if (item.subject?.toLowerCase().includes(queryLower)) score += 100

    // Description match
    if (item.description?.toLowerCase().includes(queryLower)) score += 50
    if (item.email?.toLowerCase().includes(queryLower)) score += 50
    if (item.body?.toLowerCase().includes(queryLower)) score += 50

    // Partial matches
    const words = queryLower.split(' ')
    words.forEach(word => {
      if (item.title?.toLowerCase().includes(word)) score += 20
      if (item.description?.toLowerCase().includes(word)) score += 10
    })

    return score
  }

  const generateHighlights = (item: any, query: string): string[] => {
    const highlights: string[] = []
    const queryLower = query.toLowerCase()

    // Find matching fields
    const fields = ['title', 'name', 'subject', 'description', 'email', 'body']
    fields.forEach(field => {
      if (item[field] && item[field].toLowerCase().includes(queryLower)) {
        highlights.push(field)
      }
    })

    return highlights
  }

  const getRelatedEntities = (item: any): RelatedEntity[] => {
    const related: RelatedEntity[] = []

    if (item.contactId) {
      related.push({
        id: item.contactId,
        type: 'contact',
        title: 'Related Contact',
        module: 'crm'
      })
    }

    if (item.dealId) {
      related.push({
        id: item.dealId,
        type: 'deal',
        title: 'Related Deal',
        module: 'crm'
      })
    }

    if (item.companyId) {
      related.push({
        id: item.companyId,
        type: 'company',
        title: 'Related Company',
        module: 'crm'
      })
    }

    return related
  }

  const updateRecentSearches = (searchQuery: string) => {
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 10)
    setRecentSearches(updated)
    localStorage.setItem('sebenza-recent-searches', JSON.stringify(updated))
  }

  const generateSuggestions = (results: SearchResult[]) => {
    const suggestions: string[] = []
    
    // Extract common terms from results
    results.forEach(result => {
      if (result.data.tags) {
        suggestions.push(...result.data.tags)
      }
      if (result.data.industry) {
        suggestions.push(result.data.industry)
      }
    })

    setSuggestions([...new Set(suggestions)].slice(0, 5))
  }

  const handleResultClick = (result: SearchResult) => {
    // Add to search history
    const updatedHistory = [result, ...searchHistory.filter(r => r.id !== result.id)].slice(0, 50)
    setSearchHistory(updatedHistory)
    localStorage.setItem('sebenza-search-history', JSON.stringify(updatedHistory))

    onResultClick?.(result)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setShowSuggestions(false)
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setSuggestions([])
    setShowSuggestions(false)
  }

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'crm': return <Users className="h-4 w-4" />
      case 'mail': return <Mail className="h-4 w-4" />
      case 'projects': return <CheckSquare className="h-4 w-4" />
      case 'accounting': return <BarChart3 className="h-4 w-4" />
      case 'drive': return <Folder className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'contact': return <Users className="h-4 w-4" />
      case 'company': return <Building2 className="h-4 w-4" />
      case 'deal': return <Target className="h-4 w-4" />
      case 'email': return <Mail className="h-4 w-4" />
      case 'task': return <CheckSquare className="h-4 w-4" />
      case 'project': return <FileText className="h-4 w-4" />
      case 'invoice': return <BarChart3 className="h-4 w-4" />
      case 'file': return <FileImage className="h-4 w-4" />
      case 'activity': return <Activity className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const filteredResults = results.filter(result => {
    if (selectedTab === 'all') return true
    return result.module === selectedTab
  })

  return (
    <div className={`cross-module-search ${className}`}>
      {/* Search Input */}
      <div className="relative mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Search across all modules..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            className="pl-10 pr-20"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-6 w-6 p-0"
            >
              <Filter className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <Card className="absolute top-full left-0 right-0 mt-1 z-50">
            <CardContent className="p-2">
              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground mb-2">Suggestions</div>
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full justify-start h-8"
                  >
                    <Search className="h-3 w-3 mr-2" />
                    {suggestion}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Modules</label>
                <div className="flex flex-wrap gap-2">
                  {['crm', 'mail', 'projects', 'accounting', 'drive'].map(module => (
                    <Button
                      key={module}
                      variant={filters.modules.includes(module) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setFilters(prev => ({
                          ...prev,
                          modules: prev.modules.includes(module)
                            ? prev.modules.filter(m => m !== module)
                            : [...prev.modules, module]
                        }))
                      }}
                    >
                      {getModuleIcon(module)}
                      <span className="ml-1 capitalize">{module}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Types</label>
                <div className="flex flex-wrap gap-2">
                  {['contact', 'company', 'deal', 'email', 'task', 'project', 'invoice', 'file', 'activity'].map(type => (
                    <Button
                      key={type}
                      variant={filters.types.includes(type) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setFilters(prev => ({
                          ...prev,
                          types: prev.types.includes(type)
                            ? prev.types.filter(t => t !== type)
                            : [...prev.types, type]
                        }))
                      }}
                    >
                      {getTypeIcon(type)}
                      <span className="ml-1 capitalize">{type}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <div className="space-y-4">
        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="crm">CRM</TabsTrigger>
            <TabsTrigger value="mail">Mail</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="accounting">Accounting</TabsTrigger>
            <TabsTrigger value="drive">Drive</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="mt-4">
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm text-muted-foreground">Searching...</span>
                </div>
              </div>
            ) : filteredResults.length > 0 ? (
              <div className="space-y-2">
                {filteredResults.map((result) => (
                  <Card 
                    key={result.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleResultClick(result)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(result.type)}
                            {getModuleIcon(result.module)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{result.title}</h4>
                            <p className="text-sm text-muted-foreground truncate">
                              {result.description}
                            </p>
                            
                            {result.highlights.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {result.highlights.map((highlight, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {highlight}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            {result.relatedEntities.length > 0 && (
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-muted-foreground">Related:</span>
                                {result.relatedEntities.map((entity, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {entity.title}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <span className="text-xs text-muted-foreground">
                            {result.lastModified.toLocaleDateString()}
                          </span>
                          <Button variant="ghost" size="sm">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : query ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No results found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search terms or filters
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Search across all modules</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Find contacts, emails, deals, tasks, invoices, and files
                </p>
                
                {recentSearches.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Recent searches</h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {recentSearches.map((search, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setQuery(search)}
                        >
                          {search}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default CrossModuleSearch



