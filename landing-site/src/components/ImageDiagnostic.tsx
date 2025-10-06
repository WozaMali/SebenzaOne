'use client'

import { useState, useEffect } from 'react'

const ImageDiagnostic = () => {
  const [diagnostics, setDiagnostics] = useState<any[]>([])
  const [baseUrl, setBaseUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setBaseUrl(window.location.origin)
    
    const testImages = [
      { name: 'Hero Background', src: '/SNWG Soweto.jpg', alt: 'SNWG Soweto' },
      { name: 'Green Scholar Logo', src: '/Green Scholar.png', alt: 'Green Scholar' },
      { name: 'Maisha Mascot', src: '/Maisha.png', alt: 'Maisha' },
      { name: 'Land Background', src: '/Land.png', alt: 'Land' },
      { name: 'SNW Logo', src: '/SNW LOGO 1.png', alt: 'SNW Logo' },
      { name: 'SNWG Logo', src: '/SNWG LOGO.png', alt: 'SNWG Logo' },
    ]

    const runDiagnostics = async () => {
      const results = []
      
      for (const image of testImages) {
        const result = {
          ...image,
          status: 'testing',
          fullUrl: `${window.location.origin}${image.src}`,
          tests: {
            directAccess: false,
            fetchTest: false,
            imgElement: false,
            error: null
          }
        }

        // Test 1: Direct fetch
        try {
          const response = await fetch(image.src)
          result.tests.fetchTest = response.ok
          if (!response.ok) {
            result.tests.error = `HTTP ${response.status}: ${response.statusText}`
          }
        } catch (error) {
          result.tests.error = `Fetch error: ${error.message}`
        }

        // Test 2: Image element load
        try {
          const img = new Image()
          await new Promise((resolve, reject) => {
            img.onload = () => {
              result.tests.imgElement = true
              resolve(true)
            }
            img.onerror = () => {
              result.tests.imgElement = false
              reject(new Error('Image failed to load'))
            }
            img.src = image.src
          })
        } catch (error) {
          if (!result.tests.error) {
            result.tests.error = `Image element error: ${error.message}`
          }
        }

        // Test 3: Direct access (simulate clicking)
        result.tests.directAccess = result.tests.fetchTest && result.tests.imgElement

        result.status = result.tests.directAccess ? 'success' : 'error'
        results.push(result)
      }

      setDiagnostics(results)
      setIsLoading(false)
    }

    runDiagnostics()
  }, [])

  const openImageDirectly = (src: string) => {
    window.open(`${baseUrl}${src}`, '_blank')
  }

  const copyImageUrl = (src: string) => {
    navigator.clipboard.writeText(`${baseUrl}${src}`)
  }

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="text-lg">Running image diagnostics...</div>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  const successCount = diagnostics.filter(d => d.status === 'success').length
  const errorCount = diagnostics.filter(d => d.status === 'error').length

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Image Loading Diagnostic</h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="font-medium">Base URL:</div>
            <div className="text-gray-600 break-all">{baseUrl}</div>
          </div>
          <div>
            <div className="font-medium">Total Images:</div>
            <div className="text-gray-600">{diagnostics.length}</div>
          </div>
          <div>
            <div className="font-medium text-green-600">Working:</div>
            <div className="text-green-600 font-bold">{successCount}</div>
          </div>
          <div>
            <div className="font-medium text-red-600">Failed:</div>
            <div className="text-red-600 font-bold">{errorCount}</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {diagnostics.map((diag, index) => (
          <div key={index} className={`border rounded-lg p-4 ${
            diag.status === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{diag.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => openImageDirectly(diag.src)}
                  className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded text-sm"
                >
                  Test Direct
                </button>
                <button
                  onClick={() => copyImageUrl(diag.src)}
                  className="px-3 py-1 bg-green-100 hover:bg-green-200 rounded text-sm"
                >
                  Copy URL
                </button>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 mb-2">
              <div>Path: <code>{diag.src}</code></div>
              <div>Full URL: <code className="break-all">{diag.fullUrl}</code></div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className={`p-2 rounded ${
                diag.tests.fetchTest ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <div className="font-medium">Fetch Test</div>
                <div>{diag.tests.fetchTest ? '✅ Pass' : '❌ Fail'}</div>
              </div>
              <div className={`p-2 rounded ${
                diag.tests.imgElement ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <div className="font-medium">Image Element</div>
                <div>{diag.tests.imgElement ? '✅ Pass' : '❌ Fail'}</div>
              </div>
              <div className={`p-2 rounded ${
                diag.tests.directAccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <div className="font-medium">Direct Access</div>
                <div>{diag.tests.directAccess ? '✅ Pass' : '❌ Fail'}</div>
              </div>
            </div>

            {diag.tests.error && (
              <div className="mt-2 p-2 bg-red-100 text-red-800 rounded text-sm">
                <div className="font-medium">Error:</div>
                <div>{diag.tests.error}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Troubleshooting Steps:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li><strong>If Fetch Test fails:</strong> Server/deployment issue - images not being served</li>
          <li><strong>If Image Element fails but Fetch passes:</strong> CORS or security issue</li>
          <li><strong>If both fail:</strong> Check if the image files exist in the build output</li>
          <li><strong>If Direct Access works but site doesn't:</strong> CSS or HTML rendering issue</li>
          <li><strong>Check browser console</strong> for any error messages</li>
        </ol>
      </div>
    </div>
  )
}

export default ImageDiagnostic
