import { NextResponse } from 'next/server'
import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'
import { createClient } from '@supabase/supabase-js'

type MigrationRequest = {
  provider?: string
  hostname: string
  port: number
  useSSL: boolean
  username: string
  password: string
  folders?: string[]
  dateFrom?: string
  dateTo?: string
  maxMessages?: number
  allowInsecureTLS?: boolean
  action?: 'test' | 'migrate'
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return null
  return createClient(url, serviceKey)
}

export async function POST(req: Request) {
  try {
    const body: MigrationRequest = await req.json()

    if (!body?.hostname || !body?.username || !body?.password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const imapClient = new ImapFlow({
      host: body.hostname,
      port: body.port || 993,
      secure: !!body.useSSL,
      auth: { user: body.username, pass: body.password },
      tls: body.useSSL && body.allowInsecureTLS ? { rejectUnauthorized: false } : undefined,
      logger: false,
    })

    const supabase = getSupabaseAdmin()

    let processedMessages = 0
    let importedMessages = 0
    let failedMessages = 0

    try {
      await imapClient.connect()
    } catch (e: any) {
      console.error('IMAP connect error:', e)
      const code = e?.code || e?.responseCode
      let message = e?.message || 'IMAP connection failed'
      if (code === 'AUTHENTICATIONFAILED' || /authentication/i.test(message)) {
        message = 'Authentication failed. Verify email and app password.'
      } else if (code === 'ENOTFOUND' || /ENOTFOUND|getaddrinfo/i.test(message)) {
        message = 'IMAP host not found. Check hostname.'
      } else if (code === 'ECONNREFUSED' || /ECONNREFUSED/i.test(message)) {
        message = 'Connection refused. Check port and firewall.'
      } else if (code === 'ETIMEDOUT' || /timeout/i.test(message)) {
        message = 'Connection timed out. Network or port blocked.'
      } else if (/UNABLE_TO_VERIFY_LEAF_SIGNATURE|SELF_SIGNED_CERT|DEPTH_ZERO_SELF_SIGNED_CERT/i.test(message)) {
        message = 'TLS certificate error. Enable "Allow insecure TLS" for testing.'
      }
      return NextResponse.json({ error: message }, { status: 400 })
    }

    // If just testing, list mailboxes and disconnect
    if (body.action === 'test') {
      try {
        const mailboxes: string[] = []
        for await (const box of imapClient.list()) {
          mailboxes.push(box.path)
        }
        try { await imapClient.logout() } catch {}
        return NextResponse.json({ success: true, mailboxes })
      } catch (err: any) {
        console.error('IMAP list error:', err)
        try { await imapClient.logout() } catch {}
        return NextResponse.json({ error: err?.message || 'Failed to list mailboxes' }, { status: 400 })
      }
    }

    const folderNames: string[] = (body.folders && body.folders.length > 0) ? body.folders : ['INBOX']

    const sinceDate = body.dateFrom ? new Date(body.dateFrom) : undefined
    const beforeDate = body.dateTo ? new Date(new Date(body.dateTo).getTime() + 24*60*60*1000) : undefined
    const maxMessages = typeof body.maxMessages === 'number' && body.maxMessages > 0 ? body.maxMessages : undefined

    for (const folderName of folderNames) {
      try {
        await imapClient.mailboxOpen(folderName)

        const searchCriteria: any[] = ['ALL']
        if (sinceDate) searchCriteria.push(['SINCE', sinceDate])
        if (beforeDate) searchCriteria.push(['BEFORE', beforeDate])

        const uids = await imapClient.search(searchCriteria)
        if (!uids || uids.length === 0) continue

        // Fetch in chunks to avoid memory spikes
        const chunkSize = 50
        for (let i = 0; i < uids.length; i += chunkSize) {
          const chunk = uids.slice(i, i + chunkSize)
          const rowsToInsert: Array<{ subject: string; from_email: string; to_email: string; body: string; created_at?: string }> = []

          for await (const message of imapClient.fetch(chunk, { source: true })) {
            processedMessages += 1
            try {
              const parsed = await simpleParser(message.source as any)
              const subject = parsed.subject || '(no subject)'
              const fromEmail = parsed.from?.value?.[0]?.address || ''
              const toEmail = (parsed.to?.value || []).map(a => a.address).filter(Boolean).join(', ')
              const bodyHtml = (parsed.html && typeof parsed.html === 'string') ? parsed.html : ''
              const bodyText = parsed.text || ''
              const body = bodyHtml || bodyText
              const createdAt = parsed.date ? new Date(parsed.date).toISOString() : undefined

              rowsToInsert.push({ subject, from_email: fromEmail, to_email: toEmail, body, created_at: createdAt })
            } catch (err) {
              failedMessages += 1
            }

            if (maxMessages && processedMessages >= maxMessages) break
          }

          if (supabase && rowsToInsert.length > 0) {
            const { error } = await supabase.from('emails').insert(rowsToInsert)
            if (error) {
              // If bulk insert fails, try inserting one by one to salvage some
              for (const row of rowsToInsert) {
                const { error: singleErr } = await supabase.from('emails').insert(row)
                if (singleErr) failedMessages += 1
                else importedMessages += 1
              }
            } else {
              importedMessages += rowsToInsert.length
            }
          } else {
            // If Supabase is not configured, we still count as processed but cannot import
          }

          if (maxMessages && processedMessages >= maxMessages) break
        }
      } catch (folderErr) {
        // Skip folder on error
        continue
      } finally {
        try { await imapClient.mailboxClose() } catch {}
      }

      if (maxMessages && processedMessages >= maxMessages) break
    }

    try { await imapClient.logout() } catch {}

    return NextResponse.json({ processed: processedMessages, imported: importedMessages, failed: failedMessages })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Migration failed' }, { status: 500 })
  }
}


