'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    try {
      router.push('/admin')
    } catch (error) {
      console.error('Redirect failed:', error)
    }
  }, [router])

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <p>Redirecting to admin...</p>
    </div>
  )
}