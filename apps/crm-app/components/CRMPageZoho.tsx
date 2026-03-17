'use client'

import { useState, useEffect } from 'react'
import { ZohoLayout } from './layout/ZohoLayout'
import { ZohoListView } from './views/ZohoListView'
import { EnhancedDashboard } from './dashboard/EnhancedDashboard'
import { NotificationCenter } from './notifications/NotificationCenter'
import { CommandPalette } from './command/CommandPalette'

// Map our section IDs to Zoho module IDs
const sectionToModuleMap: Record<string, string> = {
  'dashboard': 'dashboard',
  'leads': 'leads',
  'contacts': 'contacts',
  'companies': 'accounts',
  'accounts': 'accounts',
  'deals': 'deals',
  'customers': 'customers',
  'partners': 'partners',
  'collections': 'collections',
  'materials': 'materials',
  'routes': 'routes',
  'invoicing': 'invoices',
  'recycling-analytics': 'analytics',
  'analytics': 'analytics',
  'reports': 'reports',
}

const moduleToSectionMap: Record<string, string> = {
  'dashboard': 'dashboard',
  'leads': 'leads',
  'contacts': 'contacts',
  'accounts': 'companies',
  'deals': 'deals',
  'customers': 'customers',
  'partners': 'partners',
  'collections': 'collections',
  'materials': 'materials',
  'routes': 'routes',
  'invoices': 'invoicing',
  'analytics': 'recycling-analytics',
  'reports': 'reports',
}

interface CRMPageZohoProps {
  activeSection: string
  onSectionChange: (section: string) => void
  sidebarCollapsed: boolean
  onSidebarToggle: () => void
  children: React.ReactNode
  user?: {
    name: string
    email: string
    avatar?: string
  }
}

export function CRMPageZoho({
  activeSection,
  onSectionChange,
  sidebarCollapsed,
  onSidebarToggle,
  children,
  user
}: CRMPageZohoProps) {
  const currentModule = sectionToModuleMap[activeSection] || 'dashboard'
  
  const handleModuleChange = (module: string) => {
    const section = moduleToSectionMap[module] || module
    onSectionChange(section)
  }

  return (
    <ZohoLayout
      activeModule={currentModule}
      onModuleChange={handleModuleChange}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarToggle={onSidebarToggle}
      user={user || { name: 'User', email: 'user@example.com' }}
    >
      {children}
    </ZohoLayout>
  )
}
