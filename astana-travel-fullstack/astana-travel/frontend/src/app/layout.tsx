// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'ASTANA HAJJ & UMROH TRAVEL',
  description: 'Perjalanan Satu Anda, Komitmen Kami. Umroh berkualitas dengan pembimbing berpengalaman sesuai syariat.',
  keywords: 'umroh, haji, travel umroh, lamongan, paciran, astana',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster position="top-right" toastOptions={{
          style: { fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '14px' },
          success: { iconTheme: { primary: '#4A7FA7', secondary: '#fff' } },
        }} />
      </body>
    </html>
  )
}
