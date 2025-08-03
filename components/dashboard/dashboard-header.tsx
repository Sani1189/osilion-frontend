"use client"

import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Zap } from "lucide-react"

export function DashboardHeader() {
  const { user } = useAuth()

  const currentTime = new Date().toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "PRODUCT_MANAGER":
        return "Product Manager"
      case "PROJECT_MANAGER":
        return "Project Manager"
      case "ENGINEER":
        return "Engineer"
      default:
        return role
    }
  }

  const getWelcomeName = () => {
    if (user?.name) {
      return user.name.split(" ")[0] // First name only
    }
    if (user?.email) {
      return user.email.split("@")[0]
    }
    return "User"
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-background to-accent/5">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Welcome back, {getWelcomeName()}!
              <Zap className="inline-block h-8 w-8 ml-2 text-primary animate-pulse" />
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">
              Here's what's happening with your aerospace production today.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <Badge variant="outline" className="gap-2 border-primary/30 bg-primary/10 text-primary px-3 py-1">
                <Calendar className="h-4 w-4" />
                {getRoleDisplayName(user?.role || "")}
              </Badge>
              <Badge variant="outline" className="gap-2 border-accent/30 bg-accent/10 text-accent px-3 py-1">
                <Clock className="h-4 w-4" />
                {currentTime}
              </Badge>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Osilion X
              </div>
              <div className="text-sm text-muted-foreground">Production Dashboard</div>
              <div className="mt-2 p-2 bg-primary/10 rounded-lg border border-primary/20">
                <div className="text-xs text-primary font-medium">Real-time Monitoring</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
