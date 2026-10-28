'use client'

import { useAuth } from '@/AuthContext'
import { AppFooter, AppHeader } from '@/components'
import { NavigationItem, selectNavItems, selectPrivileges, useTypedSelector } from '@/store'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import ErrorBoundary from '../ErrorBoundary'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import useInactivityLogout from '@/hooks/useInactivityLogout'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false)
  const router = useRouter()
  const { isAuthenticated, logout } = useAuth()
  const location = usePathname()

  // eslint-disable-next-line no-unused-vars
  const navItems: NavigationItem[] = useTypedSelector(selectNavItems)
  const flatNavItems: NavigationItem[] = useTypedSelector(selectPrivileges)

  useLocalStorage('navItems', {
    defaultValue: [],
    onChange: (newValue, oldValue) => {
      // logout()
      console.log('Value changed:', { oldValue, newValue })
    },
  })

  useLocalStorage('authToken', {
    onChange: (newValue, oldValue) => {
      // logout()
      console.log('Value changed:', { oldValue, newValue })
    },
  })

  useInactivityLogout(() => {
    console.log('Inactivity Logout')

    logout("inactivity")
  })

  function isPathInNavigation(items: NavigationItem[], pathToCheck: string): boolean {
    const getCurrentPathCode = getPathCode(pathToCheck)

    if (!getCurrentPathCode) {
      return false
    }

    const codes = getAllPathsCode(items)
    return codes.includes(getCurrentPathCode.code)
  }

  function getPathCode(path: string) {
    return flatNavItems.find((item) => item.path == path)
  }

  function getAllPaths(items: NavigationItem[]): string[] {
    let paths: string[] = []

    items.forEach((item) => {
      // console.log(item)

      paths.push(item.path)
      if (item.children.length > 0) {
        paths = paths.concat(getAllPaths(item.children))
      }
    })

    return paths
  }

  function getAllPathsCode(items: NavigationItem[]): string[] {
    return flatNavItems.map((item) => item.code)
  }

  useEffect(() => {
    setHasMounted(true) // Indicates that the component has mounted
  }, [])

  useEffect(() => {
    try {
      if (!hasMounted) return

      if (!isAuthenticated) {
        router.push('/login')
      } else if (
        isAuthenticated &&
        ['/login', '/register', '/change-password', '/forget-password'].some((path) =>
          location.includes(path),
        )
      ) {
        router.push('/dashboard')
      } else if (location !== '/e403' && location !== '/') {
        const isPathAuthenticated = isPathInNavigation(navItems, location)
        if (!isPathAuthenticated) {
          router.push('/e403')
        }
      }
    } catch (error) {
      console.log(error)

      router.push('/login')
    }
  }, [isAuthenticated, router, hasMounted, location])

  if (!hasMounted || !isAuthenticated) {
    return null
  }

  return (
    <>
      {/* <AppSidebar /> */}
      <div className="wrapper d-flex flex-column min-vh-100">
        <div className="p-1"></div>
        <AppHeader />
        <div className="body flex-grow-1 px-2">
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
        <AppFooter />
      </div>
      {/*<AppAside />*/}
    </>
  )
}
