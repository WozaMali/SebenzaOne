"use client"

import { Loader2 } from 'lucide-react'

export function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

export function ChunkLoadErrorFallback({ retry }: { retry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold mb-2">Loading Error</h1>
        <p className="text-muted-foreground mb-6">
          Failed to load application resources. This might be due to a network issue or browser cache.
        </p>
        <div className="space-x-4">
          <button
            onClick={retry}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
          >
            Retry
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  )
}
