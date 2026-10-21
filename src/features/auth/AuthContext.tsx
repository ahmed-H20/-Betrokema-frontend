import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { AuthUser, LoginCredentials, UserRole } from '@/api/auth.schema'
import { getMe, login as loginApi } from '@/api/auth'
import {
  clearAuthSession,
  getAuthToken,
  getStoredUser,
  setAuthSession,
} from '@/api/client'

export interface RoleDescriptor {
  role: UserRole
  label: string
  icon: string
  badgeTone: 'primary' | 'secondary' | 'neutral'
}

export function detectRoleFromCode(rawCode: string): RoleDescriptor | null {
  const code = (rawCode || '').trim().toUpperCase()
  if (!code) return null

  if (code.startsWith('PK') || code.startsWith('REP') || code.startsWith('SEL')) {
    return {
      role: 'seller',
      label: 'مندوب مبيعات',
      icon: 'badge',
      badgeTone: 'secondary',
    }
  }

  if (code.startsWith('CLI') || code.startsWith('CUST')) {
    return {
      role: 'client',
      label: 'عميل / معرض طلاء',
      icon: 'storefront',
      badgeTone: 'neutral',
    }
  }

  if (code === 'ADMIN' || code.startsWith('ADM')) {
    return {
      role: 'admin',
      label: 'مسؤول النظام',
      icon: 'admin_panel_settings',
      badgeTone: 'primary',
    }
  }

  return null
}

export function getDefaultRouteForRole(role: UserRole): string {
  switch (role) {
    case 'admin':
    case 'manager':
      return '/products'
    case 'seller':
      return '/seller/dashboard'
    case 'client':
      return '/client'
    default:
      return '/products'
  }
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  role: UserRole | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<AuthUser>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getAuthToken())
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser())
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Verify stored session on app load
  useEffect(() => {
    let isMounted = true
    const storedToken = getAuthToken()
    if (!storedToken) {
      setIsLoading(false)
      return
    }

    getMe()
      .then((res) => {
        if (!isMounted) return
        setUser(res.data)
        setAuthSession(storedToken, res.data)
      })
      .catch(() => {
        if (!isMounted) return
        clearAuthSession()
        setToken(null)
        setUser(null)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthUser> => {
    const res = await loginApi(credentials)
    setAuthSession(res.token, res.data)
    setToken(res.token)
    setUser(res.data)
    return res.data
  }, [])

  const logout = useCallback(() => {
    clearAuthSession()
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      role: user?.role ?? null,
      isAuthenticated: Boolean(token && user),
      isLoading,
      login,
      logout,
    }),
    [user, token, isLoading, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
