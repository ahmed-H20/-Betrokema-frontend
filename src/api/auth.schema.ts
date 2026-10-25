export type UserRole = 'admin' | 'seller' | 'client' | 'manager' | 'accountant'

export interface AuthUser {
  id: string
  name: string
  code: string
  role: UserRole
  email?: string
  phone?: string
  sellerProfile?: {
    _id: string
    name: string
    code?: string
    phone?: string
    governorate?: string
    monthlyTarget?: number
    commissionRate?: number
  } | null
  clientProfile?: {
    _id: string
    name: string
    organizeName?: string
    clientCode?: string
    seller?: string | { _id?: string; name?: string; phone?: string; code?: string; title?: string } | null
    creditLimit?: number
    currentDebt?: number
    paymentStatus?: string
    commercialType?: string
  } | null
}

export interface LoginCredentials {
  code: string
  password: string
}

export interface LoginResponse {
  status: string
  message: string
  token: string
  data: AuthUser
}

export interface GetMeResponse {
  status: string
  data: AuthUser
}
