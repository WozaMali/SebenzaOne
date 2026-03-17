'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Filter, X, Save } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { crmService } from '@/lib/crm-service'
import { CRMSearchQuery, CRMSearchResult } from '@/types/crm'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function AdvancedSearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [entityType, setEntityType] = useState<'all' | 'contacts' | 'companies' | 'deals' | 'activities'>('all')
  const [savedFilters, setSavedFilters] = useState<any[]>([])
  const [searchResults, setSearchResults] = useState<CRMSearchResult | null>(null)

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults(null)
      return
    }

    const query: CRMSearchQuery = {
      query: searchQuery,
      entity: entityType,
      filters: [],
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 50
    }

    const results = crmService.search(query)
    setSearchResults(results)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Search</h1>
          <p className="text-muted-foreground mt-1">
            Search across all CRM data with powerful filters
          </p>
        </div>
        <Button variant="outline">
          <Save className="h-4 w-4 mr-2" />
          Save Search
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
          <CardDescription>Find contacts, companies, deals, and activities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search across all CRM data..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} className="w-full sm:w-auto">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>

          <div className="flex gap-2 flex-wrap">
            <Select value={entityType} onValueChange={(v) => setEntityType(v as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Entity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                <SelectItem value="contacts">Contacts</SelectItem>
                <SelectItem value="companies">Companies</SelectItem>
                <SelectItem value="deals">Deals</SelectItem>
                <SelectItem value="activities">Activities</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Add Filter
            </Button>
          </div>

          {savedFilters.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Saved Searches</p>
              <div className="flex gap-2 flex-wrap">
                {savedFilters.map((filter) => (
                  <Badge key={filter.id} variant="secondary" className="cursor-pointer">
                    {filter.name}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Tabs defaultValue="all" className="mt-4">
            <TabsList>
              <TabsTrigger value="all">All Results</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
              <TabsTrigger value="companies">Companies</TabsTrigger>
              <TabsTrigger value="deals">Deals</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              {!searchQuery ? (
                <p className="text-muted-foreground text-center py-8">
                  Enter a search query to find results across all entities
                </p>
              ) : searchResults ? (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Found {searchResults.total} results
                  </div>
                  {searchResults.contacts.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Contacts ({searchResults.contacts.length})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Company</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {searchResults.contacts.slice(0, 10).map((contact) => (
                              <TableRow key={contact.id}>
                                <TableCell>{contact.firstName} {contact.lastName}</TableCell>
                                <TableCell>{contact.email}</TableCell>
                                <TableCell>{contact.company?.name || '-'}</TableCell>
                                <TableCell><Badge variant="outline">{contact.status}</Badge></TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}
                  {searchResults.companies.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Companies ({searchResults.companies.length})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Industry</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {searchResults.companies.slice(0, 10).map((company) => (
                              <TableRow key={company.id}>
                                <TableCell>{company.name}</TableCell>
                                <TableCell>{company.industry || '-'}</TableCell>
                                <TableCell><Badge variant="outline">{company.status}</Badge></TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}
                  {searchResults.deals.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Deals ({searchResults.deals.length})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Value</TableHead>
                              <TableHead>Stage</TableHead>
                              <TableHead>Probability</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {searchResults.deals.slice(0, 10).map((deal) => (
                              <TableRow key={deal.id}>
                                <TableCell>{deal.name}</TableCell>
                                <TableCell>R {deal.value.toLocaleString()}</TableCell>
                                <TableCell><Badge>{deal.stage}</Badge></TableCell>
                                <TableCell>{deal.probability}%</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}
                  {searchResults.total === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No results found for &quot;{searchQuery}&quot;</p>
                    </div>
                  )}
                </div>
              ) : null}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
