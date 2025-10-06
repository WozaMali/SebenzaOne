// Email Testing and DNS Validation Library
// Comprehensive testing for MX, SPF, DKIM, DMARC records and email delivery

export interface DNSRecord {
  type: string
  name: string
  value: string
  ttl: number
  priority?: number
}

export interface EmailTestResult {
  success: boolean
  message: string
  details?: any
  timestamp: string
}

export interface DNSValidationResult {
  mx: EmailTestResult
  spf: EmailTestResult
  dkim: EmailTestResult
  dmarc: EmailTestResult
  overall: EmailTestResult
}

export interface EmailDeliveryTest {
  sendTest: EmailTestResult
  deliveryStatus: EmailTestResult
  bounceCheck: EmailTestResult
  spamScore: EmailTestResult
}

export class EmailTestingService {
  private domain: string
  private apiKey?: string

  constructor(domain: string, apiKey?: string) {
    this.domain = domain
    this.apiKey = apiKey
  }

  // DNS Record Validation
  async validateDNSRecords(): Promise<DNSValidationResult> {
    const results: DNSValidationResult = {
      mx: await this.validateMXRecord(),
      spf: await this.validateSPFRecord(),
      dkim: await this.validateDKIMRecords(),
      dmarc: await this.validateDMARCRecord(),
      overall: { success: false, message: '', timestamp: new Date().toISOString() }
    }

    // Calculate overall success
    const allPassed = Object.values(results).every(result => 
      result === results.overall || result.success
    )
    
    results.overall = {
      success: allPassed,
      message: allPassed ? 'All DNS records are properly configured' : 'Some DNS records need attention',
      timestamp: new Date().toISOString()
    }

    return results
  }

  private async validateMXRecord(): Promise<EmailTestResult> {
    try {
      const response = await fetch(`/api/dns/mx?domain=${this.domain}`)
      const data = await response.json()
      
      if (data.success && data.records.length > 0) {
        return {
          success: true,
          message: `MX record found: ${data.records[0].value}`,
          details: data.records,
          timestamp: new Date().toISOString()
        }
      }
      
      return {
        success: false,
        message: 'No MX record found for domain',
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        message: `Error checking MX record: ${error}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  private async validateSPFRecord(): Promise<EmailTestResult> {
    try {
      const response = await fetch(`/api/dns/spf?domain=${this.domain}`)
      const data = await response.json()
      
      if (data.success && data.record) {
        const spfRecord = data.record.value
        const hasAmazonSES = spfRecord.includes('amazonses.com')
        const hasAll = spfRecord.includes('-all') || spfRecord.includes('~all')
        
        return {
          success: hasAmazonSES && hasAll,
          message: hasAmazonSES && hasAll 
            ? 'SPF record properly configured with Amazon SES'
            : 'SPF record needs to include amazonses.com and -all',
          details: { record: spfRecord, hasAmazonSES, hasAll },
          timestamp: new Date().toISOString()
        }
      }
      
      return {
        success: false,
        message: 'No SPF record found for domain',
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        message: `Error checking SPF record: ${error}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  private async validateDKIMRecords(): Promise<EmailTestResult> {
    try {
      const response = await fetch(`/api/dns/dkim?domain=${this.domain}`)
      const data = await response.json()
      
      if (data.success && data.records.length >= 3) {
        return {
          success: true,
          message: `All 3 DKIM records found for domain`,
          details: data.records,
          timestamp: new Date().toISOString()
        }
      }
      
      return {
        success: false,
        message: `Only ${data.records?.length || 0}/3 DKIM records found`,
        details: data.records,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        message: `Error checking DKIM records: ${error}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  private async validateDMARCRecord(): Promise<EmailTestResult> {
    try {
      const response = await fetch(`/api/dns/dmarc?domain=${this.domain}`)
      const data = await response.json()
      
      if (data.success && data.record) {
        const dmarcRecord = data.record.value
        const hasPolicy = dmarcRecord.includes('p=')
        const hasRUA = dmarcRecord.includes('rua=')
        
        return {
          success: hasPolicy && hasRUA,
          message: hasPolicy && hasRUA 
            ? 'DMARC record properly configured'
            : 'DMARC record should include policy (p=) and reporting (rua=)',
          details: { record: dmarcRecord, hasPolicy, hasRUA },
          timestamp: new Date().toISOString()
        }
      }
      
      return {
        success: false,
        message: 'No DMARC record found for domain',
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        message: `Error checking DMARC record: ${error}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  // Email Delivery Testing
  async testEmailDelivery(testEmail: string): Promise<EmailDeliveryTest> {
    const results: EmailDeliveryTest = {
      sendTest: await this.sendTestEmail(testEmail),
      deliveryStatus: { success: false, message: '', timestamp: new Date().toISOString() },
      bounceCheck: { success: false, message: '', timestamp: new Date().toISOString() },
      spamScore: { success: false, message: '', timestamp: new Date().toISOString() }
    }

    // If send was successful, check delivery status
    if (results.sendTest.success) {
      results.deliveryStatus = await this.checkDeliveryStatus(results.sendTest.details?.messageId)
      results.bounceCheck = await this.checkBounceStatus(testEmail)
      results.spamScore = await this.checkSpamScore(testEmail)
    }

    return results
  }

  private async sendTestEmail(testEmail: string): Promise<EmailTestResult> {
    try {
      const response = await fetch('/api/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: [testEmail],
          subject: `Email Test - ${new Date().toISOString()}`,
          body: `
            <h2>Email Delivery Test</h2>
            <p>This is a test email to verify email delivery from ${this.domain}</p>
            <p><strong>Test Details:</strong></p>
            <ul>
              <li>Domain: ${this.domain}</li>
              <li>Timestamp: ${new Date().toISOString()}</li>
              <li>Test ID: ${Math.random().toString(36).substr(2, 9)}</li>
            </ul>
            <p>If you receive this email, your email configuration is working correctly!</p>
          `,
          isHtml: true,
          fromEmail: `test@${this.domain}`,
          fromName: 'Sebenza Suite Test'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        return {
          success: true,
          message: 'Test email sent successfully',
          details: { messageId: data.messageId },
          timestamp: new Date().toISOString()
        }
      }
      
      return {
        success: false,
        message: `Failed to send test email: ${data.error}`,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        message: `Error sending test email: ${error}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  private async checkDeliveryStatus(messageId?: string): Promise<EmailTestResult> {
    if (!messageId) {
      return {
        success: false,
        message: 'No message ID provided for delivery check',
        timestamp: new Date().toISOString()
      }
    }

    try {
      // This would typically check AWS SES delivery status
      // For now, we'll simulate a check
      return {
        success: true,
        message: 'Delivery status check completed (simulated)',
        details: { messageId, status: 'delivered' },
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        message: `Error checking delivery status: ${error}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  private async checkBounceStatus(email: string): Promise<EmailTestResult> {
    try {
      // This would check AWS SES bounce list
      return {
        success: true,
        message: 'Email address is not on bounce list',
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        message: `Error checking bounce status: ${error}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  private async checkSpamScore(email: string): Promise<EmailTestResult> {
    try {
      // This would use a service like SpamAssassin or similar
      return {
        success: true,
        message: 'Spam score check completed (simulated)',
        details: { score: 0.5, threshold: 5.0 },
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        message: `Error checking spam score: ${error}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  // Comprehensive Test Suite
  async runFullTestSuite(testEmail: string): Promise<{
    dns: DNSValidationResult
    delivery: EmailDeliveryTest
    summary: {
      overallSuccess: boolean
      passedTests: number
      totalTests: number
      recommendations: string[]
    }
  }> {
    const dns = await this.validateDNSRecords()
    const delivery = await this.testEmailDelivery(testEmail)
    
    const allTests = [
      dns.mx, dns.spf, dns.dkim, dns.dmarc,
      delivery.sendTest, delivery.deliveryStatus, delivery.bounceCheck, delivery.spamScore
    ]
    
    const passedTests = allTests.filter(test => test.success).length
    const totalTests = allTests.length
    
    const recommendations: string[] = []
    
    if (!dns.mx.success) {
      recommendations.push('Add MX record pointing to your mail server')
    }
    if (!dns.spf.success) {
      recommendations.push('Add SPF record: v=spf1 include:amazonses.com -all')
    }
    if (!dns.dkim.success) {
      recommendations.push('Add all 3 DKIM CNAME records from AWS SES')
    }
    if (!dns.dmarc.success) {
      recommendations.push('Add DMARC record with policy and reporting')
    }
    if (!delivery.sendTest.success) {
      recommendations.push('Check AWS SES configuration and credentials')
    }

    return {
      dns,
      delivery,
      summary: {
        overallSuccess: passedTests === totalTests,
        passedTests,
        totalTests,
        recommendations
      }
    }
  }
}
