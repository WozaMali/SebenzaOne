import { test, expect } from '@playwright/test'

test.describe('Email Compose', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mail')
  })

  test('should open compose dialog', async ({ page }) => {
    await page.click('[data-testid="compose-button"]')
    await expect(page.locator('[data-testid="compose-dialog"]')).toBeVisible()
  })

  test('should compose and send email', async ({ page }) => {
    await page.click('[data-testid="compose-button"]')
    
    // Fill recipients
    await page.fill('[data-testid="to-input"]', 'test@example.com')
    await page.press('[data-testid="to-input"]', 'Enter')
    
    // Fill subject
    await page.fill('[data-testid="subject-input"]', 'Test Email')
    
    // Fill body
    await page.fill('[data-testid="editor"]', 'This is a test email')
    
    // Send
    await page.click('[data-testid="send-button"]')
    
    // Should close dialog
    await expect(page.locator('[data-testid="compose-dialog"]')).not.toBeVisible()
  })

  test('should save draft', async ({ page }) => {
    await page.click('[data-testid="compose-button"]')
    
    // Fill some content
    await page.fill('[data-testid="subject-input"]', 'Draft Email')
    await page.fill('[data-testid="editor"]', 'This is a draft')
    
    // Save draft
    await page.click('[data-testid="save-draft-button"]')
    
    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
  })

  test('should handle formatting', async ({ page }) => {
    await page.click('[data-testid="compose-button"]')
    
    // Select text and apply formatting
    await page.fill('[data-testid="editor"]', 'Test text')
    await page.selectText('[data-testid="editor"]')
    
    // Apply bold
    await page.click('[data-testid="bold-button"]')
    
    // Apply italic
    await page.click('[data-testid="italic-button"]')
    
    // Apply underline
    await page.click('[data-testid="underline-button"]')
    
    // Check formatting was applied
    const editor = page.locator('[data-testid="editor"]')
    await expect(editor).toContainText('<strong><em><u>Test text</u></em></strong>')
  })

  test('should handle attachments', async ({ page }) => {
    await page.click('[data-testid="compose-button"]')
    
    // Upload file
    const fileInput = page.locator('[data-testid="file-input"]')
    await fileInput.setInputFiles('test-files/sample.pdf')
    
    // Should show attachment
    await expect(page.locator('[data-testid="attachment-list"]')).toBeVisible()
    await expect(page.locator('[data-testid="attachment-item"]')).toContainText('sample.pdf')
  })

  test('should handle templates', async ({ page }) => {
    await page.click('[data-testid="compose-button"]')
    
    // Open templates
    await page.click('[data-testid="templates-button"]')
    
    // Select template
    await page.click('[data-testid="template-item"]')
    
    // Should populate subject and body
    await expect(page.locator('[data-testid="subject-input"]')).toHaveValue('Follow-up: {{meeting_topic}}')
  })

  test('should handle signatures', async ({ page }) => {
    await page.click('[data-testid="compose-button"]')
    
    // Open signatures
    await page.click('[data-testid="signatures-button"]')
    
    // Select signature
    await page.click('[data-testid="signature-item"]')
    
    // Should add signature to body
    await expect(page.locator('[data-testid="editor"]')).toContainText('Best regards')
  })

  test('should handle scheduling', async ({ page }) => {
    await page.click('[data-testid="compose-button"]')
    
    // Fill required fields
    await page.fill('[data-testid="to-input"]', 'test@example.com')
    await page.fill('[data-testid="subject-input"]', 'Scheduled Email')
    
    // Open schedule dialog
    await page.click('[data-testid="schedule-button"]')
    
    // Select date
    await page.click('[data-testid="schedule-date"]')
    
    // Confirm schedule
    await page.click('[data-testid="schedule-confirm"]')
    
    // Should close dialog
    await expect(page.locator('[data-testid="compose-dialog"]')).not.toBeVisible()
  })

  test('should handle delegation', async ({ page }) => {
    await page.click('[data-testid="compose-button"]')
    
    // Fill required fields
    await page.fill('[data-testid="to-input"]', 'test@example.com')
    await page.fill('[data-testid="subject-input"]', 'Delegated Email')
    
    // Open delegate dialog
    await page.click('[data-testid="delegate-button"]')
    
    // Select delegate
    await page.selectOption('[data-testid="delegate-select"]', 'delegate@example.com')
    
    // Confirm delegation
    await page.click('[data-testid="delegate-confirm"]')
    
    // Should close dialog
    await expect(page.locator('[data-testid="compose-dialog"]')).not.toBeVisible()
  })

  test('should handle keyboard shortcuts', async ({ page }) => {
    await page.click('[data-testid="compose-button"]')
    
    // Test Ctrl+S (save draft)
    await page.keyboard.press('Control+s')
    
    // Should save draft
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    
    // Test Ctrl+Enter (send)
    await page.fill('[data-testid="to-input"]', 'test@example.com')
    await page.press('[data-testid="to-input"]', 'Enter')
    await page.fill('[data-testid="subject-input"]', 'Test')
    await page.keyboard.press('Control+Enter')
    
    // Should send email
    await expect(page.locator('[data-testid="compose-dialog"]')).not.toBeVisible()
  })

  test('should handle offline mode', async ({ page }) => {
    // Simulate offline
    await page.context.setOffline(true)
    
    await page.click('[data-testid="compose-button"]')
    
    // Should show offline indicator
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible()
    
    // Fill and send
    await page.fill('[data-testid="to-input"]', 'test@example.com')
    await page.press('[data-testid="to-input"]', 'Enter')
    await page.fill('[data-testid="subject-input"]', 'Offline Email')
    await page.click('[data-testid="send-button"]')
    
    // Should queue for offline
    await expect(page.locator('[data-testid="queue-indicator"]')).toBeVisible()
    
    // Go back online
    await page.context.setOffline(false)
    
    // Should sync queue
    await expect(page.locator('[data-testid="sync-complete"]')).toBeVisible()
  })

  test('should handle validation errors', async ({ page }) => {
    await page.click('[data-testid="compose-button"]')
    
    // Try to send without required fields
    await page.click('[data-testid="send-button"]')
    
    // Should show validation errors
    await expect(page.locator('[data-testid="validation-errors"]')).toBeVisible()
    await expect(page.locator('[data-testid="validation-errors"]')).toContainText('Subject line is empty')
    await expect(page.locator('[data-testid="validation-errors"]')).toContainText('No recipients specified')
  })

  test('should handle pre-send warnings', async ({ page }) => {
    await page.click('[data-testid="compose-button"]')
    
    // Fill with potentially problematic content
    await page.fill('[data-testid="to-input"]', 'test@example.com')
    await page.press('[data-testid="to-input"]', 'Enter')
    await page.fill('[data-testid="subject-input"]', 'Test')
    await page.fill('[data-testid="editor"]', 'This contains sensitive information: SSN 123-45-6789')
    
    // Try to send
    await page.click('[data-testid="send-button"]')
    
    // Should show DLP warning
    await expect(page.locator('[data-testid="dlp-warning"]')).toBeVisible()
  })

  test('should handle attachment security scanning', async ({ page }) => {
    await page.click('[data-testid="compose-button"]')
    
    // Upload potentially malicious file
    const fileInput = page.locator('[data-testid="file-input"]')
    await fileInput.setInputFiles('test-files/suspicious.exe')
    
    // Should show security warning
    await expect(page.locator('[data-testid="security-warning"]')).toBeVisible()
    await expect(page.locator('[data-testid="attachment-item"]')).toContainText('Threat Detected')
  })

  test('should handle rich text editing', async ({ page }) => {
    await page.click('[data-testid="compose-button"]')
    
    const editor = page.locator('[data-testid="editor"]')
    
    // Test text formatting
    await editor.fill('Test text')
    await editor.selectText()
    await page.click('[data-testid="bold-button"]')
    await expect(editor).toContainText('<strong>Test text</strong>')
    
    // Test lists
    await editor.fill('Item 1\nItem 2\nItem 3')
    await editor.selectText()
    await page.click('[data-testid="bullet-list-button"]')
    await expect(editor).toContainText('<ul>')
    
    // Test alignment
    await editor.fill('Centered text')
    await editor.selectText()
    await page.click('[data-testid="align-center-button"]')
    await expect(editor).toContainText('text-align: center')
  })

  test('should handle recipient management', async ({ page }) => {
    await page.click('[data-testid="compose-button"]')
    
    const toInput = page.locator('[data-testid="to-input"]')
    
    // Add multiple recipients
    await toInput.fill('user1@example.com')
    await toInput.press('Enter')
    await toInput.fill('user2@example.com')
    await toInput.press('Enter')
    
    // Should show recipient chips
    await expect(page.locator('[data-testid="recipient-chip"]')).toHaveCount(2)
    
    // Remove recipient
    await page.click('[data-testid="remove-recipient"]')
    await expect(page.locator('[data-testid="recipient-chip"]')).toHaveCount(1)
    
    // Add CC recipients
    await page.click('[data-testid="cc-button"]')
    const ccInput = page.locator('[data-testid="cc-input"]')
    await ccInput.fill('cc@example.com')
    await ccInput.press('Enter')
    
    // Should show CC recipient
    await expect(page.locator('[data-testid="cc-recipient-chip"]')).toBeVisible()
  })

  test('should handle priority and options', async ({ page }) => {
    await page.click('[data-testid="compose-button"]')
    
    // Set priority
    await page.selectOption('[data-testid="priority-select"]', 'high')
    await expect(page.locator('[data-testid="priority-select"]')).toHaveValue('high')
    
    // Enable encryption
    await page.check('[data-testid="encrypt-checkbox"]')
    await expect(page.locator('[data-testid="encrypt-checkbox"]')).toBeChecked()
    
    // Enable digital signature
    await page.check('[data-testid="sign-checkbox"]')
    await expect(page.locator('[data-testid="sign-checkbox"]')).toBeChecked()
    
    // Enable read receipt
    await page.check('[data-testid="read-receipt-checkbox"]')
    await expect(page.locator('[data-testid="read-receipt-checkbox"]')).toBeChecked()
  })

  test('should handle sidebar modules', async ({ page }) => {
    await page.click('[data-testid="compose-button"]')
    
    // Open sidebar
    await page.click('[data-testid="sidebar-toggle"]')
    
    // Test contacts tab
    await page.click('[data-testid="contacts-tab"]')
    await expect(page.locator('[data-testid="contacts-list"]')).toBeVisible()
    
    // Test templates tab
    await page.click('[data-testid="templates-tab"]')
    await expect(page.locator('[data-testid="templates-list"]')).toBeVisible()
    
    // Test files tab
    await page.click('[data-testid="files-tab"]')
    await expect(page.locator('[data-testid="files-list"]')).toBeVisible()
  })

  test('should handle auto-save', async ({ page }) => {
    await page.click('[data-testid="compose-button"]')
    
    // Fill some content
    await page.fill('[data-testid="subject-input"]', 'Auto-save test')
    await page.fill('[data-testid="editor"]', 'This should auto-save')
    
    // Wait for auto-save
    await page.waitForTimeout(3000)
    
    // Should show auto-save indicator
    await expect(page.locator('[data-testid="auto-save-indicator"]')).toBeVisible()
  })

  test('should handle draft conflict resolution', async ({ page }) => {
    await page.click('[data-testid="compose-button"]')
    
    // Simulate draft conflict
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('draft-conflict', { 
        detail: { version: 2, localVersion: 1 } 
      }))
    })
    
    // Should show conflict dialog
    await expect(page.locator('[data-testid="conflict-dialog"]')).toBeVisible()
    
    // Resolve conflict
    await page.click('[data-testid="resolve-conflict"]')
    await expect(page.locator('[data-testid="conflict-dialog"]')).not.toBeVisible()
  })
})

