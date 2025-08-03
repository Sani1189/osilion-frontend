"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ItemList } from "@/components/items/item-list"
import { ItemForm } from "@/components/items/item-form"
import { ItemFilters } from "@/components/items/item-filters"
import { ItemPagination } from "@/components/items/item-pagination"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Plus, Package, Zap, Search } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { itemsApi } from "@/lib/api"
import { canCreateItems, type UserRole, getRoleDisplayName } from "@/lib/permissions"

const ITEMS_PER_PAGE = 10

export default function ItemsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [projectFilter, setProjectFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<string>("updatedAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [searchQuery, setSearchQuery] = useState("")
  const { user } = useAuth()

  const { data: allItems, isLoading } = useQuery({
    queryKey: ["items", statusFilter, projectFilter],
    queryFn: () => itemsApi.getAll({ status: statusFilter, project: projectFilter }),
  })

  const userRole = user?.role as UserRole
  const canCreate = canCreateItems(userRole)

  // Filter and sort items
  const filteredAndSortedItems =
    allItems
      ?.filter((item) => {
        if (!searchQuery) return true
        return (
          item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.projectName?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })
      ?.sort((a, b) => {
        let aValue: any = a[sortBy as keyof typeof a]
        let bValue: any = b[sortBy as keyof typeof b]

        // Handle date sorting
        if (sortBy === "createdAt" || sortBy === "updatedAt") {
          aValue = new Date(aValue).getTime()
          bValue = new Date(bValue).getTime()
        }

        // Handle string sorting
        if (typeof aValue === "string" && typeof bValue === "string") {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }

        if (sortOrder === "asc") {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      }) || []

  // Pagination
  const totalItems = filteredAndSortedItems.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedItems = filteredAndSortedItems.slice(startIndex, endIndex)

  // Reset to first page when filters change
  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1)
    if (filterType === "status") {
      setStatusFilter(value)
    } else if (filterType === "project") {
      setProjectFilter(value)
    }
  }

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
    setCurrentPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Items</h1>
          <p className="text-muted-foreground">Track individual product items through the production pipeline</p>
        </div>

        {canCreate && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Product Item</DialogTitle>
              </DialogHeader>
              <ItemForm onSuccess={() => setIsCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Role-based Access Notice */}
      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            {userRole === "ENGINEER" ? (
              <Zap className="h-5 w-5 text-orange-600" />
            ) : (
              <Package className="h-5 w-5 text-orange-600" />
            )}
            <div>
              <p className="font-medium text-orange-900 dark:text-orange-100">
                Product Items Access - {getRoleDisplayName(userRole)}
              </p>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                {userRole === "PRODUCT_MANAGER" &&
                  "You have read-only access to inspect items within projects for oversight purposes."}
                {userRole === "PROJECT_MANAGER" &&
                  "You can monitor item progress and status but cannot modify items directly."}
                {userRole === "ENGINEER" &&
                  "You have full control: create items, update status in real-time, and delete items as needed."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by serial number or project name..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Filters and Sorting */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <ItemFilters
              statusFilter={statusFilter}
              onStatusChange={(value) => handleFilterChange("status", value)}
              projectFilter={projectFilter}
              onProjectChange={(value) => handleFilterChange("project", value)}
            />
          </div>

          {/* Sorting Controls */}
          <Card className="sm:w-80">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Sort by</label>
                  <Select value={sortBy} onValueChange={(value) => handleSortChange(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="serialNumber">Serial Number</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="projectName">Project</SelectItem>
                      <SelectItem value="createdAt">Created Date</SelectItem>
                      <SelectItem value="updatedAt">Updated Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Order</label>
                  <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Descending</SelectItem>
                      <SelectItem value="asc">Ascending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} items
          {searchQuery && ` matching "${searchQuery}"`}
        </p>

        {/* Items per page selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Items per page:</span>
          <Select value={ITEMS_PER_PAGE.toString()} onValueChange={() => {}}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Items List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-32"></div>
                    <div className="h-3 bg-muted rounded w-48"></div>
                  </div>
                  <div className="h-6 bg-muted rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : paginatedItems.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No items found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? `No items match your search "${searchQuery}"`
                : statusFilter !== "all" || projectFilter !== "all"
                  ? "Try adjusting your filters to see more items"
                  : "Get started by creating your first product item"}
            </p>
            {canCreate && !searchQuery && statusFilter === "all" && projectFilter === "all" && (
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Item
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <ItemList items={paginatedItems} />

          {/* Pagination */}
          <ItemPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </>
      )}
    </div>
  )
}
