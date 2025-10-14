import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AgentDesk Chat',
  description: 'AI-powered customer service chatbot',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

