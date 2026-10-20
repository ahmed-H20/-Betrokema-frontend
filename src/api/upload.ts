import { getAuthToken, ApiClientError } from './client'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export interface UploadFileResult {
  url: string
  path: string
  filename: string
  originalName: string
  mimetype: string
  size: number
}

export interface UploadSingleResponse {
  status: 'success'
  message: string
  file: UploadFileResult
  url: string
  path: string
}

export interface UploadMultipleResponse {
  status: 'success'
  message: string
  results: number
  files: UploadFileResult[]
  urls: string[]
  paths: string[]
}

export async function uploadSingleImage(
  file: File,
  type = 'general',
): Promise<UploadSingleResponse> {
  const token = getAuthToken()
  const formData = new FormData()
  formData.append('file', file)

  const headers = new Headers()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(
    `${BASE_URL}/upload/single?type=${encodeURIComponent(type)}`,
    {
      method: 'POST',
      headers,
      body: formData,
    },
  )

  const body = (await response.json().catch(() => null)) as
    | UploadSingleResponse
    | { message?: string }
    | null

  if (!response.ok) {
    const message =
      (body && 'message' in body && body.message) || 'تعذر رفع الصورة'
    throw new ApiClientError(message, response.status)
  }

  return body as UploadSingleResponse
}

export async function uploadMultipleImages(
  files: File[],
  type = 'products',
): Promise<UploadMultipleResponse> {
  const token = getAuthToken()
  const formData = new FormData()
  files.forEach((f) => formData.append('files', f))

  const headers = new Headers()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(
    `${BASE_URL}/upload/multiple?type=${encodeURIComponent(type)}`,
    {
      method: 'POST',
      headers,
      body: formData,
    },
  )

  const body = (await response.json().catch(() => null)) as
    | UploadMultipleResponse
    | { message?: string }
    | null

  if (!response.ok) {
    const message =
      (body && 'message' in body && body.message) || 'تعذر رفع الصور'
    throw new ApiClientError(message, response.status)
  }

  return body as UploadMultipleResponse
}
