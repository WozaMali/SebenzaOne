import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sebenza Waste Management - Transforming Soweto Through Recycling',
  description: 'Join Sebenza in creating a cleaner, greener Soweto through innovative waste management and recycling programs that create jobs and build community.',
  keywords: 'waste management, recycling, Soweto, green jobs, sustainability, community development',
  authors: [{ name: 'Sebenza Waste Management' }],
  openGraph: {
    title: 'Sebenza Waste Management - Transforming Soweto Through Recycling',
    description: 'Join Sebenza in creating a cleaner, greener Soweto through innovative waste management and recycling programs that create jobs and build community.',
    type: 'website',
    locale: 'en_ZA',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
