'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

const ImageTest = () => {
  const [imageStatus, setImageStatus] = useState<Record<string, 'loading' | 'loaded' | 'error'>>({})
  
  const images = [
    { src: '/SNWG Soweto.jpg', alt: 'SNWG Soweto' },
    { src: '/Green Scholar.png', alt: 'Green Scholar' },
    { src: '/Maisha.png', alt: 'Maisha' },
    { src: '/Land.png', alt: 'Land' },
    { src: '/SNW LOGO 1.png', alt: 'SNW Logo' },
    { src: '/SNWG LOGO.png', alt: 'SNWG Logo' },
  ]

  const handleImageLoad = (src: string) => {
    setImageStatus(prev => ({ ...prev, [src]: 'loaded' }))
  }

  const handleImageError = (src: string) => {
    setImageStatus(prev => ({ ...prev, [src]: 'error' }))
  }

  useEffect(() => {
    // Initialize all images as loading
    const initialStatus: Record<string, 'loading' | 'loaded' | 'error'> = {}
    images.forEach(img => {
      initialStatus[img.src] = 'loading'
    })
    setImageStatus(initialStatus)
  }, [])

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">Image Loading Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-2">
            <div className="relative h-48 bg-gray-100 rounded">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-contain"
                onLoad={() => handleImageLoad(image.src)}
                onError={() => handleImageError(image.src)}
                unoptimized
              />
            </div>
            <div className="text-sm">
              <p className="font-medium">{image.alt}</p>
              <p className="text-gray-600">{image.src}</p>
              <div className="mt-2">
                {imageStatus[image.src] === 'loading' && (
                  <span className="text-blue-600">🔄 Loading...</span>
                )}
                {imageStatus[image.src] === 'loaded' && (
                  <span className="text-green-600">✅ Loaded</span>
                )}
                {imageStatus[image.src] === 'error' && (
                  <span className="text-red-600">❌ Error</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-bold mb-2">Test Results:</h3>
        <p>Loaded: {Object.values(imageStatus).filter(status => status === 'loaded').length} / {images.length}</p>
        <p>Errors: {Object.values(imageStatus).filter(status => status === 'error').length}</p>
        <p>Loading: {Object.values(imageStatus).filter(status => status === 'loading').length}</p>
      </div>
    </div>
  )
}

export default ImageTest
