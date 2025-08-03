"use client"

import { useQuery } from "@tanstack/react-query"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { projectsApi } from "@/lib/api"

interface ItemFiltersProps {
  statusFilter: string
  onStatusChange: (status: string) => void
  projectFilter: string
  onProjectChange: (project: string) => void
}

export function ItemFilters({ statusFilter, onStatusChange, projectFilter, onProjectChange }: ItemFiltersProps) {
  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: projectsApi.getAll,
  })

  const statusOptions = [
    { value: "all", label: "All Statuses", color: "outline" },
    { value: "pending", label: "Pending", color: "secondary" },
    { value: "in_progress", label: "In Progress", color: "default" },
    { value: "completed", label: "Completed", color: "outline" },
    { value: "blocked", label: "Blocked", color: "destructive" },
  ]

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Filter by Status</label>
            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <span>{option.label}</span>
                      {option.value !== "all" && (
                        <Badge variant={option.color as any} className="text-xs">
                          {option.value.replace("_", " ")}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Filter by Project</label>
            <Select value={projectFilter} onValueChange={onProjectChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{project.name}</span>
                      <Badge variant="outline" className="text-xs ml-2">
                        {project.items.length} items
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
