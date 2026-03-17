'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  Building2, 
  Factory, 
  Building,
  Search,
  Download,
  PieChart
} from 'lucide-react'
import { recyclingService } from '@/lib/recycling-service'
import { RecyclingCustomer, CustomerType } from '@/types/recycling'

export function CustomersSegmentationPage() {
  const [selectedType, setSelectedType] = useState<CustomerType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [customers, setCustomers] = useState<RecyclingCustomer[]>([])

  useEffect(() => {
    const loaded = recyclingService.getCustomers()
    setCustomers(loaded)
  }, [])

  const filteredCustomers = useMemo(() => {
    let filtered = customers

    if (selectedType !== 'all') {
      filtered = filtered.filter(c => c.customerType === selectedType)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(c =>
        c.businessName?.toLowerCase().includes(query) ||
        c.firstName?.toLowerCase().includes(query) ||
        c.lastName?.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [customers, selectedType, searchQuery])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = customers.length
    const residential = customers.filter(c => c.customerType === 'residential').length
    const commercial = customers.filter(c => c.customerType === 'commercial').length
    const industrial = customers.filter(c => c.customerType === 'industrial').length
    const municipality = customers.filter(c => c.customerType === 'municipality').length

    return {
      total,
      residential,
      commercial,
      industrial,
      municipality,
      residentialPercent: total > 0 ? (residential / total) * 100 : 0,
      commercialPercent: total > 0 ? (commercial / total) * 100 : 0,
      industrialPercent: total > 0 ? (industrial / total) * 100 : 0,
      municipalityPercent: total > 0 ? (municipality / total) * 100 : 0
    }
  }, [customers])

  const getCustomerTypeIcon = (type: CustomerType) => {
    switch (type) {
      case 'residential': return <Home className="h-5 w-5" />
      case 'commercial': return <Building2 className="h-5 w-5" />
      case 'industrial': return <Factory className="h-5 w-5" />
      case 'municipality': return <Building className="h-5 w-5" />
      default: return <Home className="h-5 w-5" />
    }
  }

  const getCustomerTypeLabel = (type: CustomerType) => {
    switch (type) {
      case 'residential': return 'Residential'
      case 'commercial': return 'Commercial'
      case 'industrial': return 'Industrial'
      case 'municipality': return 'Municipality'
      default: return type
    }
  }

  const getCustomerTypeColor = (type: CustomerType) => {
    switch (type) {
      case 'residential': return 'bg-blue-100 text-blue-800'
      case 'commercial': return 'bg-green-100 text-green-800'
      case 'industrial': return 'bg-orange-100 text-orange-800'
      case 'municipality': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customer Segmentation</h1>
          <p className="text-muted-foreground mt-1">
            View and manage customers by type
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={selectedType === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedType('all')}
            >
              All ({stats.total})
            </Button>
            <Button
              variant={selectedType === 'residential' ? 'default' : 'outline'}
              onClick={() => setSelectedType('residential')}
            >
              <Home className="h-4 w-4 mr-2" />
              Residential ({stats.residential})
            </Button>
            <Button
              variant={selectedType === 'commercial' ? 'default' : 'outline'}
              onClick={() => setSelectedType('commercial')}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Commercial ({stats.commercial})
            </Button>
            <Button
              variant={selectedType === 'industrial' ? 'default' : 'outline'}
              onClick={() => setSelectedType('industrial')}
            >
              <Factory className="h-4 w-4 mr-2" />
              Industrial ({stats.industrial})
            </Button>
            <Button
              variant={selectedType === 'municipality' ? 'default' : 'outline'}
              onClick={() => setSelectedType('municipality')}
            >
              <Building className="h-4 w-4 mr-2" />
              Municipality ({stats.municipality})
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Customers ({filteredCustomers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredCustomers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No customers found
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredCustomers.map((customer) => (
                    <Card key={customer.id} className="hover:bg-muted/50 transition-colors">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getCustomerTypeIcon(customer.customerType)}
                            <div>
                              <p className="font-medium">
                                {customer.businessName || 
                                 `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 
                                 'Unnamed Customer'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {customer.email}
                              </p>
                            </div>
                          </div>
                          <Badge className={getCustomerTypeColor(customer.customerType)}>
                            {getCustomerTypeLabel(customer.customerType)}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Analytics Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Customer Distribution
            </CardTitle>
            <CardDescription>Percentage of customers by type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Residential
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {stats.residentialPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${stats.residentialPercent}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Commercial
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {stats.commercialPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${stats.commercialPercent}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Factory className="h-4 w-4" />
                    Industrial
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {stats.industrialPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 transition-all"
                    style={{ width: `${stats.industrialPercent}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Municipality
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {stats.municipalityPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 transition-all"
                    style={{ width: `${stats.municipalityPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
