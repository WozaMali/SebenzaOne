'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Clock, AlertTriangle, Play, RotateCcw } from 'lucide-react'
import { EmailTestingService } from '@/lib/email-testing'

interface TestStep {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  message?: string
  details?: any
}

interface EmailTestRunnerProps {
  domain: string
  testEmail: string
  onComplete?: (results: any) => void
}

export function EmailTestRunner({ domain, testEmail, onComplete }: EmailTestRunnerProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<TestStep[]>([
    { id: 'dns-mx', name: 'Check MX Record', status: 'pending' },
    { id: 'dns-spf', name: 'Check SPF Record', status: 'pending' },
    { id: 'dns-dkim', name: 'Check DKIM Records', status: 'pending' },
    { id: 'dns-dmarc', name: 'Check DMARC Record', status: 'pending' },
    { id: 'send-test', name: 'Send Test Email', status: 'pending' },
    { id: 'delivery-check', name: 'Check Delivery Status', status: 'pending' },
    { id: 'bounce-check', name: 'Check Bounce Status', status: 'pending' },
    { id: 'spam-check', name: 'Check Spam Score', status: 'pending' }
  ])
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const emailTestingService = new EmailTestingService(domain)

  const updateStep = (stepId: string, status: TestStep['status'], message?: string, details?: any) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, message, details }
        : step
    ))
  }

  const runTest = async () => {
    setIsRunning(true)
    setError(null)
    setCurrentStep(0)
    
    // Reset all steps
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending', message: undefined, details: undefined })))

    try {
      // Step 1: DNS MX Record
      updateStep('dns-mx', 'running')
      const dnsResults = await emailTestingService.validateDNSRecords()
      updateStep('dns-mx', dnsResults.mx.success ? 'completed' : 'failed', dnsResults.mx.message, dnsResults.mx.details)
      setCurrentStep(1)

      // Step 2: DNS SPF Record
      updateStep('dns-spf', 'running')
      updateStep('dns-spf', dnsResults.spf.success ? 'completed' : 'failed', dnsResults.spf.message, dnsResults.spf.details)
      setCurrentStep(2)

      // Step 3: DNS DKIM Records
      updateStep('dns-dkim', 'running')
      updateStep('dns-dkim', dnsResults.dkim.success ? 'completed' : 'failed', dnsResults.dkim.message, dnsResults.dkim.details)
      setCurrentStep(3)

      // Step 4: DNS DMARC Record
      updateStep('dns-dmarc', 'running')
      updateStep('dns-dmarc', dnsResults.dmarc.success ? 'completed' : 'failed', dnsResults.dmarc.message, dnsResults.dmarc.details)
      setCurrentStep(4)

      // Step 5: Send Test Email
      updateStep('send-test', 'running')
      const deliveryResults = await emailTestingService.testEmailDelivery(testEmail)
      updateStep('send-test', deliveryResults.sendTest.success ? 'completed' : 'failed', deliveryResults.sendTest.message, deliveryResults.sendTest.details)
      setCurrentStep(5)

      // Step 6: Check Delivery Status
      updateStep('delivery-check', 'running')
      updateStep('delivery-check', deliveryResults.deliveryStatus.success ? 'completed' : 'failed', deliveryResults.deliveryStatus.message, deliveryResults.deliveryStatus.details)
      setCurrentStep(6)

      // Step 7: Check Bounce Status
      updateStep('bounce-check', 'running')
      updateStep('bounce-check', deliveryResults.bounceCheck.success ? 'completed' : 'failed', deliveryResults.bounceCheck.message, deliveryResults.bounceCheck.details)
      setCurrentStep(7)

      // Step 8: Check Spam Score
      updateStep('spam-check', 'running')
      updateStep('spam-check', deliveryResults.spamScore.success ? 'completed' : 'failed', deliveryResults.spamScore.message, deliveryResults.spamScore.details)
      setCurrentStep(8)

      // Calculate final results
      const completedSteps = steps.filter(step => step.status === 'completed').length
      const failedSteps = steps.filter(step => step.status === 'failed').length
      const overallSuccess = failedSteps === 0

      const finalResults = {
        dns: dnsResults,
        delivery: deliveryResults,
        summary: {
          overallSuccess,
          passedTests: completedSteps,
          totalTests: steps.length,
          failedTests: failedSteps,
          recommendations: generateRecommendations(dnsResults, deliveryResults)
        }
      }

      setResults(finalResults)
      onComplete?.(finalResults)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test failed unexpectedly')
      updateStep(steps[currentStep]?.id || 'unknown', 'failed', 'Test failed unexpectedly')
    } finally {
      setIsRunning(false)
    }
  }

  const generateRecommendations = (dnsResults: any, deliveryResults: any): string[] => {
    const recommendations: string[] = []
    
    if (!dnsResults.mx.success) {
      recommendations.push('Add MX record pointing to your mail server')
    }
    if (!dnsResults.spf.success) {
      recommendations.push('Add SPF record: v=spf1 include:amazonses.com -all')
    }
    if (!dnsResults.dkim.success) {
      recommendations.push('Add all 3 DKIM CNAME records from AWS SES')
    }
    if (!dnsResults.dmarc.success) {
      recommendations.push('Add DMARC record with policy and reporting')
    }
    if (!deliveryResults.sendTest.success) {
      recommendations.push('Check AWS SES configuration and credentials')
    }
    
    return recommendations
  }

  const resetTest = () => {
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending', message: undefined, details: undefined })))
    setCurrentStep(0)
    setResults(null)
    setError(null)
  }

  const getStepIcon = (status: TestStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
    }
  }

  const getStepBadge = (status: TestStep['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="ml-2">PASS</Badge>
      case 'failed':
        return <Badge variant="destructive" className="ml-2">FAIL</Badge>
      case 'running':
        return <Badge variant="secondary" className="ml-2">RUNNING</Badge>
      default:
        return <Badge variant="outline" className="ml-2">PENDING</Badge>
    }
  }

  const progress = (currentStep / steps.length) * 100

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Email Test Runner
          </CardTitle>
          <CardDescription>
            Automated testing for {domain} with test email {testEmail}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={runTest} 
              disabled={isRunning}
              className="flex-1"
            >
              {isRunning ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Tests
                </>
              )}
            </Button>
            
            <Button 
              onClick={resetTest} 
              disabled={isRunning}
              variant="outline"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{currentStep} / {steps.length}</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  step.status === 'running' ? 'bg-blue-50 border-blue-200' :
                  step.status === 'completed' ? 'bg-green-50 border-green-200' :
                  step.status === 'failed' ? 'bg-red-50 border-red-200' :
                  'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {getStepIcon(step.status)}
                  <div>
                    <p className="font-medium">{step.name}</p>
                    {step.message && (
                      <p className="text-sm text-muted-foreground">{step.message}</p>
                    )}
                  </div>
                </div>
                {getStepBadge(step.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{results.summary.passedTests}</p>
                  <p className="text-sm text-muted-foreground">Passed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{results.summary.failedTests}</p>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{results.summary.totalTests}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round((results.summary.passedTests / results.summary.totalTests) * 100)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
              </div>

              <div className="flex items-center justify-center">
                {results.summary.overallSuccess ? (
                  <Badge variant="default" className="text-lg px-4 py-2">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    All Tests Passed
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-lg px-4 py-2">
                    <XCircle className="h-5 w-5 mr-2" />
                    Some Tests Failed
                  </Badge>
                )}
              </div>

              {results.summary.recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Recommendations:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {results.summary.recommendations.map((rec, index) => (
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
      )}
    </div>
  )
}
