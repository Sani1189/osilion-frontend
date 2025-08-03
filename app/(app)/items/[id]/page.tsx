"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Package, Calendar, User, FolderOpen, Zap, Trash2 } from "lucide-react"
import { itemsApi } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { canEditItems, canDeleteItems, type UserRole } from "@/lib/permissions"
import { formatDistanceToNow } from "date-fns"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"

export default function ItemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const itemId = params.id as string

  const {
    data: item,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["item", itemId],
    queryFn: () => itemsApi.getById(itemId),
    enabled: !!itemId,
  })

  const userRole = user?.role as UserRole
  const canEdit = canEditItems(userRole)
  const canDelete = canDeleteItems(userRole)

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => itemsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item", itemId] })
      queryClient.invalidateQueries({ queryKey: ["items"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-charts"] })
      toast({
        title: "Success",
        description: "Item status updated successfully.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update item status.",
        variant: "destructive",
      })
    },
  })

  const deleteItemMutation = useMutation({
    mutationFn: itemsApi.delete,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Item deleted successfully.",
      })
      router.push("/items")
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete item.",
        variant: "destructive",
      })
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-64" />
          </div>
          <div>
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Item not found</h3>
        <p className="text-muted-foreground mb-4">The item you're looking for doesn't exist or has been deleted.</p>
        <Button onClick={() => router.push("/items")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Items
        </Button>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "in_progress":
        return "bg-blue-500"
      case "completed":
        return "bg-green-500"
      case "blocked":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "in_progress":
        return "default"
      case "completed":
        return "outline"
      case "blocked":
        return "destructive"
      default:
        return "outline"
    }
  }

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete item "${item.serialNumber}"? This action cannot be undone.`)) {
      deleteItemMutation.mutate(itemId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push("/items")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              {item.serialNumber}
              {canEdit && <Zap className="h-6 w-6 text-orange-500" title="You can modify this item" />}
            </h1>
            <p className="text-muted-foreground">Product Item Details</p>
          </div>
        </div>

        {canDelete && (
          <Button variant="destructive" onClick={handleDelete} disabled={deleteItemMutation.isPending}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Item
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Item Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Item Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Serial Number</label>
                  <p className="text-lg font-semibold">{item.serialNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    {canEdit ? (
                      <Select
                        value={item.status}
                        onValueChange={(status) => updateStatusMutation.mutate({ id: itemId, status })}
                        disabled={updateStatusMutation.isPending}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="blocked">Blocked</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`} />
                        <Badge variant={getStatusVariant(item.status)}>{item.status.replace("_", " ")}</Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {item.project && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Project</label>
                  <div className="mt-1 flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    <Button
                      variant="link"
                      className="p-0 h-auto font-medium"
                      onClick={() => router.push(`/projects/${item.project.id}`)}
                    >
                      {item.project.name}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{item.project.description}</p>
                </div>
              )}

              {item.project?.product && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Product</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <Button
                      variant="link"
                      className="p-0 h-auto font-medium"
                      onClick={() => router.push(`/products/${item.project.product.id}`)}
                    >
                      {item.project.product.name}
                    </Button>
                    <Badge variant="outline">{item.project.product.version}</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status History */}
          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
              <CardDescription>Track changes to this item's status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`} />
                  <div className="flex-1">
                    <p className="font-medium">Current Status: {item.status.replace("_", " ")}</p>
                    <p className="text-sm text-muted-foreground">
                      Last updated {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                {/* Add more status history entries here when available from API */}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          {canEdit && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Update Status</label>
                  <Select
                    value={item.status}
                    onValueChange={(status) => updateStatusMutation.mutate({ id: itemId, status })}
                    disabled={updateStatusMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Created by</p>
                  <p className="text-sm text-muted-foreground">{item.createdBy?.name || item.createdBy?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Last updated</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Related</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {item.project && (
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => router.push(`/projects/${item.project.id}`)}
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  View Project
                </Button>
              )}
              {item.project?.product && (
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => router.push(`/products/${item.project.product.id}`)}
                >
                  <Package className="h-4 w-4 mr-2" />
                  View Product
                </Button>
              )}
              <Button variant="outline" className="w-full bg-transparent" onClick={() => router.push("/items")}>
                View All Items
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
