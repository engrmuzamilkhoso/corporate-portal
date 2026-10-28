'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function UnauthenticatedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const auth = localStorage.getItem('authToken')
    if (auth) {
      router.push('/dashboard/main')
    } else {
      // setIsLoading(false)
    }
  }, [router])
  return <>{children}</>
}
