import { NextResponse } from 'next/server'
import { promises as dns } from 'dns'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')
    
    if (!domain) {
      return NextResponse.json({ success: false, error: 'Domain parameter is required' }, { status: 400 })
    }

    const dkimSelectors = ['ses1', 'ses2', 'ses3']
    const dkimRecords = []

    for (const selector of dkimSelectors) {
      try {
        const dkimDomain = `${selector}._domainkey.${domain}`
        const cnameRecords = await dns.resolveCname(dkimDomain)
        
        if (cnameRecords.length > 0) {
          dkimRecords.push({
            type: 'CNAME',
            name: dkimDomain,
            value: cnameRecords[0],
            ttl: 3600,
            selector
          })
        }
      } catch (error: any) {
        if (error.code !== 'ENOTFOUND' && error.code !== 'ENODATA') {
          console.warn(`Error resolving DKIM record for ${selector}:`, error.message)
        }
      }
    }

    return NextResponse.json({
      success: dkimRecords.length > 0,
      records: dkimRecords,
      message: dkimRecords.length === 3 
        ? 'All DKIM records found' 
        : `Found ${dkimRecords.length}/3 DKIM records`
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to resolve DKIM records' 
    }, { status: 500 })
  }
}
