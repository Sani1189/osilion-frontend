"use client"

import type React from "react"

import { createContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { authApi } from "@/lib/api"

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null
      if (!token) {
        setIsLoading(false)
        return
      }

      const userData = await authApi.me()
      setUser(userData)
    } catch (error) {
      // Clear invalid token
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth-token")
        localStorage.removeItem("user-data")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password)
    if (typeof window !== "undefined") {
      localStorage.setItem("auth-token", response.token)
      localStorage.setItem("user-data", JSON.stringify(response.user))
    }
    setUser(response.user)
  }

  const logout = () => {
    authApi.logout()
    setUser(null)
    router.push("/login")
  }

  // Redirect logic: if not authenticated and not on login page, redirect to login
  useEffect(() => {
    if (!isLoading && !user && pathname !== "/login") {
      router.push("/login")
    }
  }, [user, isLoading, pathname, router])

  return <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>
}
