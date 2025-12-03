import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

import { AppHeader } from "@/components/common/AppHeader"
import { BottomNav } from "@/components/common/BottomNav"

import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FitTrack",
  description: "Seu app de treino",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          
          {/* HEADER */}
          <AppHeader />

          {/* MAIN */}
          <main className="flex-1 pb-20">
            {children}
          </main>

          {/* BOTTOM NAV */}
          <BottomNav />

        </ThemeProvider>
      </body>
    </html>
  )
}
