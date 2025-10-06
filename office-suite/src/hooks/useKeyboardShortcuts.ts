"use client"

import { useEffect, useCallback } from 'react'
import { KeyboardShortcut } from '@/types/mail'

interface UseKeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[]
  onAction: (action: string) => void
  enabled?: boolean
}

export function useKeyboardShortcuts({ 
  shortcuts, 
  onAction, 
  enabled = true 
}: UseKeyboardShortcutsProps) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true' ||
      target.isContentEditable
    ) {
      return
    }

    const pressedKey = event.key.toLowerCase()
    const isCtrl = event.ctrlKey || event.metaKey
    const isAlt = event.altKey
    const isShift = event.shiftKey

    // Find matching shortcut
    const matchingShortcut = shortcuts.find(shortcut => {
      return (
        shortcut.key.toLowerCase() === pressedKey &&
        !!shortcut.ctrlKey === isCtrl &&
        !!shortcut.altKey === isAlt &&
        !!shortcut.shiftKey === isShift
      )
    })

    if (matchingShortcut) {
      event.preventDefault()
      event.stopPropagation()
      onAction(matchingShortcut.action)
    }
  }, [shortcuts, onAction, enabled])

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [handleKeyDown, enabled])
}

// Default keyboard shortcuts for compose
export const COMPOSE_SHORTCUTS: KeyboardShortcut[] = [
  // Send and save
  { key: 'Enter', ctrlKey: true, action: 'send', description: 'Send message' },
  { key: 's', ctrlKey: true, action: 'save_draft', description: 'Save draft' },
  { key: 'Escape', action: 'close_compose', description: 'Close compose' },
  
  // Formatting
  { key: 'b', ctrlKey: true, action: 'bold', description: 'Bold text' },
  { key: 'i', ctrlKey: true, action: 'italic', description: 'Italic text' },
  { key: 'u', ctrlKey: true, action: 'underline', description: 'Underline text' },
  { key: 'k', ctrlKey: true, action: 'insert_link', description: 'Insert link' },
  
  // Lists
  { key: '7', ctrlKey: true, shiftKey: true, action: 'bullet_list', description: 'Bullet list' },
  { key: '8', ctrlKey: true, shiftKey: true, action: 'numbered_list', description: 'Numbered list' },
  
  // Alignment
  { key: 'l', ctrlKey: true, shiftKey: true, action: 'align_left', description: 'Align left' },
  { key: 'e', ctrlKey: true, shiftKey: true, action: 'align_center', description: 'Align center' },
  { key: 'r', ctrlKey: true, shiftKey: true, action: 'align_right', description: 'Align right' },
  { key: 'j', ctrlKey: true, shiftKey: true, action: 'align_justify', description: 'Align justify' },
  
  // Undo/Redo
  { key: 'z', ctrlKey: true, action: 'undo', description: 'Undo' },
  { key: 'y', ctrlKey: true, action: 'redo', description: 'Redo' },
  { key: 'z', ctrlKey: true, shiftKey: true, action: 'redo', description: 'Redo (alternative)' },
  
  // Attachments and media
  { key: 'a', ctrlKey: true, shiftKey: true, action: 'attach_file', description: 'Attach file' },
  { key: 'i', ctrlKey: true, shiftKey: true, action: 'insert_image', description: 'Insert image' },
  
  // Templates and signatures
  { key: 't', ctrlKey: true, shiftKey: true, action: 'insert_template', description: 'Insert template' },
  { key: 's', ctrlKey: true, shiftKey: true, action: 'insert_signature', description: 'Insert signature' },
  
  // Priority and options
  { key: '1', ctrlKey: true, shiftKey: true, action: 'priority_low', description: 'Set priority to low' },
  { key: '2', ctrlKey: true, shiftKey: true, action: 'priority_normal', description: 'Set priority to normal' },
  { key: '3', ctrlKey: true, shiftKey: true, action: 'priority_high', description: 'Set priority to high' },
  
  // Recipients
  { key: 'c', ctrlKey: true, shiftKey: true, action: 'toggle_cc', description: 'Toggle CC field' },
  { key: 'b', ctrlKey: true, shiftKey: true, action: 'toggle_bcc', description: 'Toggle BCC field' },
  
  // Schedule and delegate
  { key: 's', ctrlKey: true, altKey: true, action: 'schedule_send', description: 'Schedule send' },
  { key: 'd', ctrlKey: true, altKey: true, action: 'delegate_send', description: 'Delegate send' },
  
  // Security
  { key: 'e', ctrlKey: true, altKey: true, action: 'toggle_encrypt', description: 'Toggle encryption' },
  { key: 's', ctrlKey: true, altKey: true, shiftKey: true, action: 'toggle_sign', description: 'Toggle digital signature' },
  
  // Help
  { key: '?', ctrlKey: true, action: 'show_help', description: 'Show keyboard shortcuts' },
]

// Default keyboard shortcuts for mail view
export const MAIL_VIEW_SHORTCUTS: KeyboardShortcut[] = [
  // Navigation
  { key: 'j', action: 'next_message', description: 'Next message' },
  { key: 'k', action: 'previous_message', description: 'Previous message' },
  { key: 'Enter', action: 'open_message', description: 'Open selected message' },
  { key: 'Escape', action: 'close_message', description: 'Close message view' },
  
  // Actions
  { key: 'r', action: 'reply', description: 'Reply to message' },
  { key: 'a', action: 'reply_all', description: 'Reply all' },
  { key: 'f', action: 'forward', description: 'Forward message' },
  { key: 'c', action: 'compose', description: 'Compose new message' },
  { key: 'd', action: 'delete', description: 'Delete message' },
  { key: 'x', action: 'archive', description: 'Archive message' },
  { key: 's', action: 'star', description: 'Star/unstar message' },
  { key: '!', action: 'mark_important', description: 'Mark as important' },
  
  // Selection
  { key: 'x', ctrlKey: true, action: 'select_message', description: 'Select message' },
  { key: 'a', ctrlKey: true, action: 'select_all', description: 'Select all messages' },
  { key: 'n', ctrlKey: true, action: 'select_none', description: 'Deselect all messages' },
  
  // Search and filter
  { key: '/', action: 'focus_search', description: 'Focus search box' },
  { key: 'g', action: 'go_to_inbox', description: 'Go to inbox' },
  { key: 'g', shiftKey: true, action: 'go_to_sent', description: 'Go to sent' },
  { key: 'g', ctrlKey: true, action: 'go_to_drafts', description: 'Go to drafts' },
  
  // Refresh and sync
  { key: 'r', ctrlKey: true, action: 'refresh', description: 'Refresh messages' },
  { key: 'u', ctrlKey: true, action: 'mark_read', description: 'Mark as read' },
  { key: 'u', ctrlKey: true, shiftKey: true, action: 'mark_unread', description: 'Mark as unread' },
  
  // Help
  { key: '?', action: 'show_help', description: 'Show keyboard shortcuts' },
]

// Hook for managing keyboard shortcuts
export function useComposeShortcuts(onAction: (action: string) => void, enabled = true) {
  return useKeyboardShortcuts({
    shortcuts: COMPOSE_SHORTCUTS,
    onAction,
    enabled
  })
}

export function useMailViewShortcuts(onAction: (action: string) => void, enabled = true) {
  return useKeyboardShortcuts({
    shortcuts: MAIL_VIEW_SHORTCUTS,
    onAction,
    enabled
  })
}

