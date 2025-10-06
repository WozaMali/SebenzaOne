'use client'

import { useState, useEffect } from 'react'

interface ImageFallbackProps {
  src: string
  alt: string
  className?: string
  style?: React.CSSProperties
  fallbackSrc?: string
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
}

const ImageFallback = ({ 
  src, 
  alt, 
  className = '', 
  style = {}, 
  fallbackSrc,
  onError,
  onLoad 
}: ImageFallbackProps) => {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setCurrentSrc(src)
    setHasError(false)
    setIsLoading(true)
  }, [src])

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error(`Image failed to load: ${currentSrc}`)
    
    if (!hasError && fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setHasError(true)
      setIsLoading(false)
    } else {
      setHasError(true)
      setIsLoading(false)
    }
    
    onError?.(e)
  }

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false)
    onLoad?.(e)
  }

  // If we have an error and no fallback, show a placeholder
  if (hasError && !fallbackSrc) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={style}
      >
        <div className="text-gray-500 text-center p-4">
          <div className="text-2xl mb-2">🖼️</div>
          <div className="text-sm">Image not available</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {isLoading && (
        <div 
          className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}
          style={style}
        >
          <div className="text-gray-500">Loading...</div>
        </div>
      )}
      <img
        src={currentSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0 absolute' : 'opacity-100'}`}
        style={style}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  )
}

export default ImageFallback
