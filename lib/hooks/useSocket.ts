import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import type { ChatMessage } from '@/lib/types/chat'

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const callbackRef = useRef<((message: ChatMessage) => void) | null>(null)

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL
    if (!url) return

    const socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
    })

    socket.on('connect', () => {
      setConnected(true)
    })
    socket.on('disconnect', () => {
      setConnected(false)
    })

    socketRef.current = socket

    return () => {
      socket.off()
      socket.disconnect()
      socketRef.current = null
      setConnected(false)
    }
  }, [])

  useEffect(() => {
    const socket = socketRef.current
    if (!socket || !connected) return

    const handler = (data: ChatMessage) => {
      if (callbackRef.current) {
        callbackRef.current(data)
      }
    }

    socket.on('chat-message', handler)

    return () => {
      socket.off('chat-message', handler)
    }
  }, [connected])

  const onChatMessage = useCallback((callback: (message: ChatMessage) => void) => {
    callbackRef.current = callback
    return () => {
      callbackRef.current = null
    }
  }, [])

  return { socket: socketRef.current, connected, onChatMessage }
}
