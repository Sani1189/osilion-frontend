const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(errorData.error || `API Error: ${response.status}`)
    }

    return response.json()
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }
}

const apiClient = new ApiClient(API_BASE_URL)

// Enhanced API with WebSocket notifications
const withNotification = <T extends (...args: any[]) => Promise<any>>(fn: T, notificationType: string): T => {
  return (async (...args: any[]) => {
    try {
      const result = await fn(...args)

      // Emit WebSocket event for real-time updates
      if (typeof window !== "undefined" && (window as any).socket) {
        ;(window as any).socket.emit(notificationType, result)
      }

      return result
    } catch (error) {
      throw error
    }
  }) as T
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    return apiClient.post<{
      token: string
      user: {
        id: string
        name: string
        email: string
        role: string
      }
    }>("/api/auth/login", { email, password })
  },

  register: async (data: { name: string; email: string; password: string; role: string }) => {
    return apiClient.post<{
      message: string
      user: {
        id: string
        name: string
        email: string
        role: string
        createdAt: string
      }
    }>("/api/auth/register", data)
  },

  me: async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null
    if (!token) {
      throw new Error("No token found")
    }

    const userData = typeof window !== "undefined" ? localStorage.getItem("user-data") : null
    if (userData) {
      return JSON.parse(userData)
    }

    throw new Error("No user data found")
  },

  logout: async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth-token")
      localStorage.removeItem("user-data")
    }
    return { success: true }
  },
}

// Products API with real-time updates
export const productsApi = {
  getAll: async () => {
    return apiClient.get<
      Array<{
        id: string
        name: string
        version: string
        description: string
        price: number
        createdAt: string
        updatedAt: string
        createdBy: {
          id: string
          name: string
          email: string
        }
        projects?: Array<{
          id: string
          name: string
        }>
      }>
    >("/api/products")
  },

  getById: async (id: string) => {
    return apiClient.get<{
      id: string
      name: string
      version: string
      description: string
      price: number
      createdAt: string
      updatedAt: string
      createdBy: {
        id: string
        name: string
        email: string
      }
      projects: Array<{
        id: string
        name: string
        items: Array<{
          id: string
          serialNumber: string
          status: string
        }>
      }>
    }>(`/api/products/${id}`)
  },

  create: withNotification(async (data: { name: string; version: string; description: string; price: number }) => {
    return apiClient.post<{
      id: string
      name: string
      version: string
      description: string
      price: number
      createdAt: string
      updatedAt: string
      createdBy: {
        id: string
        name: string
        email: string
      }
    }>("/api/products", data)
  }, "product:created"),

  update: withNotification(
    async (id: string, data: Partial<{ name: string; version: string; description: string; price: number }>) => {
      return apiClient.put(`/api/products/${id}`, data)
    },
    "product:updated",
  ),

  delete: withNotification(async (id: string) => {
    return apiClient.delete<{ message: string }>(`/api/products/${id}`)
  }, "product:deleted"),
}

// Projects API with real-time updates
export const projectsApi = {
  getAll: async () => {
    return apiClient.get<
      Array<{
        id: string
        name: string
        description: string
        startDate: string
        deadline: string
        createdAt: string
        updatedAt: string
        createdBy: {
          id: string
          name: string
          email: string
        }
        product: {
          id: string
          name: string
          version: string
        }
        items: Array<{
          id: string
          serialNumber: string
          status: string
        }>
      }>
    >("/api/projects")
  },

  getById: async (id: string) => {
    return apiClient.get(`/api/projects/${id}`)
  },

  getItems: async (id: string) => {
    return apiClient.get<
      Array<{
        id: string
        serialNumber: string
        status: "pending" | "in_progress" | "completed" | "blocked"
        createdAt: string
        updatedAt: string
        createdBy: {
          id: string
          name: string
          email: string
        }
        project: {
          id: string
          name: string
        }
      }>
    >(`/api/projects/${id}/items`)
  },

  create: withNotification(
    async (data: {
      name: string
      description: string
      startDate: string
      deadline: string
      productId: string
    }) => {
      return apiClient.post("/api/projects", data)
    },
    "project:created",
  ),

  update: withNotification(
    async (
      id: string,
      data: Partial<{
        name: string
        description: string
        startDate: string
        deadline: string
        productId: string
      }>,
    ) => {
      return apiClient.put(`/api/projects/${id}`, data)
    },
    "project:updated",
  ),

  delete: withNotification(async (id: string) => {
    return apiClient.delete<{ message: string }>(`/api/projects/${id}`)
  }, "project:deleted"),
}

// Items API with real-time updates
export const itemsApi = {
  getAll: async (filters?: { status?: string; project?: string }) => {
    try {
      let endpoint = "/api/items"
      const params = new URLSearchParams()

      if (filters?.status && filters.status !== "all") {
        params.append("status", filters.status)
      }

      if (filters?.project && filters.project !== "all") {
        params.append("projectId", filters.project)
      }

      if (params.toString()) {
        endpoint += `?${params.toString()}`
      }

      try {
        return await apiClient.get<
          Array<{
            id: string
            serialNumber: string
            status: "pending" | "in_progress" | "completed" | "blocked"
            projectId: string
            projectName?: string
            createdAt: string
            updatedAt: string
            project?: {
              id: string
              name: string
            }
          }>
        >(endpoint)
      } catch (directApiError) {
        const projects = await projectsApi.getAll()
        let allItems: Array<{
          id: string
          serialNumber: string
          status: "pending" | "in_progress" | "completed" | "blocked"
          projectId: string
          projectName: string
          createdAt: string
          updatedAt: string
        }> = []

        projects.forEach((project) => {
          project.items.forEach((item) => {
            allItems.push({
              ...item,
              projectId: project.id,
              projectName: project.name,
              createdAt: item.createdAt || new Date().toISOString(),
              updatedAt: item.updatedAt || new Date().toISOString(),
            })
          })
        })

        if (filters?.status && filters.status !== "all") {
          allItems = allItems.filter((item) => item.status === filters.status)
        }

        if (filters?.project && filters.project !== "all") {
          allItems = allItems.filter((item) => item.projectId === filters.project)
        }

        return allItems
      }
    } catch (error) {
      console.error("Error fetching items:", error)
      return []
    }
  },

  getById: async (id: string) => {
    return apiClient.get<{
      id: string
      serialNumber: string
      status: "pending" | "in_progress" | "completed" | "blocked"
      createdAt: string
      updatedAt: string
      createdBy: {
        id: string
        name: string
        email: string
      }
      project: {
        id: string
        name: string
        description: string
        product: {
          id: string
          name: string
          version: string
        }
      }
    }>(`/api/items/${id}`)
  },

  create: withNotification(async (data: { serialNumber: string; status: string; projectId: string }) => {
    return apiClient.post<{
      id: string
      serialNumber: string
      status: string
      createdAt: string
      updatedAt: string
      createdBy: {
        id: string
        name: string
        email: string
      }
      project: {
        id: string
        name: string
      }
    }>("/api/items", data)
  }, "item:created"),

  updateStatus: withNotification(async (id: string, status: string) => {
    return apiClient.patch<{
      id: string
      status: string
      updatedAt: string
    }>(`/api/items/${id}/status`, { status })
  }, "item:status_changed"),

  delete: withNotification(async (id: string) => {
    return apiClient.delete<{ message: string }>(`/api/items/${id}`)
  }, "item:deleted"),
}

// Dashboard API with real-time data
export const dashboardApi = {
  getStats: async () => {
    try {
      const [projects, products] = await Promise.all([projectsApi.getAll(), productsApi.getAll()])

      let totalItems = 0
      let completedItems = 0
      let activeItems = 0

      projects.forEach((project) => {
        totalItems += project.items.length
        project.items.forEach((item) => {
          if (item.status === "completed") {
            completedItems++
          } else if (item.status === "in_progress") {
            activeItems++
          }
        })
      })

      const productionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

      return {
        totalProjects: projects.length,
        activeItems,
        completedItems,
        productionRate,
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      return {
        totalProjects: 0,
        activeItems: 0,
        completedItems: 0,
        productionRate: 0,
      }
    }
  },

  getChartData: async () => {
    try {
      const projects = await projectsApi.getAll()

      const statusDistribution = {
        pending: 0,
        in_progress: 0,
        completed: 0,
        blocked: 0,
      }

      const itemsPerProject = projects.map((project) => ({
        name: project.name,
        items: project.items.length,
      }))

      projects.forEach((project) => {
        project.items.forEach((item) => {
          if (item.status in statusDistribution) {
            statusDistribution[item.status as keyof typeof statusDistribution]++
          }
        })
      })

      return {
        statusDistribution: Object.entries(statusDistribution).map(([name, value]) => ({
          name,
          value,
        })),
        itemsPerProject,
      }
    } catch (error) {
      console.error("Error fetching chart data:", error)
      return {
        statusDistribution: [],
        itemsPerProject: [],
      }
    }
  },

  getRecentActivity: async () => {
    try {
      const [projects, products] = await Promise.all([projectsApi.getAll(), productsApi.getAll()])
      const activities: Array<{
        id: string
        type: string
        description: string
        status: string
        timestamp: string
        entityId: string
        entityType: "project" | "product" | "item"
      }> = []

      projects.forEach((project) => {
        activities.push({
          id: `project-${project.id}`,
          type: "project",
          description: `Project "${project.name}" was updated`,
          status: "active",
          timestamp: project.updatedAt,
          entityId: project.id,
          entityType: "project",
        })

        project.items.forEach((item) => {
          activities.push({
            id: `item-${item.id}`,
            type: "item",
            description: `Item ${item.serialNumber} status changed to ${item.status.replace("_", " ")}`,
            status: item.status,
            timestamp: item.updatedAt || project.updatedAt,
            entityId: item.id,
            entityType: "item",
          })
        })
      })

      products.forEach((product) => {
        activities.push({
          id: `product-${product.id}`,
          type: "product",
          description: `Product "${product.name}" v${product.version} was updated`,
          status: "active",
          timestamp: product.updatedAt,
          entityId: product.id,
          entityType: "product",
        })
      })

      return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 15)
    } catch (error) {
      console.error("Error fetching recent activity:", error)
      return []
    }
  },
}

// Health check
export const healthApi = {
  check: async () => {
    return apiClient.get<{
      status: string
      timestamp: string
      environment: string
      version: string
      uptime: number
      memory: {
        rss: number
        heapTotal: number
        heapUsed: number
        external: number
      }
    }>("/health")
  },
}
