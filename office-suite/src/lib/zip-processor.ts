// Client-side ZIP processing using JSZip
import JSZip from 'jszip'

export interface ProcessedEmail {
  id: string
  subject: string
  from: { name: string; email: string; displayName: string }
  to: { name: string; email: string; displayName: string }[]
  cc?: { name: string; email: string; displayName: string }[]
  bcc?: { name: string; email: string; displayName: string }[]
  body: string
  isHtml: boolean
  date: Date
  folder: string
  isRead: boolean
  isStarred: boolean
  isImportant: boolean
  isPinned: boolean
  isDraft: boolean
  isSent: boolean
  isDeleted: boolean
  isSpam: boolean
  hasAttachments: boolean
  attachments: Array<{ id: string; filename: string; contentType: string; size: number }>
  labels: string[]
  priority: 'low' | 'normal' | 'high'
}

export class ZipProcessor {
  private parseEmailAddress(address: string): { name: string; email: string; displayName: string } {
    if (!address) return { name: 'Unknown', email: 'unknown@example.com', displayName: 'Unknown' }
    
    const match = address.match(/^(.+?)\s*<(.+?)>$/);
    if (match) {
      return { 
        name: match[1].trim(), 
        email: match[2].trim(), 
        displayName: match[1].trim() 
      }
    }
    
    return { name: address, email: address, displayName: address }
  }

  private parseEmailAddresses(addresses: string | string[]): { name: string; email: string; displayName: string }[] {
    if (!addresses) return []
    
    if (Array.isArray(addresses)) {
      return addresses.map(addr => this.parseEmailAddress(addr))
    }
    
    if (typeof addresses === 'string') {
      return addresses.split(',').map(addr => this.parseEmailAddress(addr.trim()))
    }
    
    return [this.parseEmailAddress(addresses)]
  }

  private determineIfHtml(data: any): boolean {
    // Check if the content contains HTML tags
    if (typeof data === 'string') {
      // Look for HTML tags in the content
      const htmlTagRegex = /<[^>]+>/g
      const hasHtmlTags = htmlTagRegex.test(data)
      
      // Also check for common HTML patterns
      const hasHtmlPatterns = /<(p|div|br|strong|em|ul|ol|li|h[1-6]|table|tr|td|th|img|a|span|font|b|i|u)[^>]*>/i.test(data)
      
      return hasHtmlTags || hasHtmlPatterns
    }
    
    // Check if it's an object with HTML content
    if (typeof data === 'object' && data !== null) {
      if (data.html) return true
      if (data.contentType && data.contentType.includes('text/html')) return true
      if (data.type && data.type === 'html') return true
    }
    
    return false
  }

  private sanitizeEmailBody(body: string): string {
    if (!body) return ''
    
    // EXTRACT ONLY THE CLEAN EMAIL CONTENT
    // Look for the clean email content pattern - try multiple patterns
    let cleanEmailMatch = body.match(/Dear [A-Za-z ]+[\s\S]*?Disclaimer: Transmission Confidentiality Notice/)
    
    // If not found, try with "Dear:" pattern
    if (!cleanEmailMatch) {
      cleanEmailMatch = body.match(/Dear:[A-Za-z ]+[\s\S]*?Disclaimer: Transmission Confidentiality Notice/)
    }
    
    // If still not found, try to find HTML content between DOCTYPE and closing body
    if (!cleanEmailMatch && body.includes('<!DOCTYPE html')) {
      const htmlMatch = body.match(/<!DOCTYPE html[\s\S]*?<\/body><\/html>/)
      if (htmlMatch) {
        cleanEmailMatch = htmlMatch
      }
    }
    
    // If still not found, try to find content between "Dear" and "Disclaimer"
    if (!cleanEmailMatch) {
      cleanEmailMatch = body.match(/Dear[:\s][A-Za-z ]+[\s\S]*?Disclaimer/)
    }
    
    if (cleanEmailMatch) {
      // Found the clean email content, extract it
      let cleanContent = cleanEmailMatch[0]
      
      // Remove the disclaimer part
      cleanContent = cleanContent.replace(/Disclaimer: Transmission Confidentiality Notice[\s\S]*$/, '')
      cleanContent = cleanContent.replace(/Disclaimer[\s\S]*$/, '')
      
      // Clean up any remaining artifacts
      cleanContent = cleanContent
        // Remove MIME artifacts
        .replace(/<0\.\.\.\d+>/g, '')
        .replace(/67741447\.--\.--/g, '')
        .replace(/\.--\.--/g, '')
        .replace(/--\.--/g, '')
        .replace(/\.--/g, '')
        .replace(/--/g, '')
        
        // Remove technical artifacts
        .replace(/[0-9]{10,}/g, '')
        .replace(/[a-f0-9]{20,}/gi, '')
        
        // Fix encoding issues
        .replace(/Â/g, '')
        .replace(/\u00A0/g, ' ')
        .replace(/\u200B/g, '')
        .replace(/\u200C/g, '')
        .replace(/\u200D/g, '')
        .replace(/\uFEFF/g, '')
        
        // Clean up spacing
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n\n')
        .replace(/^\s+|\s+$/g, '')
        .trim()
      
      return cleanContent
    }
    
    // If no clean pattern found, try to extract any readable content
    let fallbackContent = body
      // Remove MIME headers and boundaries
      .replace(/------=_Part_\d+_\.Content-Type:[\s\S]*?------=_Part_\d+_\./g, '')
      .replace(/------=_Part_\d+_\.Content-Type:[\s\S]*?$/g, '')
      .replace(/Content-Type:[\s\S]*?Content-Transfer-Encoding:[\s\S]*?/g, '')
      .replace(/Content-Transfer-Encoding:[\s\S]*?/g, '')
      .replace(/Content-Disposition:[\s\S]*?/g, '')
      .replace(/Content-ID:[\s\S]*?/g, '')
      .replace(/boundary="[^"]*"/g, '')
      .replace(/charset="[^"]*"/g, '')
      .replace(/name="[^"]*"/g, '')
      .replace(/filename="[^"]*"/g, '')
      
      // Remove MIME boundaries
      .replace(/------=_Part_\d+_\./g, '')
      .replace(/------=_Part_\d+_/g, '')
      .replace(/^--.*$/gm, '')
      .replace(/^Content-.*$/gm, '')
      
      // Remove artifacts
      .replace(/quoted-printable/g, '')
      .replace(/base64/g, '')
      .replace(/inline; filename[\s\S]*?\.png/g, '')
      .replace(/67741447\.--\.--/g, '')
      .replace(/\.--\.--/g, '')
      .replace(/<0\.\.\.\d+>/g, '')
      .replace(/\.--\.--/g, '')
      .replace(/--\.--/g, '')
      .replace(/\.--/g, '')
      .replace(/--/g, '')
      
      // Convert quoted-printable
      .replace(/=\r?\n/g, '')
      .replace(/=([0-9A-F]{2})/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
      
      // Remove malformed URLs
      .replace(/3D%22[^"'\s>]*/g, '')
      .replace(/cid:[^"'\s>]+/g, '')
      .replace(/__inline__img__src[^"'\s>]*/g, '')
      .replace(/javascript:[^"'\s>]*/g, '')
      .replace(/data:[^"'\s>]*/g, '')
      .replace(/vbscript:[^"'\s>]*/g, '')
      
      // Remove base64 and long strings
      .replace(/[A-Za-z0-9+/]{50,}={0,2}/g, '')
      .replace(/[A-Za-z0-9+/]{20,}={0,2}/g, '')
      .replace(/[0-9]{10,}/g, '')
      .replace(/[a-f0-9]{20,}/gi, '')
      
      // Fix encoding
      .replace(/Â/g, '')
      .replace(/\u00A0/g, ' ')
      .replace(/\u200B/g, '')
      .replace(/\u200C/g, '')
      .replace(/\u200D/g, '')
      .replace(/\uFEFF/g, '')
      
      // Clean up
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .replace(/^\s+|\s+$/g, '')
      .trim()
    
    return fallbackContent
  }

  private parseEMLContent(content: string, targetFolder: string = 'inbox'): ProcessedEmail | null {
    try {
      const lines = content.split('\n')
      let headers: { [key: string]: string } = {}
      let body = ''
      let inBody = false
      
      for (const line of lines) {
        if (line.trim() === '') {
          inBody = true
          continue
        }
        
        if (inBody) {
          body += line + '\n'
        } else {
          const colonIndex = line.indexOf(':')
          if (colonIndex > 0) {
            const key = line.substring(0, colonIndex).trim()
            const value = line.substring(colonIndex + 1).trim()
            headers[key] = value
          }
        }
      }
      
      if (!headers.Subject || !headers.From) {
        return null
      }
      
      return {
        id: `eml-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        subject: headers.Subject || 'No Subject',
        from: this.parseEmailAddress(headers.From),
        to: this.parseEmailAddresses(headers.To || ''),
        cc: headers.Cc ? this.parseEmailAddresses(headers.Cc) : undefined,
        bcc: headers.Bcc ? this.parseEmailAddresses(headers.Bcc) : undefined,
        body: this.sanitizeEmailBody(body.trim()),
        isHtml: this.determineIfHtml(body),
        date: headers.Date ? new Date(headers.Date) : new Date(),
        folder: targetFolder,
        isRead: false,
        isStarred: false,
        isImportant: false,
        isPinned: false,
        isDraft: false,
        isSent: false,
        isDeleted: false,
        isSpam: false,
        hasAttachments: false,
        attachments: [],
        labels: [],
        priority: 'normal'
      }
    } catch (error) {
      console.error('Error parsing EML content:', error)
      return null
    }
  }

  private parseJSONContent(content: string, targetFolder: string = 'inbox'): ProcessedEmail[] {
    try {
      const data = JSON.parse(content)
      let emails: any[] = []
      
      if (Array.isArray(data)) {
        emails = data
      } else if (data.emails && Array.isArray(data.emails)) {
        emails = data.emails
      } else {
        return []
      }
      
      return emails.map(emailData => ({
        id: emailData.id || `json-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        subject: emailData.subject || emailData.Subject || 'No Subject',
        from: this.parseEmailAddress(emailData.from || emailData.From || 'unknown@example.com'),
        to: this.parseEmailAddresses(emailData.to || emailData.To || []),
        cc: emailData.cc || emailData.Cc ? this.parseEmailAddresses(emailData.cc || emailData.Cc) : undefined,
        bcc: emailData.bcc || emailData.Bcc ? this.parseEmailAddresses(emailData.bcc || emailData.Bcc) : undefined,
        body: this.sanitizeEmailBody(emailData.body || emailData.Body || emailData.content || ''),
        isHtml: this.determineIfHtml(body),
        date: emailData.date || emailData.Date ? new Date(emailData.date || emailData.Date) : new Date(),
        folder: emailData.folder || emailData.Folder || targetFolder,
        isRead: Boolean(emailData.isRead || emailData.is_read || emailData.read),
        isStarred: Boolean(emailData.isStarred || emailData.is_starred || emailData.starred),
        isImportant: Boolean(emailData.isImportant || emailData.is_important || emailData.important),
        isPinned: Boolean(emailData.isPinned || emailData.is_pinned || emailData.pinned),
        isDraft: Boolean(emailData.isDraft || emailData.is_draft || emailData.draft),
        isSent: Boolean(emailData.isSent || emailData.is_sent || emailData.sent),
        isDeleted: Boolean(emailData.isDeleted || emailData.is_deleted || emailData.deleted),
        isSpam: Boolean(emailData.isSpam || emailData.is_spam || emailData.spam),
        hasAttachments: Boolean(emailData.hasAttachments || emailData.has_attachments || emailData.attachments?.length > 0),
        attachments: emailData.attachments || emailData.Attachments || [],
        labels: Array.isArray(emailData.labels) ? emailData.labels : (emailData.labels ? emailData.labels.split(',') : []),
        priority: (emailData.priority || emailData.Priority || 'normal') as 'low' | 'normal' | 'high'
      }))
    } catch (error) {
      console.error('Error parsing JSON content:', error)
      return []
    }
  }

  private parseCSVContent(content: string, targetFolder: string = 'inbox'): ProcessedEmail[] {
    try {
      const lines = content.split('\n')
      if (lines.length < 2) return []
      
      const headers = lines[0].split(',').map(h => h.trim())
      const emails: ProcessedEmail[] = []
      
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim())
          const row: { [key: string]: string } = {}
          
          headers.forEach((header, index) => {
            row[header] = values[index] || ''
          })
          
          if (row.subject || row.Subject) {
            emails.push({
              id: `csv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              subject: row.subject || row.Subject || 'No Subject',
              from: this.parseEmailAddress(row.from || row.From || 'unknown@example.com'),
              to: this.parseEmailAddresses(row.to || row.To || ''),
              cc: row.cc || row.Cc ? this.parseEmailAddresses(row.cc || row.Cc) : undefined,
              bcc: row.bcc || row.Bcc ? this.parseEmailAddresses(row.bcc || row.Bcc) : undefined,
              body: this.sanitizeEmailBody(row.body || row.Body || row.content || ''),
              isHtml: this.determineIfHtml(body),
              date: row.date || row.Date ? new Date(row.date || row.Date) : new Date(),
              folder: row.folder || row.Folder || targetFolder,
              isRead: Boolean(row.isRead || row.is_read || row.read),
              isStarred: Boolean(row.isStarred || row.is_starred || row.starred),
              isImportant: Boolean(row.isImportant || row.is_important || row.important),
              isPinned: Boolean(row.isPinned || row.is_pinned || row.pinned),
              isDraft: Boolean(row.isDraft || row.is_draft || row.draft),
              isSent: Boolean(row.isSent || row.is_sent || row.sent),
              isDeleted: Boolean(row.isDeleted || row.is_deleted || row.deleted),
              isSpam: Boolean(row.isSpam || row.is_spam || row.spam),
              hasAttachments: Boolean(row.hasAttachments || row.has_attachments || row.attachments),
              attachments: [],
              labels: row.labels ? row.labels.split(',') : [],
              priority: (row.priority || row.Priority || 'normal') as 'low' | 'normal' | 'high'
            })
          }
        }
      }
      
      return emails
    } catch (error) {
      console.error('Error parsing CSV content:', error)
      return []
    }
  }

  async processZipFile(file: File, password?: string, targetFolder: string = 'inbox'): Promise<{
    processed: number
    imported: number
    failed: number
    emails: ProcessedEmail[]
  }> {
    try {
      const zip = new JSZip()
      const zipContent = await zip.loadAsync(file, password ? { password } : undefined)
      
      let processed = 0
      let imported = 0
      let failed = 0
      const emails: ProcessedEmail[] = []
      
      for (const [filename, file] of Object.entries(zipContent.files)) {
        if (file.dir) continue
        
        processed++
        
        try {
          const content = await file.async('text')
          let fileEmails: ProcessedEmail[] = []
          
          if (filename.endsWith('.eml')) {
            const email = this.parseEMLContent(content, targetFolder)
            if (email) fileEmails = [email]
          } else if (filename.endsWith('.json')) {
            fileEmails = this.parseJSONContent(content, targetFolder)
          } else if (filename.endsWith('.csv')) {
            fileEmails = this.parseCSVContent(content, targetFolder)
          }
          
          if (fileEmails.length > 0) {
            emails.push(...fileEmails)
            imported += fileEmails.length
          } else {
            failed++
          }
        } catch (error) {
          console.error(`Error processing ${filename}:`, error)
          failed++
        }
      }
      
      return { processed, imported, failed, emails }
    } catch (error) {
      console.error('Error processing ZIP file:', error)
      throw error
    }
  }
}

export const zipProcessor = new ZipProcessor()
