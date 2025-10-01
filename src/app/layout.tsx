import React from 'react'

export const metadata = {
  title: 'Blog CMS',
  description: 'Content Management System',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}