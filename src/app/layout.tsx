import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Opensignl — Research-grounded content for founders',
  description: 'Opensignl scans Reddit, X, and LinkedIn daily to find what your niche is actually talking about — then generates platform-native posts that perform. Not AI slop. Real signal.',
  openGraph: {
    title: 'Opensignl',
    description: "Research-grounded content for founders who'd rather be known than followed.",
    url: 'https://opensignl.com',
    siteName: 'Opensignl',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Opensignl',
    description: 'Research-grounded content for founders.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
