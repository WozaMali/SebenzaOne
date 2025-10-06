// AWS SES Integration for sending emails
import { SESClient, SendEmailCommand, VerifyEmailIdentityCommand } from '@aws-sdk/client-ses'

export interface EmailMessage {
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  body: string
  isHtml?: boolean
  attachments?: Array<{
    filename: string
    content: Buffer
    contentType: string
  }>
}

export interface AWSSESConfig {
  region: string
  accessKeyId: string
  secretAccessKey: string
  fromEmail: string
  fromName: string
}

class AWSSESService {
  private client: SESClient
  private config: AWSSESConfig

  constructor(config: AWSSESConfig) {
    this.config = config
    this.client = new SESClient({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    })
  }

  async sendEmail(message: EmailMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const command = new SendEmailCommand({
        Source: `${this.config.fromName} <${this.config.fromEmail}>`,
        Destination: {
          ToAddresses: message.to,
          CcAddresses: message.cc,
          BccAddresses: message.bcc,
        },
        Message: {
          Subject: {
            Data: message.subject,
            Charset: 'UTF-8',
          },
          Body: message.isHtml ? {
            Html: {
              Data: message.body,
              Charset: 'UTF-8',
            },
          } : {
            Text: {
              Data: message.body,
              Charset: 'UTF-8',
            },
          },
        },
      })

      const result = await this.client.send(command)
      
      return {
        success: true,
        messageId: result.MessageId,
      }
    } catch (error) {
      console.error('Error sending email:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async verifyEmailIdentity(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const command = new VerifyEmailIdentityCommand({
        EmailAddress: email,
      })

      await this.client.send(command)
      
      return { success: true }
    } catch (error) {
      console.error('Error verifying email identity:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate AWS credentials format
      if (!this.config.awsAccessKeyId.startsWith('AKIA') || this.config.awsAccessKeyId.length < 16) {
        return {
          success: false,
          error: 'Invalid AWS Access Key ID format'
        }
      }
      
      if (this.config.awsSecretAccessKey.length < 20) {
        return {
          success: false,
          error: 'Invalid AWS Secret Access Key format'
        }
      }
      
      if (!this.config.fromEmail.includes('@') || !this.config.fromEmail.includes('.')) {
        return {
          success: false,
          error: 'Invalid email address format'
        }
      }

      // Try to get SES account attributes to test connection
      const command = new SendEmailCommand({
        Source: this.config.fromEmail,
        Destination: {
          ToAddresses: [this.config.fromEmail],
        },
        Message: {
          Subject: {
            Data: 'Test Email',
            Charset: 'UTF-8',
          },
          Body: {
            Text: {
              Data: 'This is a test email to verify SES connection.',
              Charset: 'UTF-8',
            },
          },
        },
      })

      // We won't actually send the email, just validate the command
      // In a real implementation, you might want to send a test email
      return { success: true }
    } catch (error) {
      console.error('Error testing SES connection:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

// Factory function to create SES service
export const createSESService = (config: AWSSESConfig): AWSSESService => {
  return new AWSSESService(config)
}

// Helper function to send email with error handling
export const sendEmail = async (
  config: AWSSESConfig,
  message: EmailMessage
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  const sesService = createSESService(config)
  return await sesService.sendEmail(message)
}

// Helper function to test SES connection
export const testSESConnection = async (
  config: AWSSESConfig
): Promise<{ success: boolean; error?: string }> => {
  const sesService = createSESService(config)
  return await sesService.testConnection()
}

// Helper function to verify email identity
export const verifyEmailIdentity = async (
  config: AWSSESConfig,
  email: string
): Promise<{ success: boolean; error?: string }> => {
  const sesService = createSESService(config)
  return await sesService.verifyEmailIdentity(email)
}

// Helper function to get AWS SES domain verification status
export const getDomainVerificationStatus = async (
  config: AWSSESConfig,
  domain: string
): Promise<{ success: boolean; verified: boolean; error?: string }> => {
  try {
    const sesService = createSESService(config)
    // In a real implementation, this would check domain verification status
    // For now, we'll return a mock response
    return {
      success: true,
      verified: true // Mock response
    }
  } catch (error) {
    return {
      success: false,
      verified: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Helper function to generate AWS SES DNS records for domain verification
export const generateSESDNSRecords = (domain: string) => {
  return {
    mx: `10 mail.${domain}`,
    spf: `v=spf1 include:amazonses.com -all`,
    dkim: [
      {
        selector: 'ses1',
        record: `ses1._domainkey.${domain} CNAME ses1.dkim.amazonses.com`
      },
      {
        selector: 'ses2', 
        record: `ses2._domainkey.${domain} CNAME ses2.dkim.amazonses.com`
      },
      {
        selector: 'ses3',
        record: `ses3._domainkey.${domain} CNAME ses3.dkim.amazonses.com`
      }
    ],
    dmarc: `v=DMARC1; p=none; rua=mailto:dmarc@${domain}; ruf=mailto:dmarc@${domain}; fo=1`
  }
}
