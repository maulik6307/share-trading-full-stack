import type { Metadata } from 'next'
import { Source_Sans_3 } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AuthProvider } from '@/components/providers/auth-provider'
import { ToastProvider } from '@/components/ui/toast'
import { defaultMetadata } from './metadata'
import { OrganizationSchema, WebsiteSchema, SoftwareAppSchema } from '@/components/seo/structured-data'

const sourceSans3 = Source_Sans_3({ 
  subsets: ['latin'],
  weight: ['300', '400', '600', '700', '900'],
  display: 'swap',
})

export const metadata: Metadata = defaultMetadata

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <OrganizationSchema />
        <WebsiteSchema />
        <SoftwareAppSchema />
      </head>
      <body className={sourceSans3.className}>
        <ThemeProvider defaultMode="light">
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}