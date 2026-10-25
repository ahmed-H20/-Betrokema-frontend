import { io, Socket } from 'socket.io-client'

let socketInstance: Socket | null = null

export function getSocketUrl(): string {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (apiBase) {
    try {
      const url = new URL(apiBase, window.location.origin)
      return url.origin
    } catch {
      // ignore
    }
  }

  // If running locally in development, default to local server port 3000
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:3000'
  }

  return window.location.origin
}

export function connectSocket(token: string): Socket {
  if (socketInstance?.connected) {
    return socketInstance
  }

  if (socketInstance) {
    socketInstance.disconnect()
  }

  const serverUrl = getSocketUrl()

  socketInstance = io(serverUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  })

  return socketInstance
}

export function getSocket(): Socket | null {
  return socketInstance
}

export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect()
    socketInstance = null
  }
}
