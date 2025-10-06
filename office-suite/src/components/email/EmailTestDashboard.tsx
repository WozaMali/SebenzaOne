'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, XCircle, Clock, AlertTriangle, Mail, Globe, Shield, Lock } from 'lucide-react'
import { EmailTestingService, DNSValidationResult, EmailDeliveryTest } from '@/lib/email-testing'

interface EmailTestDashboardProps {
  domain: string
  onClose?: () => void
}

export function EmailTestDashboard({ domain, onClose }: EmailTestDashboardProps) {
  const [testEmail, setTestEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [dnsResults, setDnsResults] = useState<DNSValidationResult | null>(null)
  const [deliveryResults, setDeliveryResults] = useState<EmailDeliveryTest | null>(null)
  const [fullTestResults, setFullTestResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const emailTestingService = new EmailTestingService(domain)

  const runDNSTest = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const results = await emailTestingService.validateDNSRecords()
      setDnsResults(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run DNS test')
    } finally {
      setIsLoading(false)
    }
  }

  const runDeliveryTest = async () => {
    if (!testEmail) {
      setError('Please enter a test email address')
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const results = await emailTestingService.testEmailDelivery(testEmail)
      setDeliveryResults(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run delivery test')
    } finally {
      setIsLoading(false)
    }
  }

  const runFullTest = async () => {
    if (!testEmail) {
      setError('Please enter a test email address')
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const results = await emailTestingService.runFullTestSuite(testEmail)
      setFullTestResults(results)
      setDnsResults(results.dns)
      setDeliveryResults(results.delivery)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run full test suite')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    )
  }

  const getStatusBadge = (success: boolean, message: string) => {
    return (
      <Badge variant={success ? "default" : "destructive"} className="ml-2">
        {success ? 'PASS' : 'FAIL'}
      </Badge>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Testing Dashboard</h1>
          <p className="text-muted-foreground">Test email delivery and DNS configuration for {domain}</p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="dns" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dns">DNS Records</TabsTrigger>
          <TabsTrigger value="delivery">Email Delivery</TabsTrigger>
          <TabsTrigger value="full">Full Test Suite</TabsTrigger>
        </TabsList>

        <TabsContent value="dns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                DNS Record Validation
              </CardTitle>
              <CardDescription>
                Verify that your domain has the correct MX, SPF, DKIM, and DMARC records
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={runDNSTest} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Testing DNS Records...
                  </>
                ) : (
                  'Test DNS Records'
                )}
              </Button>

              {dnsResults && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          MX Record
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          {getStatusIcon(dnsResults.mx.success)}
                          {getStatusBadge(dnsResults.mx.success, dnsResults.mx.message)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {dnsResults.mx.message}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          SPF Record
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          {getStatusIcon(dnsResults.spf.success)}
                          {getStatusBadge(dnsResults.spf.success, dnsResults.spf.message)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {dnsResults.spf.message}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          DKIM Records
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          {getStatusIcon(dnsResults.dkim.success)}
                          {getStatusBadge(dnsResults.dkim.success, dnsResults.dkim.message)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {dnsResults.dkim.message}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          DMARC Record
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          {getStatusIcon(dnsResults.dmarc.success)}
                          {getStatusBadge(dnsResults.dmarc.success, dnsResults.dmarc.message)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {dnsResults.dmarc.message}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Overall DNS Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        {getStatusIcon(dnsResults.overall.success)}
                        <div className="flex-1 ml-4">
                          <p className="font-medium">{dnsResults.overall.message}</p>
                          <p className="text-sm text-muted-foreground">
                            Last checked: {new Date(dnsResults.overall.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {getStatusBadge(dnsResults.overall.success, dnsResults.overall.message)}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Delivery Test
              </CardTitle>
              <CardDescription>
                Send a test email to verify that your email configuration is working
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-email">Test Email Address</Label>
                <Input
                  id="test-email"
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>
              
              <Button onClick={runDeliveryTest} disabled={isLoading || !testEmail} className="w-full">
                {isLoading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Sending Test Email...
                  </>
                ) : (
                  'Send Test Email'
                )}
              </Button>

              {deliveryResults && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Send Test</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        {getStatusIcon(deliveryResults.sendTest.success)}
                        {getStatusBadge(deliveryResults.sendTest.success, deliveryResults.sendTest.message)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {deliveryResults.sendTest.message}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Delivery Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        {getStatusIcon(deliveryResults.deliveryStatus.success)}
                        {getStatusBadge(deliveryResults.deliveryStatus.success, deliveryResults.deliveryStatus.message)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {deliveryResults.deliveryStatus.message}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Bounce Check</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        {getStatusIcon(deliveryResults.bounceCheck.success)}
                        {getStatusBadge(deliveryResults.bounceCheck.success, deliveryResults.bounceCheck.message)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {deliveryResults.bounceCheck.message}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Spam Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        {getStatusIcon(deliveryResults.spamScore.success)}
                        {getStatusBadge(deliveryResults.spamScore.success, deliveryResults.spamScore.message)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {deliveryResults.spamScore.message}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="full" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Full Test Suite
              </CardTitle>
              <CardDescription>
                Run all tests to get a comprehensive overview of your email configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full-test-email">Test Email Address</Label>
                <Input
                  id="full-test-email"
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>
              
              <Button onClick={runFullTest} disabled={isLoading || !testEmail} className="w-full">
                {isLoading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Running Full Test Suite...
                  </>
                ) : (
                  'Run Full Test Suite'
                )}
              </Button>

              {fullTestResults && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Test Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Overall Success:</span>
                          {getStatusBadge(fullTestResults.summary.overallSuccess, '')}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Tests Passed:</span>
                          <span>{fullTestResults.summary.passedTests} / {fullTestResults.summary.totalTests}</span>
                        </div>
                        
                        {fullTestResults.summary.recommendations.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Recommendations:</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {fullTestResults.summary.recommendations.map((rec, index) => (
                                <li key={index} className="text-sm text-muted-foreground">
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
