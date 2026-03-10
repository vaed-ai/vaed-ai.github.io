import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import { ThemeProvider } from './theme-provider'

export const metadata: Metadata = {
  title: 'væd.ai',
  description: 'Будь Всеведущ',
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
