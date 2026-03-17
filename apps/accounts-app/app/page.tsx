'use client'

import dynamic from 'next/dynamic'

// Dynamically import the AccountingPage to reduce initial bundle size
const AccountingPage = dynamic(() => import('@/components/AccountingPage'), {
  loading: () => <div className="flex items-center justify-center min-h-screen">Loading Accounting...</div>,
  ssr: false
})

export default function HomePage() {
  return <AccountingPage />
}
