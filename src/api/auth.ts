import { request } from './client'
import type {
  GetMeResponse,
  LoginCredentials,
  LoginResponse,
} from './auth.schema'

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: credentials,
  })
}

export async function getMe(): Promise<GetMeResponse> {
  return request<GetMeResponse>('/auth/me', {
    method: 'GET',
  })
}

export async function changePassword(data: {
  currentPassword: string
  newPassword: string
}): Promise<{ status: string; message: string; token: string }> {
  return request('/auth/change-password', {
    method: 'PUT',
    body: data,
  })
}
