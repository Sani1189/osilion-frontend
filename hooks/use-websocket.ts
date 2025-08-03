"use client"

import { createContext, useContext, useEffect, useState } from "react"
import * as React from "react"
import { io, type Socket } from "socket.io-client"
import { useAuth } from "./use-auth"

interface WebSocketContextType {
  socket: Socket | null
  isConnected: boolean
  connectionError: string | null
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const socketUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001"
    const token = localStorage.getItem("auth-token")

    const newSocket = io(socketUrl, {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
    })

    newSocket.on("connect", () => {
      console.log("WebSocket connected")
      setIsConnected(true)
      setConnectionError(null)
    })

    newSocket.on("disconnect", () => {
      console.log("WebSocket disconnected")
      setIsConnected(false)
    })

    newSocket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error)
      setConnectionError(error.message)
      setIsConnected(false)
    })

    // Join user-specific room
    newSocket.emit("join", { userId: user.id, role: user.role })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [user])

  return React.createElement(
    WebSocketContext.Provider,
    {
      value: { socket, isConnected, connectionError },
    },
    children,
  )
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider")
  }
  return context
}
