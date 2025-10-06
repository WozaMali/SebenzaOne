import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/aws-ses'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      to,
      cc = [],
      bcc = [],
      subject,
      body: content,
      isHtml = true,
      fromEmail = process.env.MAIL_FROM_EMAIL,
      fromName = process.env.MAIL_FROM_NAME || ''
    } = body || {}

    if (!Array.isArray(to) || to.length === 0) {
      return NextResponse.json({ success: false, error: 'Missing recipients' }, { status: 400 })
    }
    if (!subject || !content) {
      return NextResponse.json({ success: false, error: 'Subject and body are required' }, { status: 400 })
    }

    const region = process.env.AWS_REGION || ''
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID || ''
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || ''

    if (!region || !accessKeyId || !secretAccessKey) {
      return NextResponse.json({ success: false, error: 'Server email config is missing' }, { status: 500 })
    }
    if (!fromEmail) {
      return NextResponse.json({ success: false, error: 'From email is not configured' }, { status: 500 })
    }

    const result = await sendEmail(
      { region, accessKeyId, secretAccessKey, fromEmail, fromName: fromName || fromEmail },
      { to, cc, bcc, subject, body: content, isHtml }
    )

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Send failed' }, { status: 502 })
    }

    return NextResponse.json({ success: true, messageId: result.messageId })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Unexpected error' }, { status: 500 })
  }
}


