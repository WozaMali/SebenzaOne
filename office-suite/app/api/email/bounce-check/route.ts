import { NextResponse } from 'next/server'
import { SESClient, GetIdentityNotificationAttributesCommand } from '@aws-sdk/client-ses'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email address is required' 
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
      // Get notification attributes for the domain
      const domain = email.split('@')[1]
      const command = new GetIdentityNotificationAttributesCommand({
        Identities: [domain]
      })
      
      const result = await sesClient.send(command)
      const attributes = result.NotificationAttributes[domain]

      return NextResponse.json({
        success: true,
        email,
        domain,
        bounceNotifications: attributes?.BounceTopic || null,
        complaintNotifications: attributes?.ComplaintTopic || null,
        deliveryNotifications: attributes?.DeliveryTopic || null,
        isOnBounceList: false, // This would require checking a bounce list database
        note: 'Bounce status is simulated. For real-time bounce tracking, configure SNS notifications.'
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
      error: error.message || 'Failed to check bounce status' 
    }, { status: 500 })
  }
}
