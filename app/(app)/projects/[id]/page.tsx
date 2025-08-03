"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Edit, FolderOpen, Calendar, User, Package, Target } from "lucide-react"
import { projectsApi } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { canEditProjects, type UserRole } from "@/lib/permissions"
import { formatDistanceToNow, format } from "date-fns"

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const projectId = params.id as string

  const {
    data: project,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectsApi.getById(projectId),
    enabled: !!projectId,
  })

  const { data: projectItems } = useQuery({
    queryKey: ["project-items", projectId],
    queryFn: () => projectsApi.getItems(projectId),
    enabled: !!projectId,
  })

  const userRole = user?.role as UserRole
  const canEdit = canEditProjects(userRole)

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

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Project not found</h3>
        <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist or has been deleted.</p>
        <Button onClick={() => router.push("/projects")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      </div>
    )
  }

  const items = projectItems || project.items || []
  const completedItems = items.filter((item) => item.status === "completed").length
  const totalItems = items.length
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  const getStatusColor = () => {
    const now = new Date()
    const deadline = new Date(project.deadline)

    if (totalItems === 0) return "outline"
    if (completedItems === totalItems) return "secondary"
    if (deadline < now) return "destructive"
    return "default"
  }

  const getStatusText = () => {
    const now = new Date()
    const deadline = new Date(project.deadline)

    if (totalItems === 0) return "Planning"
    if (completedItems === totalItems) return "Completed"
    if (deadline < now) return "Overdue"
    return "Active"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push("/projects")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-muted-foreground">Project Details</p>
          </div>
        </div>

        {canEdit && (
          <Button onClick={() => router.push(`/projects/${projectId}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Project
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Project Information
                </CardTitle>
                <Badge variant={getStatusColor()}>{getStatusText()}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="mt-1 text-sm leading-relaxed">{project.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                  <p className="text-sm">{format(new Date(project.startDate), "PPP")}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Deadline</label>
                  <p className="text-sm">{format(new Date(project.deadline), "PPP")}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Progress</label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {completedItems} of {totalItems} items completed
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </div>

              {project.product && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Product</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{project.product.name}</span>
                    <Badge variant="outline">{project.product.version}</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Project Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Product Items</CardTitle>
                  <CardDescription>Items being produced in this project</CardDescription>
                </div>
                <Button variant="outline" onClick={() => router.push(`/items?project=${projectId}`)}>
                  View All Items
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {items.length > 0 ? (
                <div className="space-y-3">
                  {items.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            item.status === "completed"
                              ? "bg-green-500"
                              : item.status === "in_progress"
                                ? "bg-blue-500"
                                : item.status === "blocked"
                                  ? "bg-red-500"
                                  : "bg-yellow-500"
                          }`}
                        />
                        <div>
                          <h4 className="font-medium">{item.serialNumber}</h4>
                          <p className="text-sm text-muted-foreground">Status: {item.status.replace("_", " ")}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{item.status.replace("_", " ")}</Badge>
                    </div>
                  ))}
                  {items.length > 5 && (
                    <div className="text-center pt-2">
                      <Button variant="link" onClick={() => router.push(`/items?project=${projectId}`)}>
                        View {items.length - 5} more items
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No items have been created for this project yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Items</span>
                <span className="font-semibold">{totalItems}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completed</span>
                <span className="font-semibold text-green-600">{completedItems}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">In Progress</span>
                <span className="font-semibold text-blue-600">
                  {items.filter((item) => item.status === "in_progress").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending</span>
                <span className="font-semibold text-yellow-600">
                  {items.filter((item) => item.status === "pending").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Blocked</span>
                <span className="font-semibold text-red-600">
                  {items.filter((item) => item.status === "blocked").length}
                </span>
              </div>
            </CardContent>
          </Card>

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
                  <p className="text-sm text-muted-foreground">{project.createdBy?.name || project.createdBy?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Time to deadline</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(project.deadline), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => router.push(`/items?project=${projectId}`)}
              >
                View Project Items
              </Button>
              {project.product && (
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => router.push(`/products/${project.product.id}`)}
                >
                  View Product Details
                </Button>
              )}
              {canEdit && (
                <Button className="w-full" onClick={() => router.push(`/projects/${projectId}/edit`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Project
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
