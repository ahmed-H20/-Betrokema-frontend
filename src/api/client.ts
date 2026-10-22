import type { AuthUser } from './auth.schema'

const RAW_BASE: string = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'
const BASE_URL: string = RAW_BASE.replace(/\/+$/, '')

export class ApiClientError extends Error {
  readonly statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.name = 'ApiClientError'
    this.statusCode = statusCode
  }
}

export const AUTH_TOKEN_KEY = 'petrokema_auth_token'
export const AUTH_USER_KEY = 'petrokema_auth_user'

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY)
  } catch {
    return null
  }
}

export function setAuthSession(token: string, user: AuthUser): void {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
  } catch (e) {
    console.error('Failed to save auth session', e)
  }
}

export function clearAuthSession(): void {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
  } catch (e) {
    console.error('Failed to clear auth session', e)
  }
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

function onUnauthorized(): void {
  clearAuthSession()
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & { body?: unknown }

export async function request<TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const token = getAuthToken()
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const response = await fetch(`${BASE_URL}${normalizedPath}`, {
    ...options,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  if (response.status === 401) onUnauthorized()

  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      body !== null &&
      typeof body === 'object' &&
      'message' in body &&
      typeof body.message === 'string'
        ? body.message
        : 'حدث خطأ غير متوقع'
    throw new ApiClientError(message, response.status)
  }

  return body as TResponse
}
