'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  name: string
  emailVerified: boolean
  plan: string
  status: string
}

interface AnonymousSession {
  id: string
  forms: string[]
  createdAt: Date
  lastActivity: Date
  expiresAt: Date
  userAgent: string
  ipAddress: string
}

interface UserContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  isAnonymous: boolean
  anonymousUserId: string | null
  anonymousSession: AnonymousSession | null
  login: (userData: User, token: string) => void
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  checkAuthStatus: () => Promise<void>
  createAnonymousSession: () => Promise<string>
  migrateAnonymousForms: (realUserId: string) => Promise<boolean>
  getCurrentUserId: () => string | null
}

const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
  children: ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [anonymousUserId, setAnonymousUserId] = useState<string | null>(null)
  const [anonymousSession, setAnonymousSession] = useState<AnonymousSession | null>(null)

  const isAuthenticated = !!user && !!token
  const isAnonymous = !isAuthenticated && !!anonymousUserId

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true)
      
      // Check if user data exists in localStorage
      const storedUser = localStorage.getItem('user')
      const storedToken = localStorage.getItem('token')
      const storedAnonymousUserId = localStorage.getItem('anonymousUserId')
      
      if (storedUser && storedToken) {
        const userData = JSON.parse(storedUser)
        
        // Verify token with backend
        const apiUrl = process.env.NEXT_PUBLIC_RAILWAY_URL
        const response = await fetch(`${apiUrl}/auth/session`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setUser(userData)
            setToken(storedToken)
            // Clear any anonymous session when authenticated
            setAnonymousUserId(null)
            setAnonymousSession(null)
            localStorage.removeItem('anonymousUserId')
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('user')
            localStorage.removeItem('token')
            setUser(null)
            setToken(null)
          }
        } else {
          // Session check failed, clear storage
          localStorage.removeItem('user')
          localStorage.removeItem('token')
          setUser(null)
          setToken(null)
        }
      } else if (storedAnonymousUserId) {
        // Restore anonymous session
        setAnonymousUserId(storedAnonymousUserId)
        // Note: We don't restore the full session object as it's not needed for basic functionality
      }
    } catch (error) {
      console.error('Auth status check error:', error)
      // Clear storage on error
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      localStorage.removeItem('anonymousUserId')
      setUser(null)
      setToken(null)
      setAnonymousUserId(null)
      setAnonymousSession(null)
    } finally {
      setIsLoading(false)
    }
  }

  const createAnonymousSession = async (): Promise<string> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_RAILWAY_URL
      
      // Create a test form to trigger anonymous session creation
      const testFormData = {
        formData: {
          id: `temp_${Date.now()}`,
          schema: {
            title: 'Temporary Form',
            fields: []
          }
        },
        metadata: {
          title: 'Temporary Form',
          isHipaa: false,
          isPublished: false
        }
      }

      const response = await fetch(`${apiUrl}/store-form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testFormData)
      })

      if (response.ok) {
        const data = await response.json()
        const tempUserId = data.userId || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        setAnonymousUserId(tempUserId)
        localStorage.setItem('anonymousUserId', tempUserId)
        
        console.log('✅ Anonymous session created:', tempUserId)
        return tempUserId
      } else {
        throw new Error('Failed to create anonymous session')
      }
    } catch (error) {
      console.error('Error creating anonymous session:', error)
      // Fallback: create a local temporary ID
      const fallbackId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setAnonymousUserId(fallbackId)
      localStorage.setItem('anonymousUserId', fallbackId)
      return fallbackId
    }
  }

  const migrateAnonymousForms = async (realUserId: string): Promise<boolean> => {
    try {
      if (!anonymousUserId) {
        console.log('No anonymous forms to migrate')
        return true
      }

      const apiUrl = process.env.NEXT_PUBLIC_RAILWAY_URL
      const response = await fetch(`${apiUrl}/api/forms/migrate-anonymous`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tempUserId: anonymousUserId,
          realUserId: realUserId
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Forms migrated successfully:', data)
        
        // Clear anonymous session
        setAnonymousUserId(null)
        setAnonymousSession(null)
        localStorage.removeItem('anonymousUserId')
        
        return true
      } else {
        console.error('Failed to migrate forms:', response.status)
        return false
      }
    } catch (error) {
      console.error('Error migrating forms:', error)
      return false
    }
  }

  const getCurrentUserId = (): string | null => {
    if (isAuthenticated && user) {
      return user.id
    } else if (isAnonymous && anonymousUserId) {
      return anonymousUserId
    }
    return null
  }

  const login = async (userData: User, userToken: string) => {
    // Migrate anonymous forms if they exist
    if (anonymousUserId) {
      await migrateAnonymousForms(userData.id)
    }
    
    setUser(userData)
    setToken(userToken)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', userToken)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  const value: UserContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    isAnonymous,
    anonymousUserId,
    anonymousSession,
    login,
    logout,
    updateUser,
    checkAuthStatus,
    createAnonymousSession,
    migrateAnonymousForms,
    getCurrentUserId,
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
