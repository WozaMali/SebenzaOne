"use client"

import { ReactNode } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { TopNavigation } from "@/components/TopNavigation"
import { ConnectBar } from "@/components/connect/ConnectBar"
import { useState } from "react"
import { usePathname } from "next/navigation"

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [activeChats, setActiveChats] = useState<Array<{ id: string; person: any; unreadCount: number }>>([])
  const pathname = usePathname()
  const isCalendarPage = pathname === '/calendar'

  // Debug logging
  console.log('Current pathname:', pathname)
  console.log('Is calendar page:', isCalendarPage)

  const handleOpenChat = (person: any) => {
    const exists = activeChats.find(c => c.person.id === person.id)
    if (!exists) setActiveChats(prev => prev.concat({ id: `chat-${person.id}-${Date.now()}`, person, unreadCount: 0 }))
  }
  const handleCloseChat = (chatId: string) => setActiveChats(prev => prev.filter(c => c.id !== chatId))

  return (
    <SidebarProvider defaultOpen={true}>
      <style dangerouslySetInnerHTML={{
        __html: `
          main {
            padding-top: 4rem !important;
            margin-top: 0 !important;
          }
          main > div:first-child {
            margin-top: 0 !important;
            padding-top: 0 !important;
          }
        `
      }} />
      <div className="h-screen w-screen flex bg-background" style={{maxWidth: '100vw', overflow: 'hidden', height: '100vh'}}>
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0" style={{width: '100%', maxWidth: '100%'}}>
          <TopNavigation />
          <main className="flex-1 bg-gradient-to-br from-background via-background to-muted/20 pl-6 pr-0 py-6" style={{
            width: '100%', 
            maxWidth: '100%', 
            position: 'relative', 
            paddingTop: '4rem', // 64px for top navigation
            marginTop: '0', 
            zIndex: '1',
            padding: '1.5rem 1.5rem 1.5rem 0'
          }}>
            {children}
          </main>
        </div>
        <ConnectBar onOpenChat={handleOpenChat} activeChats={activeChats} onCloseChat={handleCloseChat} />
      </div>
    </SidebarProvider>
  )
}