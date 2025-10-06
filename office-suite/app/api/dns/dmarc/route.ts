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
      const dmarcDomain = `_dmarc.${domain}`
      const txtRecords = await dns.resolveTxt(dmarcDomain)
      
      // Find DMARC record
      const dmarcRecord = txtRecords.find(record => 
        record[0].toLowerCase().startsWith('v=dmarc1')
      )
      
      if (dmarcRecord) {
        return NextResponse.json({
          success: true,
          record: {
            type: 'TXT',
            name: dmarcDomain,
            value: dmarcRecord[0],
            ttl: 3600
          }
        })
      }
      
      return NextResponse.json({
        success: false,
        error: 'No DMARC record found',
        record: null
      })
    } catch (dnsError: any) {
      if (dnsError.code === 'ENOTFOUND' || dnsError.code === 'ENODATA') {
        return NextResponse.json({
          success: false,
          error: 'No DMARC record found for domain',
          record: null
        })
      }
      throw dnsError
    }
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to resolve DMARC record' 
    }, { status: 500 })
  }
}
