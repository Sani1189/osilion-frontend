import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { QueryProvider } from "@/components/query-provider"
import { ColorSchemeProvider } from "@/hooks/use-color-scheme"
import { WebSocketProvider } from "@/hooks/use-websocket"
import { NotificationProvider } from "@/hooks/use-notifications"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Osilion X Production",
  description: "Real-time aerospace production tracking platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ColorSchemeProvider>
            <QueryProvider>
              <AuthProvider>
                <WebSocketProvider>
                  <NotificationProvider>
                    {children}
                    <Toaster />
                  </NotificationProvider>
                </WebSocketProvider>
              </AuthProvider>
            </QueryProvider>
          </ColorSchemeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
