import { NextResponse } from 'next/server'
import { SESClient, GetSendQuotaCommand, GetSendStatisticsCommand } from '@aws-sdk/client-ses'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('messageId')
    
    if (!messageId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Message ID is required' 
      }, { status: 400 })
    }

    const region = process.env.AWS_REGION || 'us-east-1'
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

    if (!accessKeyId || !secretAccessKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'AWS credentials not configured' 
      }, { status: 500 })
    }

    const sesClient = new SESClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })

    try {
      // Get send quota and statistics
      const [quotaResult, statsResult] = await Promise.all([
        sesClient.send(new GetSendQuotaCommand({})),
        sesClient.send(new GetSendStatisticsCommand({}))
      ])

      // Note: AWS SES doesn't provide real-time delivery status for individual messages
      // This is a limitation of the SES API. For production, consider using:
      // 1. SNS notifications for bounces/complaints
      // 2. CloudWatch metrics
      // 3. Third-party services like SendGrid or Mailgun for detailed tracking

      return NextResponse.json({
        success: true,
        messageId,
        status: 'delivered', // Simulated status
        quota: {
          max24Hour: quotaResult.Max24HourSend,
          maxSendRate: quotaResult.MaxSendRate,
          sentLast24Hours: quotaResult.SentLast24Hours
        },
        statistics: statsResult.SendDataPoints?.slice(0, 5) || [], // Last 5 data points
        note: 'Delivery status is simulated. For real-time tracking, configure SNS notifications.'
      })
    } catch (awsError: any) {
      return NextResponse.json({ 
        success: false, 
        error: `AWS SES error: ${awsError.message}` 
      }, { status: 502 })
    }
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to check delivery status' 
    }, { status: 500 })
  }
}
