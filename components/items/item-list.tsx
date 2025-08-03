"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { itemsApi } from "@/lib/api"
import { Package, Calendar, Trash2, Zap } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { canEditItems, canDeleteItems, type UserRole } from "@/lib/permissions"

interface ProductItem {
  id: string
  serialNumber: string
  status: "pending" | "in_progress" | "completed" | "blocked"
  projectId: string
  projectName: string
  createdAt: string
  updatedAt: string
}

interface ItemListProps {
  items: ProductItem[]
}

export function ItemList({ items }: ItemListProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const userRole = user?.role as UserRole
  const canEdit = canEditItems(userRole)
  const canDelete = canDeleteItems(userRole)

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => itemsApi.updateStatus(id, status),
    onSuccess: () => {
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
      queryClient.invalidateQueries({ queryKey: ["items"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-charts"] })
      toast({
        title: "Success",
        description: "Item deleted successfully.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete item.",
        variant: "destructive",
      })
    },
  })

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

  const handleDelete = async (itemId: string, serialNumber: string) => {
    if (window.confirm(`Are you sure you want to delete item "${serialNumber}"? This action cannot be undone.`)) {
      deleteItemMutation.mutate(itemId)
    }
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id} className="hover:shadow-sm transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`} />
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    {item.serialNumber}
                    {userRole === "ENGINEER" && (
                      <Zap className="h-4 w-4 text-orange-500" title="You can modify this item" />
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">Project: {item.projectName}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Updated {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {canEdit ? (
                    <Select
                      value={item.status}
                      onValueChange={(status) => updateStatusMutation.mutate({ id: item.id, status })}
                      disabled={updateStatusMutation.isPending}
                    >
                      <SelectTrigger className="w-32">
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
                    <Badge variant={getStatusVariant(item.status)}>{item.status.replace("_", " ")}</Badge>
                  )}

                  {canDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item.id, item.serialNumber)}
                      disabled={deleteItemMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
