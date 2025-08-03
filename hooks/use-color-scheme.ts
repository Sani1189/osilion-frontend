"use client"

import { createContext, useContext, useEffect, useState } from "react"
import * as React from "react"

export type ColorScheme = {
  name: string
  label: string
  primary: string
  secondary: string
  accent: string
  destructive: string
}

export const colorSchemes: ColorScheme[] = [
  {
    name: "blue",
    label: "Ocean Blue",
    primary: "#3b82f6",
    secondary: "#64748b",
    accent: "#0ea5e9",
    destructive: "#ef4444",
  },
  {
    name: "emerald",
    label: "Emerald Green",
    primary: "#10b981",
    secondary: "#6b7280",
    accent: "#059669",
    destructive: "#f59e0b",
  },
  {
    name: "purple",
    label: "Royal Purple",
    primary: "#8b5cf6",
    secondary: "#64748b",
    accent: "#a855f7",
    destructive: "#ef4444",
  },
  {
    name: "orange",
    label: "Sunset Orange",
    primary: "#f97316",
    secondary: "#6b7280",
    accent: "#ea580c",
    destructive: "#dc2626",
  },
  {
    name: "rose",
    label: "Rose Pink",
    primary: "#f43f5e",
    secondary: "#64748b",
    accent: "#e11d48",
    destructive: "#dc2626",
  },
  {
    name: "slate",
    label: "Slate Gray",
    primary: "#64748b",
    secondary: "#475569",
    accent: "#334155",
    destructive: "#ef4444",
  },
]

interface ColorSchemeContextType {
  colorScheme: string
  setColorScheme: (scheme: string) => void
  colorSchemes: ColorScheme[]
}

const ColorSchemeContext = createContext<ColorSchemeContextType | undefined>(undefined)

export function ColorSchemeProvider({ children }: { children: React.ReactNode }) {
  const [colorScheme, setColorSchemeState] = useState("blue")

  useEffect(() => {
    const stored = localStorage.getItem("color-scheme")
    if (stored && colorSchemes.find((s) => s.name === stored)) {
      setColorSchemeState(stored)
    }
  }, [])

  const setColorScheme = (scheme: string) => {
    setColorSchemeState(scheme)
    localStorage.setItem("color-scheme", scheme)
    applyColorScheme(scheme)
  }

  const applyColorScheme = (schemeName: string) => {
    const scheme = colorSchemes.find((s) => s.name === schemeName)
    if (!scheme) return

    const root = document.documentElement

    const hexToHsl = (hex: string) => {
      const r = Number.parseInt(hex.slice(1, 3), 16) / 255
      const g = Number.parseInt(hex.slice(3, 5), 16) / 255
      const b = Number.parseInt(hex.slice(5, 7), 16) / 255

      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      let h = 0
      let s = 0
      const l = (max + min) / 2

      if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0)
            break
          case g:
            h = (b - r) / d + 2
            break
          case b:
            h = (r - g) / d + 4
            break
        }
        h /= 6
      }

      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
    }

    root.style.setProperty("--primary", hexToHsl(scheme.primary))
    root.style.setProperty("--secondary", hexToHsl(scheme.secondary))
    root.style.setProperty("--accent", hexToHsl(scheme.accent))
    root.style.setProperty("--destructive", hexToHsl(scheme.destructive))

    root.style.setProperty("--sidebar-primary", hexToHsl(scheme.primary))
    root.style.setProperty("--sidebar-accent", `${hexToHsl(scheme.primary).split(" ")[0]} 4.8% 95.9%`)
    root.style.setProperty("--sidebar-accent-foreground", hexToHsl(scheme.primary))
  }

  useEffect(() => {
    applyColorScheme(colorScheme)
  }, [colorScheme])

  return React.createElement(
    ColorSchemeContext.Provider,
    { value: { colorScheme, setColorScheme, colorSchemes } },
    children,
  )
}

export function useColorScheme() {
  const context = useContext(ColorSchemeContext)
  if (context === undefined) {
    throw new Error("useColorScheme must be used within a ColorSchemeProvider")
  }
  return context
}
