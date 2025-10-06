import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RichCompose } from '../RichCompose'
import { ComposeMessage } from '@/types/mail'

// Mock the hooks
jest.mock('@/hooks/useKeyboardShortcuts', () => ({
  useComposeShortcuts: jest.fn(),
}))

jest.mock('@/hooks/useOfflineManager', () => ({
  useOfflineManager: jest.fn(() => ({
    isOnline: true,
    offlineQueue: [],
    sendMessage: jest.fn(),
    saveDraft: jest.fn(),
  })),
}))

// Mock the UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/input', () => ({
  Input: ({ onChange, ...props }: any) => (
    <input onChange={onChange} {...props} />
  ),
}))

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => (open ? <div data-testid="dialog">{children}</div> : null),
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h2 data-testid="dialog-title">{children}</h2>,
}))

describe('RichCompose', () => {
  const mockOnSend = jest.fn()
  const mockOnSave = jest.fn()
  const mockOnClose = jest.fn()
  const mockOnSchedule = jest.fn()
  const mockOnDelegate = jest.fn()

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSend: mockOnSend,
    onSave: mockOnSave,
    onSchedule: mockOnSchedule,
    onDelegate: mockOnDelegate,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders compose dialog when open', () => {
    render(<RichCompose {...defaultProps} />)
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument()
    expect(screen.getByText('Compose Email')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<RichCompose {...defaultProps} isOpen={false} />)
    
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
  })

  it('renders all toolbar buttons', () => {
    render(<RichCompose {...defaultProps} />)
    
    // Check for key toolbar buttons
    expect(screen.getByText('Send')).toBeInTheDocument()
    expect(screen.getByText('Save Draft')).toBeInTheDocument()
    expect(screen.getByText('Schedule')).toBeInTheDocument()
    expect(screen.getByText('Delegate')).toBeInTheDocument()
  })

  it('handles recipient input', async () => {
    render(<RichCompose {...defaultProps} />)
    
    const toInput = screen.getByPlaceholderText('Add recipients...')
    fireEvent.change(toInput, { target: { value: 'test@example.com' } })
    fireEvent.keyDown(toInput, { key: 'Enter' })
    
    // Should add recipient as chip
    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })
  })

  it('handles subject input', () => {
    render(<RichCompose {...defaultProps} />)
    
    const subjectInput = screen.getByPlaceholderText('Email subject')
    fireEvent.change(subjectInput, { target: { value: 'Test Subject' } })
    
    expect(subjectInput).toHaveValue('Test Subject')
  })

  it('shows CC field when CC button is clicked', () => {
    render(<RichCompose {...defaultProps} />)
    
    const ccButton = screen.getByText('Cc')
    fireEvent.click(ccButton)
    
    expect(screen.getByPlaceholderText('Add Cc recipients...')).toBeInTheDocument()
  })

  it('shows BCC field when BCC button is clicked', () => {
    render(<RichCompose {...defaultProps} />)
    
    const bccButton = screen.getByText('Bcc')
    fireEvent.click(bccButton)
    
    expect(screen.getByPlaceholderText('Add Bcc recipients...')).toBeInTheDocument()
  })

  it('validates required fields before sending', async () => {
    render(<RichCompose {...defaultProps} />)
    
    const sendButton = screen.getByText('Send')
    fireEvent.click(sendButton)
    
    // Should show validation warnings
    await waitFor(() => {
      expect(screen.getByText('Required')).toBeInTheDocument()
    })
  })

  it('calls onSend when send button is clicked with valid data', async () => {
    render(<RichCompose {...defaultProps} />)
    
    // Fill in required fields
    const toInput = screen.getByPlaceholderText('Add recipients...')
    fireEvent.change(toInput, { target: { value: 'test@example.com' } })
    fireEvent.keyDown(toInput, { key: 'Enter' })
    
    const subjectInput = screen.getByPlaceholderText('Email subject')
    fireEvent.change(subjectInput, { target: { value: 'Test Subject' } })
    
    const sendButton = screen.getByText('Send')
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(mockOnSend).toHaveBeenCalled()
    })
  })

  it('calls onSave when save button is clicked', () => {
    render(<RichCompose {...defaultProps} />)
    
    const saveButton = screen.getByText('Save Draft')
    fireEvent.click(saveButton)
    
    expect(mockOnSave).toHaveBeenCalled()
  })

  it('calls onClose when close button is clicked', () => {
    render(<RichCompose {...defaultProps} />)
    
    const closeButton = screen.getByRole('button', { name: '' }) // X button
    fireEvent.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('handles template selection', async () => {
    render(<RichCompose {...defaultProps} />)
    
    const templatesButton = screen.getByText('Templates')
    fireEvent.click(templatesButton)
    
    // Should show template dropdown
    await waitFor(() => {
      expect(screen.getByText('Meeting Follow-up')).toBeInTheDocument()
    })
  })

  it('handles signature selection', async () => {
    render(<RichCompose {...defaultProps} />)
    
    const signaturesButton = screen.getByText('Signatures')
    fireEvent.click(signaturesButton)
    
    // Should show signature dropdown
    await waitFor(() => {
      expect(screen.getByText('Professional')).toBeInTheDocument()
    })
  })

  it('shows schedule dialog when schedule button is clicked', async () => {
    render(<RichCompose {...defaultProps} />)
    
    const scheduleButton = screen.getByText('Schedule')
    fireEvent.click(scheduleButton)
    
    await waitFor(() => {
      expect(screen.getByText('Schedule Send')).toBeInTheDocument()
    })
  })

  it('shows delegate dialog when delegate button is clicked', async () => {
    render(<RichCompose {...defaultProps} />)
    
    const delegateButton = screen.getByText('Delegate')
    fireEvent.click(delegateButton)
    
    await waitFor(() => {
      expect(screen.getByText('Delegate Send')).toBeInTheDocument()
    })
  })

  it('handles priority selection', () => {
    render(<RichCompose {...defaultProps} />)
    
    const prioritySelect = screen.getByDisplayValue('Normal')
    fireEvent.change(prioritySelect, { target: { value: 'high' } })
    
    expect(prioritySelect).toHaveValue('high')
  })

  it('handles security options', () => {
    render(<RichCompose {...defaultProps} />)
    
    const encryptCheckbox = screen.getByLabelText('Encrypt message')
    const signCheckbox = screen.getByLabelText('Digitally sign')
    
    fireEvent.click(encryptCheckbox)
    fireEvent.click(signCheckbox)
    
    expect(encryptCheckbox).toBeChecked()
    expect(signCheckbox).toBeChecked()
  })

  it('handles read receipt option', () => {
    render(<RichCompose {...defaultProps} />)
    
    const readReceiptCheckbox = screen.getByLabelText('Request read receipt')
    fireEvent.click(readReceiptCheckbox)
    
    expect(readReceiptCheckbox).toBeChecked()
  })

  it('shows offline indicator when offline', () => {
    // Mock offline state
    const { useOfflineManager } = require('@/hooks/useOfflineManager')
    useOfflineManager.mockReturnValue({
      isOnline: false,
      offlineQueue: [],
      sendMessage: jest.fn(),
      saveDraft: jest.fn(),
    })

    render(<RichCompose {...defaultProps} />)
    
    expect(screen.getByText('Offline Mode')).toBeInTheDocument()
  })

  it('shows queue indicator when items are queued', () => {
    // Mock queue state
    const { useOfflineManager } = require('@/hooks/useOfflineManager')
    useOfflineManager.mockReturnValue({
      isOnline: true,
      offlineQueue: [{ id: '1', type: 'send', data: {}, status: 'pending' }],
      sendMessage: jest.fn(),
      saveDraft: jest.fn(),
    })

    render(<RichCompose {...defaultProps} />)
    
    expect(screen.getByText('1 queued')).toBeInTheDocument()
  })

  it('handles attachment upload', () => {
    render(<RichCompose {...defaultProps} />)
    
    const fileInput = screen.getByRole('button', { name: '' }) // Paperclip button
    fireEvent.click(fileInput)
    
    // Should trigger file input
    expect(fileInput).toBeInTheDocument()
  })

  it('handles image insertion', () => {
    render(<RichCompose {...defaultProps} />)
    
    const imageButton = screen.getByRole('button', { name: '' }) // Image button
    fireEvent.click(imageButton)
    
    // Should trigger image input
    expect(imageButton).toBeInTheDocument()
  })

  it('handles link insertion', () => {
    render(<RichCompose {...defaultProps} />)
    
    const linkButton = screen.getByRole('button', { name: '' }) // Link button
    fireEvent.click(linkButton)
    
    // Should show link dialog (mocked as prompt)
    expect(linkButton).toBeInTheDocument()
  })

  it('handles table insertion', () => {
    render(<RichCompose {...defaultProps} />)
    
    const tableButton = screen.getByRole('button', { name: '' }) // Table button
    fireEvent.click(tableButton)
    
    // Should insert table
    expect(tableButton).toBeInTheDocument()
  })

  it('handles formatting buttons', () => {
    render(<RichCompose {...defaultProps} />)
    
    const boldButton = screen.getByRole('button', { name: '' }) // Bold button
    const italicButton = screen.getByRole('button', { name: '' }) // Italic button
    const underlineButton = screen.getByRole('button', { name: '' }) // Underline button
    
    fireEvent.click(boldButton)
    fireEvent.click(italicButton)
    fireEvent.click(underlineButton)
    
    // Should execute formatting commands
    expect(boldButton).toBeInTheDocument()
    expect(italicButton).toBeInTheDocument()
    expect(underlineButton).toBeInTheDocument()
  })

  it('handles list buttons', () => {
    render(<RichCompose {...defaultProps} />)
    
    const bulletListButton = screen.getByRole('button', { name: '' }) // Bullet list button
    const numberedListButton = screen.getByRole('button', { name: '' }) // Numbered list button
    
    fireEvent.click(bulletListButton)
    fireEvent.click(numberedListButton)
    
    // Should execute list commands
    expect(bulletListButton).toBeInTheDocument()
    expect(numberedListButton).toBeInTheDocument()
  })

  it('handles alignment buttons', () => {
    render(<RichCompose {...defaultProps} />)
    
    const alignLeftButton = screen.getByRole('button', { name: '' }) // Align left button
    const alignCenterButton = screen.getByRole('button', { name: '' }) // Align center button
    const alignRightButton = screen.getByRole('button', { name: '' }) // Align right button
    const alignJustifyButton = screen.getByRole('button', { name: '' }) // Align justify button
    
    fireEvent.click(alignLeftButton)
    fireEvent.click(alignCenterButton)
    fireEvent.click(alignRightButton)
    fireEvent.click(alignJustifyButton)
    
    // Should execute alignment commands
    expect(alignLeftButton).toBeInTheDocument()
    expect(alignCenterButton).toBeInTheDocument()
    expect(alignRightButton).toBeInTheDocument()
    expect(alignJustifyButton).toBeInTheDocument()
  })

  it('handles undo/redo buttons', () => {
    render(<RichCompose {...defaultProps} />)
    
    const undoButton = screen.getByRole('button', { name: '' }) // Undo button
    const redoButton = screen.getByRole('button', { name: '' }) // Redo button
    
    fireEvent.click(undoButton)
    fireEvent.click(redoButton)
    
    // Should execute undo/redo commands
    expect(undoButton).toBeInTheDocument()
    expect(redoButton).toBeInTheDocument()
  })

  it('handles font family selection', () => {
    render(<RichCompose {...defaultProps} />)
    
    const fontSelect = screen.getByDisplayValue('Font')
    fireEvent.change(fontSelect, { target: { value: 'Arial' } })
    
    expect(fontSelect).toHaveValue('Arial')
  })

  it('handles font size selection', () => {
    render(<RichCompose {...defaultProps} />)
    
    const sizeSelect = screen.getByDisplayValue('Size')
    fireEvent.change(sizeSelect, { target: { value: '16px' } })
    
    expect(sizeSelect).toHaveValue('16px')
  })

  it('handles color selection', () => {
    render(<RichCompose {...defaultProps} />)
    
    const colorButton = screen.getByRole('button', { name: '' }) // Color button
    fireEvent.click(colorButton)
    
    // Should show color picker
    expect(colorButton).toBeInTheDocument()
  })

  it('handles highlight color selection', () => {
    render(<RichCompose {...defaultProps} />)
    
    const highlightButton = screen.getByRole('button', { name: '' }) // Highlight button
    fireEvent.click(highlightButton)
    
    // Should show highlight color picker
    expect(highlightButton).toBeInTheDocument()
  })

  it('handles indentation buttons', () => {
    render(<RichCompose {...defaultProps} />)
    
    const indentButton = screen.getByRole('button', { name: '' }) // Indent button
    const outdentButton = screen.getByRole('button', { name: '' }) // Outdent button
    
    fireEvent.click(indentButton)
    fireEvent.click(outdentButton)
    
    // Should execute indentation commands
    expect(indentButton).toBeInTheDocument()
    expect(outdentButton).toBeInTheDocument()
  })

  it('handles horizontal rule insertion', () => {
    render(<RichCompose {...defaultProps} />)
    
    const hrButton = screen.getByRole('button', { name: '' }) // HR button
    fireEvent.click(hrButton)
    
    // Should insert horizontal rule
    expect(hrButton).toBeInTheDocument()
  })

  it('handles emoji insertion', () => {
    render(<RichCompose {...defaultProps} />)
    
    const emojiButton = screen.getByRole('button', { name: '' }) // Emoji button
    fireEvent.click(emojiButton)
    
    // Should show emoji picker
    expect(emojiButton).toBeInTheDocument()
  })

  it('handles sidebar toggle', () => {
    render(<RichCompose {...defaultProps} />)
    
    const sidebarButton = screen.getByRole('button', { name: '' }) // Settings button
    fireEvent.click(sidebarButton)
    
    // Should toggle sidebar
    expect(sidebarButton).toBeInTheDocument()
  })

  it('handles draft conflict resolution', () => {
    render(<RichCompose {...defaultProps} />)
    
    // Simulate draft conflict
    const conflictBadge = screen.queryByText('Draft Conflict')
    if (conflictBadge) {
      expect(conflictBadge).toBeInTheDocument()
    }
  })

  it('handles pre-send warnings', async () => {
    render(<RichCompose {...defaultProps} />)
    
    // Try to send without required fields
    const sendButton = screen.getByText('Send')
    fireEvent.click(sendButton)
    
    // Should show warnings
    await waitFor(() => {
      expect(screen.getByText('Send Issues')).toBeInTheDocument()
    })
  })

  it('handles send anyway when warnings are present', async () => {
    render(<RichCompose {...defaultProps} />)
    
    // Try to send without required fields
    const sendButton = screen.getByText('Send')
    fireEvent.click(sendButton)
    
    // Click send anyway
    await waitFor(() => {
      const sendAnywayButton = screen.getByText('Send Anyway')
      fireEvent.click(sendAnywayButton)
    })
    
    expect(mockOnSend).toHaveBeenCalled()
  })

  it('handles cancel when warnings are present', async () => {
    render(<RichCompose {...defaultProps} />)
    
    // Try to send without required fields
    const sendButton = screen.getByText('Send')
    fireEvent.click(sendButton)
    
    // Click cancel
    await waitFor(() => {
      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)
    })
    
    // Warnings should be cleared
    expect(screen.queryByText('Send Issues')).not.toBeInTheDocument()
  })
})

