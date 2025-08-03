"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { itemsApi, projectsApi } from "@/lib/api"

const itemSchema = z.object({
  serialNumber: z.string().min(1, "Serial number is required"),
  status: z.enum(["pending", "in_progress", "completed", "blocked"]),
  projectId: z.string().min(1, "Project selection is required"),
})

type ItemFormData = z.infer<typeof itemSchema>

interface ItemFormProps {
  onSuccess?: () => void
}

export function ItemForm({ onSuccess }: ItemFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: projectsApi.getAll,
  })

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      status: "pending",
    },
  })

  const createItemMutation = useMutation({
    mutationFn: itemsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-charts"] })
      toast({
        title: "Success",
        description: "Product item created successfully.",
      })
      onSuccess?.()
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create product item. Please try again.",
        variant: "destructive",
      })
    },
  })

  const onSubmit = async (data: ItemFormData) => {
    setIsLoading(true)
    try {
      await createItemMutation.mutateAsync(data)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="serialNumber">Serial Number</Label>
        <Input id="serialNumber" {...register("serialNumber")} placeholder="Enter serial number (e.g., RPT-001)" />
        {errors.serialNumber && <p className="text-sm text-destructive">{errors.serialNumber.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="projectId">Project</Label>
        <Select onValueChange={(value) => setValue("projectId", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects?.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.projectId && <p className="text-sm text-destructive">{errors.projectId.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Initial Status</Label>
        <Select onValueChange={(value) => setValue("status", value as any)} defaultValue="pending">
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
        {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Item"}
        </Button>
      </div>
    </form>
  )
}
