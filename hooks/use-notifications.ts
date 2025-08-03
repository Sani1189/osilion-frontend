"use client"

import { createContext, useContext, useEffect, useState } from "react"
import * as React from "react"
import { useWebSocket } from "./use-websocket"

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  timestamp: string
  read: boolean
  entityType?: "product" | "project" | "item"
  entityId?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { socket, isConnected } = useWebSocket()

  // Load notifications from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("notifications")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setNotifications(parsed)
      } catch (error) {
        console.error("Failed to parse stored notifications:", error)
      }
    }
  }, [])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications))
  }, [notifications])

  // Listen for WebSocket notifications
  useEffect(() => {
    if (!socket) return

    const handleNotification = (data: any) => {
      addNotification({
        title: data.title || "New Update",
        message: data.message || "Something has been updated",
        type: data.type || "info",
        entityType: data.entityType,
        entityId: data.entityId,
      })
    }

    const handleItemStatusChange = (data: any) => {
      addNotification({
        title: "Item Status Updated",
        message: `Item ${data.serialNumber} status changed to ${data.status.replace("_", " ")}`,
        type: "info",
        entityType: "item",
        entityId: data.id,
      })
    }

    const handleProjectUpdate = (data: any) => {
      addNotification({
        title: "Project Updated",
        message: `Project "${data.name}" has been updated`,
        type: "info",
        entityType: "project",
        entityId: data.id,
      })
    }

    const handleProductUpdate = (data: any) => {
      addNotification({
        title: "Product Updated",
        message: `Product "${data.name}" has been updated`,
        type: "info",
        entityType: "product",
        entityId: data.id,
      })
    }

    socket.on("notification", handleNotification)
    socket.on("item:status_changed", handleItemStatusChange)
    socket.on("project:updated", handleProjectUpdate)
    socket.on("product:updated", handleProductUpdate)

    return () => {
      socket.off("notification", handleNotification)
      socket.off("item:status_changed", handleItemStatusChange)
      socket.off("project:updated", handleProjectUpdate)
      socket.off("product:updated", handleProductUpdate)
    }
  }, [socket])

  const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      read: false,
    }

    setNotifications((prev) => [newNotification, ...prev].slice(0, 50)) // Keep only latest 50
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return React.createElement(
    NotificationContext.Provider,
    {
      value: {
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      },
    },
    children,
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
