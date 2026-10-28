import { useRouter } from 'next/navigation'
import React, { createContext, useContext, useEffect, useState } from 'react'
import store from './store'
import api from './utils/axios'
import { useLocalStorage } from './hooks/useLocalStorage'

const unprotectedRoutes = ['/login', '/forgot-password', '/change-password']

interface AuthContextType {
  isAuthenticated: boolean
  login: (userData: any) => void
  logout: (reason?: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  var token1
  if (typeof window !== 'undefined') {
    token1 = localStorage.getItem('authToken')
  }
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token1)

  const [, setReason] = useLocalStorage('reason')

  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    setIsAuthenticated(!!token)
  }, [])

  const login = (userData: any) => {
    store.dispatch({ type: 'setUserAuth', userAuth: userData })
    localStorage.setItem('authToken', JSON.stringify(userData))

    if (typeof window !== 'undefined') {
      const last_page = localStorage.getItem('last_page')
      if (last_page && !last_page.includes('login')) {
        router.push(last_page)
      } else {
        router.push('/dashboard/main')
      }
      localStorage.removeItem('last_page')
    }
    setIsAuthenticated(true)
  }

  const logout = (reason?: string) => {
    const authData = localStorage.getItem('authToken')
    let token = null
    if (authData) {
      try {
        const parsedData = JSON.parse(authData)
        token = parsedData.token // Access the token key
      } catch (error) {
        console.error('Failed to parse auth token:', error)
      }
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
    api
      .post('/auth/logout', {}, { headers })
      .then((response: any) => {
        console.log('in response', response)
      })
      .catch((error) => {
        console.log(error)
      })

    setTimeout(() => {
      setReason(reason)
      localStorage.removeItem('authToken')
      localStorage.removeItem('navigationHeader')
      setIsAuthenticated(false)
      store.dispatch({ type: 'setNavItems', navItems: [] })

      const params = new URLSearchParams()
      if (reason) params.append('reason', reason)
      router.push(`/login${params.toString() ? '?' + params.toString() : ''}`)
    }, 1000)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const isUnprotectedRoute = (currentRoute: string) => {
  return unprotectedRoutes.includes(currentRoute)
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
