// Role-based permission system
export type UserRole = "PRODUCT_MANAGER" | "PROJECT_MANAGER" | "ENGINEER"

export interface Permission {
  resource: string
  action: "create" | "read" | "update" | "delete"
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  PRODUCT_MANAGER: [
    // Products - Full CRUD
    { resource: "products", action: "create" },
    { resource: "products", action: "read" },
    { resource: "products", action: "update" },
    { resource: "products", action: "delete" },
    // Projects - Full CRUD
    { resource: "projects", action: "create" },
    { resource: "projects", action: "read" },
    { resource: "projects", action: "update" },
    { resource: "projects", action: "delete" },
    // Items - Read only
    { resource: "items", action: "read" },
  ],
  PROJECT_MANAGER: [
    // Products - Read only
    { resource: "products", action: "read" },
    // Projects - Full CRUD
    { resource: "projects", action: "create" },
    { resource: "projects", action: "read" },
    { resource: "projects", action: "update" },
    { resource: "projects", action: "delete" },
    // Items - Read only
    { resource: "items", action: "read" },
  ],
  ENGINEER: [
    // Products - Read only
    { resource: "products", action: "read" },
    // Projects - Read only
    { resource: "projects", action: "read" },
    // Items - Full CRUD
    { resource: "items", action: "create" },
    { resource: "items", action: "read" },
    { resource: "items", action: "update" },
    { resource: "items", action: "delete" },
  ],
}

export function hasPermission(
  userRole: UserRole,
  resource: string,
  action: "create" | "read" | "update" | "delete",
): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || []
  return permissions.some((permission) => permission.resource === resource && permission.action === action)
}

export function canCreateProducts(userRole: UserRole): boolean {
  return hasPermission(userRole, "products", "create")
}

export function canEditProducts(userRole: UserRole): boolean {
  return hasPermission(userRole, "products", "update")
}

export function canDeleteProducts(userRole: UserRole): boolean {
  return hasPermission(userRole, "products", "delete")
}

export function canCreateProjects(userRole: UserRole): boolean {
  return hasPermission(userRole, "projects", "create")
}

export function canEditProjects(userRole: UserRole): boolean {
  return hasPermission(userRole, "projects", "update")
}

export function canDeleteProjects(userRole: UserRole): boolean {
  return hasPermission(userRole, "projects", "delete")
}

export function canCreateItems(userRole: UserRole): boolean {
  return hasPermission(userRole, "items", "create")
}

export function canEditItems(userRole: UserRole): boolean {
  return hasPermission(userRole, "items", "update")
}

export function canDeleteItems(userRole: UserRole): boolean {
  return hasPermission(userRole, "items", "delete")
}

export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case "PRODUCT_MANAGER":
      return "Product Manager"
    case "PROJECT_MANAGER":
      return "Project Manager"
    case "ENGINEER":
      return "Production Engineer"
    default:
      return role
  }
}

export function getRoleDescription(role: UserRole): string {
  switch (role) {
    case "PRODUCT_MANAGER":
      return "Responsible for defining and managing products and overseeing high-level projects"
    case "PROJECT_MANAGER":
      return "Manages the execution of projects and ensures production milestones are tracked"
    case "ENGINEER":
      return "Works directly on production tasks at the item level with real-time status updates"
    default:
      return ""
  }
}
