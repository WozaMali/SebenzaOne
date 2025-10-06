import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import AdmZip from 'adm-zip'

// Global storage for imported emails (in a real app, this would be a database)
declare global {
  var emails: any[]
}

export async function GET() {
  try {
    // Return imported emails
    const emails = global.emails || []
    return NextResponse.json({ 
      success: true, 
      emails,
      count: emails.length 
    })
  } catch (error) {
    console.error('Error retrieving emails:', error)
    return NextResponse.json({ 
      error: `Failed to retrieve emails: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const password = formData.get('password') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Create temporary file
    const tempPath = join(tmpdir(), `temp-${Date.now()}-${file.name}`)
    const fileBuffer = await file.arrayBuffer()
    
    // Write file to temp location
    await writeFile(tempPath, Buffer.from(fileBuffer))

    let zip: AdmZip
    let processed = 0
    let imported = 0
    let failed = 0
    const errors: string[] = []

    try {
      // Try to open ZIP file
      if (password) {
        zip = new AdmZip(tempPath, password)
      } else {
        zip = new AdmZip(tempPath)
      }

      // Check if ZIP is encrypted by trying to read entries
      try {
        const entries = zip.getEntries()
        if (entries.length === 0) {
          // Empty ZIP or encrypted
          if (!password) {
            await unlink(tempPath)
            return NextResponse.json({ 
              error: 'Encrypted ZIP file detected. Please provide password.',
              encrypted: true 
            }, { status: 400 })
          }
        }
      } catch (e) {
        // Likely encrypted, try to detect
        if (!password) {
          await unlink(tempPath)
          return NextResponse.json({ 
            error: 'Encrypted ZIP file detected. Please provide password.',
            encrypted: true 
          }, { status: 400 })
        }
      }

      // Process ZIP entries
      const entries = zip.getEntries()
      
      for (const entry of entries) {
        processed++
        
        try {
          if (entry.isDirectory) {
            continue
          }

          // Extract file content
          const content = entry.getData().toString('utf8')
          
          // Process based on file extension
          if (entry.entryName.endsWith('.eml')) {
            // Process EML file
            await processEMLFile(content, entry.entryName)
            imported++
          } else if (entry.entryName.endsWith('.json')) {
            // Process JSON backup
            const data = JSON.parse(content)
            await processJSONBackup(data)
            imported++
          } else if (entry.entryName.endsWith('.csv')) {
            // Process CSV data
            await processCSVFile(content, entry.entryName)
            imported++
          } else {
            // Unsupported file type
            errors.push(`Unsupported file type: ${entry.entryName}`)
            failed++
          }
        } catch (error) {
          console.error(`Error processing ${entry.entryName}:`, error)
          errors.push(`Failed to process ${entry.entryName}: ${error instanceof Error ? error.message : 'Unknown error'}`)
          failed++
        }
      }

    } catch (error) {
      console.error('ZIP processing error:', error)
      
      // Clean up temp file first
      try {
        await unlink(tempPath)
      } catch (e) {
        console.error('Failed to clean up temp file:', e)
      }
      
      if (error instanceof Error) {
        if (error.message.includes('password') || error.message.includes('encrypted')) {
          return NextResponse.json({ 
            error: 'Invalid password or encrypted ZIP file',
            encrypted: true 
          }, { status: 400 })
        }
        
        if (error.message.includes('not a zip')) {
          return NextResponse.json({ 
            error: 'Invalid ZIP file format' 
          }, { status: 400 })
        }
      }
      
      return NextResponse.json({ 
        error: `Failed to process ZIP file: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }, { status: 500 })
    } finally {
      // Clean up temp file
      try {
        await unlink(tempPath)
      } catch (e) {
        console.error('Failed to clean up temp file:', e)
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      imported,
      failed,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}

// Helper functions for processing different file types
async function processEMLFile(content: string, filename: string) {
  try {
    // Parse EML content and extract email data
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
    
    // Transform EML data to our email format
    const emailData = {
      id: `eml-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      subject: headers.Subject || 'No Subject',
      from: headers.From || 'unknown@example.com',
      to: headers.To || 'unknown@example.com',
      cc: headers.Cc || undefined,
      bcc: headers.Bcc || undefined,
      body: body.trim(),
      isHtml: body.includes('<html') || body.includes('<HTML'),
      date: headers.Date ? new Date(headers.Date) : new Date(),
      folder: 'inbox',
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
    
    // Store in global emails array (in a real app, this would be a database)
    if (!global.emails) {
      global.emails = []
    }
    global.emails.push(emailData)
    
    console.log(`Processed EML file: ${filename} - ${emailData.subject}`)
    return true
  } catch (error) {
    console.error(`Error processing EML file ${filename}:`, error)
    throw error
  }
}

async function processJSONBackup(data: any) {
  try {
    // Process JSON backup data
    console.log('Processing JSON backup:', data)
    
    let emailsToImport: any[] = []
    
    if (Array.isArray(data)) {
      emailsToImport = data
    } else if (data.emails && Array.isArray(data.emails)) {
      emailsToImport = data.emails
    } else {
      console.log('No emails found in JSON backup')
      return true
    }
    
    // Store emails in global array
    if (!global.emails) {
      global.emails = []
    }
    
    emailsToImport.forEach(emailData => {
      // Transform to our format
      const email = {
        id: emailData.id || `json-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        subject: emailData.subject || emailData.Subject || 'No Subject',
        from: emailData.from || emailData.From || 'unknown@example.com',
        to: emailData.to || emailData.To || 'unknown@example.com',
        cc: emailData.cc || emailData.Cc || undefined,
        bcc: emailData.bcc || emailData.Bcc || undefined,
        body: emailData.body || emailData.Body || emailData.content || '',
        isHtml: Boolean(emailData.isHtml || emailData.is_html || emailData.html),
        date: emailData.date || emailData.Date ? new Date(emailData.date || emailData.Date) : new Date(),
        folder: emailData.folder || emailData.Folder || 'inbox',
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
        priority: emailData.priority || emailData.Priority || 'normal'
      }
      
      global.emails.push(email)
    })
    
    console.log(`Processed ${emailsToImport.length} emails from JSON backup`)
    return true
  } catch (error) {
    console.error('Error processing JSON backup:', error)
    throw error
  }
}

async function processCSVFile(content: string, filename: string) {
  try {
    // Process CSV data
    const lines = content.split('\n')
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header and one data row')
    }
    
    const headers = lines[0].split(',').map(h => h.trim())
    
    // Store emails in global array
    if (!global.emails) {
      global.emails = []
    }
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim())
        const row: { [key: string]: string } = {}
        
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        
        // Transform CSV row to email format
        const email = {
          id: `csv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          subject: row.subject || row.Subject || 'No Subject',
          from: row.from || row.From || 'unknown@example.com',
          to: row.to || row.To || 'unknown@example.com',
          cc: row.cc || row.Cc || undefined,
          bcc: row.bcc || row.Bcc || undefined,
          body: row.body || row.Body || row.content || '',
          isHtml: Boolean(row.isHtml || row.is_html || row.html),
          date: row.date || row.Date ? new Date(row.date || row.Date) : new Date(),
          folder: row.folder || row.Folder || 'inbox',
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
          priority: row.priority || row.Priority || 'normal'
        }
        
        global.emails.push(email)
      }
    }
    
    console.log(`Processed ${lines.length - 1} emails from CSV file ${filename}`)
    return true
  } catch (error) {
    console.error(`Error processing CSV file ${filename}:`, error)
    throw error
  }
}