import React from 'react'
import { ErrorBoundary } from '../../components/ErrorBoundary'

export const metadata = {
  title: 'Blog CMS',
  description: 'Content Management System',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}