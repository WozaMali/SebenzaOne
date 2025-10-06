import { NextResponse } from 'next/server'
import { promises as dns } from 'dns'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')
    
    if (!domain) {
      return NextResponse.json({ success: false, error: 'Domain parameter is required' }, { status: 400 })
    }

    try {
      const mxRecords = await dns.resolveMx(domain)
      
      return NextResponse.json({
        success: true,
        records: mxRecords.map(record => ({
          type: 'MX',
          name: domain,
          value: record.exchange,
          priority: record.priority,
          ttl: 3600
        }))
      })
    } catch (dnsError: any) {
      if (dnsError.code === 'ENOTFOUND' || dnsError.code === 'ENODATA') {
        return NextResponse.json({
          success: false,
          error: 'No MX records found for domain',
          records: []
        })
      }
      throw dnsError
    }
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to resolve MX records' 
    }, { status: 500 })
  }
}
