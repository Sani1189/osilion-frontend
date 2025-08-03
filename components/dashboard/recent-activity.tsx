"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { dashboardApi } from "@/lib/api"
import { useRouter } from "next/navigation"

export function RecentActivity() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["recent-activity"],
    queryFn: dashboardApi.getRecentActivity,
    refetchInterval: 30000,
  })

  const router = useRouter()

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-4 bg-muted rounded w-1/3"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-8 w-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                  <div className="h-2 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "in_progress":
        return "bg-blue-500"
      case "pending":
        return "bg-yellow-500"
      case "blocked":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates from your production pipeline</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities?.map((activity, index) => (
            <div key={index} className="flex items-center gap-4">
              <Avatar className="h-8 w-8">
                <AvatarFallback className={getStatusColor(activity.status)}>
                  {activity.type === "item" ? "I" : activity.type === "project" ? "P" : "R"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {activity.entityType && activity.entityId ? (
                    <button
                      onClick={() => {
                        const path =
                          activity.entityType === "product"
                            ? `/products/${activity.entityId}`
                            : activity.entityType === "project"
                              ? `/projects/${activity.entityId}`
                              : activity.entityType === "item"
                                ? `/items/${activity.entityId}`
                                : "#"
                        window.location.href = path
                      }}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {activity.description}
                    </button>
                  ) : (
                    activity.description
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {activity.status.replace("_", " ")}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {(!activities || activities.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-4">No recent activity to display</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
