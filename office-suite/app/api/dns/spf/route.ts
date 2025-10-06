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
      const txtRecords = await dns.resolveTxt(domain)
      
      // Find SPF record
      const spfRecord = txtRecords.find(record => 
        record[0].toLowerCase().startsWith('v=spf1')
      )
      
      if (spfRecord) {
        return NextResponse.json({
          success: true,
          record: {
            type: 'TXT',
            name: domain,
            value: spfRecord[0],
            ttl: 3600
          }
        })
      }
      
      return NextResponse.json({
        success: false,
        error: 'No SPF record found',
        record: null
      })
    } catch (dnsError: any) {
      if (dnsError.code === 'ENOTFOUND' || dnsError.code === 'ENODATA') {
        return NextResponse.json({
          success: false,
          error: 'No TXT records found for domain',
          record: null
        })
      }
      throw dnsError
    }
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to resolve SPF record' 
    }, { status: 500 })
  }
}
