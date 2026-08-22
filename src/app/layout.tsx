import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Hostel Marketplace — Share What You Have. Get What You Need.',
    template: '%s | Hostel Marketplace',
  },
  description: 'A verified-student marketplace for campus hostels. Buy, sell, lend, borrow, exchange, or donate useful resources with verified students around your campus.',
  keywords: ['hostel marketplace', 'student marketplace', 'college marketplace', 'buy sell lend borrow exchange donate', 'student secondhand'],
  authors: [{ name: 'Hostel Marketplace' }],
  openGraph: {
    type: 'website',
    title: 'Hostel Marketplace',
    description: 'Share What You Have. Get What You Need.',
    siteName: 'Hostel Marketplace',
  },
}

import { Navbar } from '@/components/ui/Navbar'
import { ThemeProvider } from '@/components/theme/ThemeProvider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className="dark"
      data-theme="dark"
      data-scroll-behavior="smooth"
      style={{ colorScheme: 'dark', backgroundColor: '#0B0E17' }}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#0B0E17] text-[#E2E8F0]" style={{ fontFamily: "'Inter', sans-serif", WebkitFontSmoothing: 'antialiased', margin: 0, padding: 0 }}>
        <ThemeProvider>
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
