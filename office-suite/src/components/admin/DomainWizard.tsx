'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { StepNav } from './Wizard/StepNav'
import { Field } from './Forms/Field'
import { 
  Globe, 
  CheckCircle, 
  AlertTriangle, 
  Copy, 
  ExternalLink,
  RefreshCw,
  Shield,
  Mail,
  Server
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DomainWizardProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (domain: any) => void
}

const wizardSteps = [
  { id: 'domain', title: 'Domain Details', description: 'Enter your domain name' },
  { id: 'dns', title: 'DNS Configuration', description: 'Configure DNS records' },
  { id: 'verification', title: 'Verification', description: 'Verify domain ownership' },
  { id: 'security', title: 'Security Setup', description: 'Configure security policies' },
  { id: 'complete', title: 'Complete', description: 'Domain setup complete' }
]

const dnsRecords = [
  {
    type: 'MX',
    name: '@',
    value: '10 mail.sebenza.co.za',
    priority: 10,
    description: 'Mail exchange record for email routing'
  },
  {
    type: 'SPF',
    name: '@',
    value: 'v=spf1 include:sebenza.co.za ~all',
    priority: null,
    description: 'Sender Policy Framework for email authentication'
  },
  {
    type: 'DKIM',
    name: 'sebenza._domainkey',
    value: 'v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...',
    priority: null,
    description: 'DomainKeys Identified Mail for email signing'
  },
  {
    type: 'DMARC',
    name: '_dmarc',
    value: 'v=DMARC1; p=quarantine; rua=mailto:dmarc@sebenza.co.za',
    priority: null,
    description: 'Domain-based Message Authentication, Reporting and Conformance'
  }
]

export function DomainWizard({ isOpen, onClose, onComplete }: DomainWizardProps) {
  const [currentStep, setCurrentStep] = useState('domain')
  const [domainData, setDomainData] = useState({
    domain: '',
    organization: '',
    adminEmail: '',
    catchAll: false,
    disclaimer: '',
    notificationEmail: ''
  })
  const [dnsStatus, setDnsStatus] = useState({
    mx: false,
    spf: false,
    dkim: false,
    dmarc: false
  })
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'failed'>('pending')
  const [securitySettings, setSecuritySettings] = useState({
    requireTLS: true,
    enforceDMARC: true,
    quarantinePolicy: 'strict',
    monitoringEnabled: true
  })

  const currentStepIndex = wizardSteps.findIndex(step => step.id === currentStep)
  const progress = ((currentStepIndex + 1) / wizardSteps.length) * 100

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < wizardSteps.length) {
      setCurrentStep(wizardSteps[nextIndex].id)
    }
  }

  const handlePrevious = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(wizardSteps[prevIndex].id)
    }
  }

  const handleComplete = () => {
    onComplete({
      ...domainData,
      dnsStatus,
      verificationStatus,
      securitySettings
    })
    onClose()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const checkDNSStatus = () => {
    // Simulate DNS check
    setDnsStatus({
      mx: true,
      spf: true,
      dkim: false,
      dmarc: true
    })
  }

  const verifyDomain = () => {
    // Simulate domain verification
    setVerificationStatus('verified')
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'domain':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Domain Information</h3>
              <p className="text-sm text-muted-foreground">
                Enter your domain name and basic configuration details.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Domain Name"
                name="domain"
                value={domainData.domain}
                onChange={(value) => setDomainData(prev => ({ ...prev, domain: value }))}
                placeholder="example.com"
                required
                tooltip="Enter your domain name without www"
              />
              
              <Field
                label="Organization"
                name="organization"
                value={domainData.organization}
                onChange={(value) => setDomainData(prev => ({ ...prev, organization: value }))}
                placeholder="Your Organization"
                tooltip="Organization name for email headers"
              />
              
              <Field
                label="Admin Email"
                name="adminEmail"
                type="email"
                value={domainData.adminEmail}
                onChange={(value) => setDomainData(prev => ({ ...prev, adminEmail: value }))}
                placeholder="admin@example.com"
                required
                tooltip="Administrative contact for this domain"
              />
              
              <Field
                label="Notification Email"
                name="notificationEmail"
                type="email"
                value={domainData.notificationEmail}
                onChange={(value) => setDomainData(prev => ({ ...prev, notificationEmail: value }))}
                placeholder="notifications@example.com"
                tooltip="Email for domain notifications and alerts"
              />
            </div>

            <div className="space-y-4">
              <Field
                label="Catch-All Mailbox"
                name="catchAll"
                type="switch"
                value={domainData.catchAll}
                onChange={(value) => setDomainData(prev => ({ ...prev, catchAll: value }))}
                helpText="Route all unmatched emails to a specific mailbox"
              />
              
              <Field
                label="Email Disclaimer"
                name="disclaimer"
                type="textarea"
                value={domainData.disclaimer}
                onChange={(value) => setDomainData(prev => ({ ...prev, disclaimer: value }))}
                placeholder="Enter your organization's email disclaimer..."
                helpText="Legal disclaimer to be added to outgoing emails"
              />
            </div>
          </div>
        )

      case 'dns':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">DNS Configuration</h3>
              <p className="text-sm text-muted-foreground">
                Configure the following DNS records for your domain. Click &quot;Copy&quot; to copy each record to your clipboard.
              </p>
            </div>

            <div className="space-y-4">
              {dnsRecords.map((record, index) => (
                <Card key={index} className="bg-surface border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Server className="h-4 w-4" />
                        {record.type} Record
                      </CardTitle>
                      <Badge 
                        variant={dnsStatus[record.type.toLowerCase() as keyof typeof dnsStatus] ? 'default' : 'secondary'}
                        className={dnsStatus[record.type.toLowerCase() as keyof typeof dnsStatus] 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-muted text-muted-foreground'
                        }
                      >
                        {dnsStatus[record.type.toLowerCase() as keyof typeof dnsStatus] ? 'Verified' : 'Pending'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Name:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                            {record.name}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(record.name)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">Value:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="bg-muted px-2 py-1 rounded text-xs font-mono flex-1 break-all">
                            {record.value}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(record.value)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {record.priority && (
                        <div>
                          <span className="text-muted-foreground">Priority:</span>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                              {record.priority}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(record.priority.toString())}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground">{record.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">DNS Records Status</p>
                <p className="text-xs text-muted-foreground">
                  {Object.values(dnsStatus).filter(Boolean).length} of {Object.keys(dnsStatus).length} records verified
                </p>
              </div>
              <Button onClick={checkDNSStatus} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Status
              </Button>
            </div>
          </div>
        )

      case 'verification':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Domain Verification</h3>
              <p className="text-sm text-muted-foreground">
                Verify that you own this domain by completing the verification process.
              </p>
            </div>

            <Card className="bg-surface border-border/50">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  {verificationStatus === 'pending' && (
                    <>
                      <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto">
                        <AlertTriangle className="h-8 w-8 text-yellow-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-foreground">Verification Required</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Click the button below to start the domain verification process.
                        </p>
                      </div>
                      <Button onClick={verifyDomain} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                        <Shield className="h-4 w-4 mr-2" />
                        Start Verification
                      </Button>
                    </>
                  )}

                  {verificationStatus === 'verified' && (
                    <>
                      <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="h-8 w-8 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-foreground">Domain Verified</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your domain has been successfully verified and is ready to use.
                        </p>
                      </div>
                    </>
                  )}

                  {verificationStatus === 'failed' && (
                    <>
                      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                        <AlertTriangle className="h-8 w-8 text-red-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-foreground">Verification Failed</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Please check your DNS records and try again.
                        </p>
                      </div>
                      <Button onClick={verifyDomain} variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry Verification
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Security Configuration</h3>
              <p className="text-sm text-muted-foreground">
                Configure security policies and settings for your domain.
              </p>
            </div>

            <div className="space-y-4">
              <Field
                label="Require TLS Encryption"
                name="requireTLS"
                type="switch"
                value={securitySettings.requireTLS}
                onChange={(value) => setSecuritySettings(prev => ({ ...prev, requireTLS: value }))}
                helpText="Enforce TLS encryption for all email communications"
              />
              
              <Field
                label="Enforce DMARC Policy"
                name="enforceDMARC"
                type="switch"
                value={securitySettings.enforceDMARC}
                onChange={(value) => setSecuritySettings(prev => ({ ...prev, enforceDMARC: value }))}
                helpText="Apply strict DMARC policy enforcement"
              />
              
              <Field
                label="Quarantine Policy"
                name="quarantinePolicy"
                type="select"
                value={securitySettings.quarantinePolicy}
                onChange={(value) => setSecuritySettings(prev => ({ ...prev, quarantinePolicy: value }))}
                options={[
                  { value: 'strict', label: 'Strict - Quarantine all suspicious emails' },
                  { value: 'moderate', label: 'Moderate - Quarantine high-risk emails' },
                  { value: 'lenient', label: 'Lenient - Quarantine only obvious threats' }
                ]}
                helpText="Set the quarantine policy for suspicious emails"
              />
              
              <Field
                label="Enable Monitoring"
                name="monitoringEnabled"
                type="switch"
                value={securitySettings.monitoringEnabled}
                onChange={(value) => setSecuritySettings(prev => ({ ...prev, monitoringEnabled: value }))}
                helpText="Enable real-time monitoring and alerting"
              />
            </div>
          </div>
        )

      case 'complete':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Domain Setup Complete</h3>
              <p className="text-sm text-muted-foreground">
                Your domain has been successfully configured and is ready to use.
              </p>
            </div>

            <Card className="bg-surface border-border/50">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-foreground">Domain Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Domain:</span>
                  <span className="text-sm font-medium text-foreground">{domainData.domain}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">DNS Health:</span>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    Healthy
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Security:</span>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    Configured
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border/50 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Domain Setup Wizard</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Step {currentStepIndex + 1} of {wizardSteps.length}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="mt-4">
            <StepNav
              steps={wizardSteps}
              currentStep={currentStep}
              onStepClick={setCurrentStep}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border/50 flex items-center justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          
          <div className="flex items-center gap-3">
            {currentStepIndex > 0 && (
              <Button variant="outline" onClick={handlePrevious}>
                Previous
              </Button>
            )}
            
            {currentStep === 'complete' ? (
              <Button onClick={handleComplete} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Setup
              </Button>
            ) : (
              <Button onClick={handleNext} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
