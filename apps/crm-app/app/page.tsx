'use client'

import dynamic from 'next/dynamic'

// Dynamically import the CRMPage to reduce initial bundle size
const CRMPage = dynamic(() => import('@/components/CRMPage'), {
  loading: () => <div className="flex items-center justify-center min-h-screen">Loading CRM...</div>,
  ssr: false
})

export default function HomePage() {
  return <CRMPage />
}
