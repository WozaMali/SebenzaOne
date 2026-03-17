'use client'

import dynamic from 'next/dynamic'

// Dynamically import the ProjectsPage to reduce initial bundle size
const ProjectsPage = dynamic(() => import('@/components/ProjectsPage'), {
  loading: () => <div className="flex items-center justify-center min-h-screen">Loading Projects...</div>,
  ssr: false
})

export default function HomePage() {
  return <ProjectsPage />
}
