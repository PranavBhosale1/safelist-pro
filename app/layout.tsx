// app/layout.tsx or app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Toaster } from 'sonner';
import Head from 'next/head';
import { Suspense } from 'react'
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Safelist',
  description: 'A trusted peer-to-peer marketplace to securely trade pre-IPO shares.',
  metadataBase: new URL('https://safelist.com'),
  openGraph: {
    title: 'Safelist',
    description: 'A trusted peer-to-peer marketplace to securely trade pre-IPO shares.',
    url: 'https://safelist.com',
    siteName: 'Safelist',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Safelist - Pre-IPO Marketplace',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Safelist',
    description: 'A trusted peer-to-peer marketplace to securely trade pre-IPO shares.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <Head>
        {/* ✅ Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* ✅ Open Graph & Twitter Fallback for social media bots */}
        <meta property="og:title" content="Safelist" />
        <meta property="og:description" content="A trusted peer-to-peer marketplace to securely trade pre-IPO shares." />
        <meta property="og:image" content="/favicon.png" />
        <meta property="og:url" content="https://safelist.com" />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Safelist" />
        <meta name="twitter:description" content="A trusted peer-to-peer marketplace to securely trade pre-IPO shares." />
        <meta name="twitter:image" content="/og-image.png" />
      </Head>

      <body className={inter.className}>
         <Suspense fallback={<div>Loading...</div>}>
           <Providers>
             <Toaster />
             {children}
           </Providers>
         </Suspense>
      </body>
    </html>
  );
}
