'use client'

import { useState, useEffect } from 'react'

interface ImageDebugInfo {
  src: string
  status: 'loading' | 'loaded' | 'error'
  error?: string
  loadTime?: number
}

const ImageDebugger = () => {
  const [images, setImages] = useState<ImageDebugInfo[]>([])
  const [baseUrl, setBaseUrl] = useState('')

  useEffect(() => {
    setBaseUrl(window.location.origin)
    
    const imageSources = [
      '/SNWG Soweto.jpg',
      '/Green Scholar.png',
      '/Maisha.png',
      '/Land.png',
      '/SNW LOGO 1.png',
      '/SNWG LOGO.png',
      '/Soweto.png',
      '/Phakama Soweto.png',
      '/Sebenza Soweto.png',
      '/hero-landfill.jpg',
      '/favi.png'
    ]

    const testImages = imageSources.map(src => ({
      src,
      status: 'loading' as const
    }))

    setImages(testImages)

    // Test each image
    testImages.forEach((imageInfo, index) => {
      const img = new Image()
      const startTime = Date.now()
      
      img.onload = () => {
        const loadTime = Date.now() - startTime
        setImages(prev => prev.map((img, i) => 
          i === index 
            ? { ...img, status: 'loaded', loadTime }
            : img
        ))
      }
      
      img.onerror = (e) => {
        const loadTime = Date.now() - startTime
        setImages(prev => prev.map((img, i) => 
          i === index 
            ? { 
                ...img, 
                status: 'error', 
                error: `Failed to load after ${loadTime}ms`,
                loadTime 
              }
            : img
        ))
      }
      
      img.src = imageInfo.src
    })
  }, [])

  const testDirectAccess = (src: string) => {
    window.open(`${baseUrl}${src}`, '_blank')
  }

  const copyImageUrl = (src: string) => {
    navigator.clipboard.writeText(`${baseUrl}${src}`)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Image Debugger</h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Debug Information</h2>
        <p><strong>Base URL:</strong> {baseUrl}</p>
        <p><strong>Total Images:</strong> {images.length}</p>
        <p><strong>Loaded:</strong> {images.filter(img => img.status === 'loaded').length}</p>
        <p><strong>Errors:</strong> {images.filter(img => img.status === 'error').length}</p>
        <p><strong>Loading:</strong> {images.filter(img => img.status === 'loading').length}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm truncate">{image.src}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => testDirectAccess(image.src)}
                  className="text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded"
                >
                  Test
                </button>
                <button
                  onClick={() => copyImageUrl(image.src)}
                  className="text-xs bg-green-100 hover:bg-green-200 px-2 py-1 rounded"
                >
                  Copy URL
                </button>
              </div>
            </div>
            
            <div className="text-xs">
              <div className={`inline-block px-2 py-1 rounded ${
                image.status === 'loaded' ? 'bg-green-100 text-green-800' :
                image.status === 'error' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {image.status.toUpperCase()}
              </div>
              {image.loadTime && (
                <span className="ml-2 text-gray-600">
                  ({image.loadTime}ms)
                </span>
              )}
            </div>
            
            {image.error && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                {image.error}
              </div>
            )}
            
            <div className="text-xs text-gray-500">
              Full URL: {baseUrl}{image.src}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Troubleshooting Steps:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Click "Test" to open image in new tab</li>
          <li>If image loads in new tab but not on site, it's a CSS/HTML issue</li>
          <li>If image doesn't load in new tab, it's a server/deployment issue</li>
          <li>Check browser console for any error messages</li>
          <li>Try hard refresh (Ctrl+F5) to clear cache</li>
        </ol>
      </div>
    </div>
  )
}

export default ImageDebugger
