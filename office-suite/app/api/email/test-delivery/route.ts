import { NextResponse } from 'next/server'
import { EmailTestingService } from '@/lib/email-testing'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { domain, testEmail, testType = 'full' } = body

    if (!domain || !testEmail) {
      return NextResponse.json({ 
        success: false, 
        error: 'Domain and test email are required' 
      }, { status: 400 })
    }

    const emailTestingService = new EmailTestingService(domain)
    let results

    switch (testType) {
      case 'dns':
        results = await emailTestingService.validateDNSRecords()
        break
      case 'delivery':
        results = await emailTestingService.testEmailDelivery(testEmail)
        break
      case 'full':
      default:
        results = await emailTestingService.runFullTestSuite(testEmail)
        break
    }

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to run email test' 
    }, { status: 500 })
  }
}
