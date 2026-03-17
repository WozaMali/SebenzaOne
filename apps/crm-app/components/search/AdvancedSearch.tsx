'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, X } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { crmService } from '@/lib/crm-service'

export function AdvancedSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any>(null)
  const [filters, setFilters] = useState({
    entity: 'all' as 'all' | 'contacts' | 'companies' | 'deals' | 'activities'
  })

  const handleSearch = () => {
    if (!query.trim()) return
    
    const searchResults = crmService.search({
      query: query,
      entity: filters.entity,
      filters: [],
      sortBy: 'relevance',
      sortOrder: 'desc',
      page: 1,
      limit: 50
    })
    
    setResults(searchResults)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Advanced Search</h1>
        <p className="text-muted-foreground mt-1">Search across all CRM data with powerful filters</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts, companies, deals, activities..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Select value={filters.entity} onValueChange={(value: any) => setFilters({ ...filters, entity: value })}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="contacts">Contacts</SelectItem>
                <SelectItem value="companies">Companies</SelectItem>
                <SelectItem value="deals">Deals</SelectItem>
                <SelectItem value="activities">Activities</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {results && (
            <Tabs defaultValue="all" className="mt-6">
              <TabsList>
                <TabsTrigger value="all">All Results ({results.total})</TabsTrigger>
                <TabsTrigger value="contacts">Contacts ({results.contacts.length})</TabsTrigger>
                <TabsTrigger value="companies">Companies ({results.companies.length})</TabsTrigger>
                <TabsTrigger value="deals">Deals ({results.deals.length})</TabsTrigger>
                <TabsTrigger value="activities">Activities ({results.activities.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4 mt-4">
                {results.contacts.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Contacts</h3>
                    <div className="space-y-2">
                      {results.contacts.map((contact: any) => (
                        <div key={contact.id} className="border rounded-lg p-3">
                          <p className="font-medium">{contact.firstName} {contact.lastName}</p>
                          <p className="text-sm text-muted-foreground">{contact.email}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {results.companies.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Companies</h3>
                    <div className="space-y-2">
                      {results.companies.map((company: any) => (
                        <div key={company.id} className="border rounded-lg p-3">
                          <p className="font-medium">{company.name}</p>
                          <p className="text-sm text-muted-foreground">{company.industry}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {results.deals.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Deals</h3>
                    <div className="space-y-2">
                      {results.deals.map((deal: any) => (
                        <div key={deal.id} className="border rounded-lg p-3">
                          <p className="font-medium">{deal.name}</p>
                          <p className="text-sm text-muted-foreground">R{deal.value.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
