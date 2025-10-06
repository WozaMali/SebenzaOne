import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClientProviders } from '@/components/ClientProviders'
import { MainLayout } from '@/components/MainLayout'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sebenza Suite Interface',
  description: 'A comprehensive business suite interface',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="w-full h-full" style={{overflow: 'hidden'}}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Handle chunk loading errors more robustly
              window.addEventListener('error', function(e) {
                if (e.message && (e.message.includes('Loading chunk') || e.message.includes('Unexpected end of input'))) {
                  console.warn('Chunk loading error detected:', e.message);
                  // Clear any cached chunks
                  if (window.__webpack_require__ && window.__webpack_require__.cache) {
                    Object.keys(window.__webpack_require__.cache).forEach(key => {
                      if (key.includes('mail/page')) {
                        delete window.__webpack_require__.cache[key];
                      }
                    });
                  }
                  setTimeout(() => {
                    window.location.reload();
                  }, 500);
                }
              });
              
              // Handle unhandled promise rejections
              window.addEventListener('unhandledrejection', function(e) {
                if (e.reason && e.reason.message && (e.reason.message.includes('Loading chunk') || e.reason.message.includes('Unexpected end of input'))) {
                  console.warn('Chunk loading promise rejection detected:', e.reason.message);
                  e.preventDefault();
                  setTimeout(() => {
                    window.location.reload();
                  }, 500);
                }
              });
              
              // Add retry mechanism for failed chunks
              if (window.__webpack_require__) {
                const originalRequire = window.__webpack_require__;
                window.__webpack_require__ = function(moduleId) {
                  try {
                    return originalRequire(moduleId);
                  } catch (error) {
                    if (error.message && error.message.includes('Loading chunk')) {
                      console.warn('Retrying chunk load for:', moduleId);
                      setTimeout(() => {
                        window.location.reload();
                      }, 1000);
                    }
                    throw error;
                  }
                };
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.className} w-full h-full`} style={{overflow: 'hidden', margin: 0, padding: 0}}>
        <ErrorBoundary>
          <ClientProviders>
            <MainLayout>
              {children}
            </MainLayout>
          </ClientProviders>
        </ErrorBoundary>
      </body>
    </html>
  )
}
