const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export class ApiClientError extends Error {
  readonly statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.name = 'ApiClientError'
    this.statusCode = statusCode
  }
}

// No login flow exists yet (see context/architecture.md). This seam stays inert
// until a real auth flow is wired, so call sites never need to change.
function getAuthToken(): string | null {
  return null
}

function onUnauthorized(): void {
  // no-op until a real auth flow exists
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

  const response = await fetch(`${BASE_URL}${path}`, {
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
