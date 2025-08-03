"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Calendar, Users, Edit, Trash2, Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { canEditProjects, canDeleteProjects, type UserRole } from "@/lib/permissions"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { projectsApi } from "@/lib/api"

interface Project {
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
}

interface ProjectListProps {
  projects: Project[]
}

export function ProjectList({ projects }: ProjectListProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const userRole = user?.role as UserRole
  const canEdit = canEditProjects(userRole)
  const canDelete = canDeleteProjects(userRole)

  const deleteProjectMutation = useMutation({
    mutationFn: projectsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-charts"] })
      toast({
        title: "Success",
        description: "Project deleted successfully.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete project.",
        variant: "destructive",
      })
    },
  })

  const getStatusColor = (project: Project) => {
    const now = new Date()
    const deadline = new Date(project.deadline)
    const completedItems = project.items.filter((item) => item.status === "completed").length
    const totalItems = project.items.length

    if (totalItems === 0) return "outline"
    if (completedItems === totalItems) return "secondary" // completed
    if (deadline < now) return "destructive" // overdue
    return "default" // active
  }

  const getStatusText = (project: Project) => {
    const now = new Date()
    const deadline = new Date(project.deadline)
    const completedItems = project.items.filter((item) => item.status === "completed").length
    const totalItems = project.items.length

    if (totalItems === 0) return "planning"
    if (completedItems === totalItems) return "completed"
    if (deadline < now) return "overdue"
    return "active"
  }

  const getProgress = (project: Project) => {
    if (project.items.length === 0) return 0
    const completedItems = project.items.filter((item) => item.status === "completed").length
    return Math.round((completedItems / project.items.length) * 100)
  }

  const handleDelete = async (projectId: string, projectName: string) => {
    if (window.confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      deleteProjectMutation.mutate(projectId)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card key={project.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{project.name}</CardTitle>
              <Badge variant={getStatusColor(project)}>{getStatusText(project)}</Badge>
            </div>
            <CardDescription className="line-clamp-2">{project.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span>{getProgress(project)}%</span>
              </div>
              <Progress value={getProgress(project)} className="h-2" />
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Due {formatDistanceToNow(new Date(project.deadline), { addSuffix: true })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{project.items.length} items</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 bg-transparent"
                onClick={() => router.push(`/projects/${project.id}`)}
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>

              {canEdit && (
                <Button variant="outline" size="sm" onClick={() => router.push(`/projects/${project.id}/edit`)}>
                  <Edit className="h-3 w-3" />
                </Button>
              )}

              {canDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(project.id, project.name)}
                  disabled={deleteProjectMutation.isPending}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
