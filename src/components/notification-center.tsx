"use client"

import { useState, useEffect } from "react"
import { Bell, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

type Notification = {
  id: string
  message: string
  type: "stock" | "order" | "system"
  timestamp: Date
  read: boolean
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)

  // Connect to SSE and listen for notifications
  useEffect(() => {
    const eventSource = new EventSource("http://localhost:8000/sse/stock/")

    eventSource.onmessage = (event) => {
      const data = event.data

      if (data && !data.includes("No falta stock")) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          message: data,
          type: "stock",
          timestamp: new Date(),
          read: false,
        }

        setNotifications((prev) => [newNotification, ...prev])
        setUnreadCount((prev) => prev + 1)
      }
    }

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error)
      const newNotification: Notification = {
        id: Date.now().toString(),
        message: "Error de conexión con el servidor de notificaciones",
        type: "system",
        timestamp: new Date(),
        read: false,
      }

      setNotifications((prev) => [newNotification, ...prev])
      setUnreadCount((prev) => prev + 1)

      // Try to reconnect after 5 seconds
      setTimeout(() => {
        eventSource.close()
      }, 5000)
    }

    // Add some sample notifications for testing
    if (process.env.NODE_ENV === "development") {
      setNotifications([
        {
          id: "1",
          message: "Stock bajo en Sucursal Santiago - Producto: Martillo",
          type: "stock",
          timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
          read: false,
        },
        {
          id: "2",
          message: "Pedido #1234 completado exitosamente",
          type: "order",
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          read: true,
        },
      ])
      setUnreadCount(1)
    }

    return () => {
      eventSource.close()
    }
  }, [])

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
    setUnreadCount(0)
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => {
      const notification = prev.find((n) => n.id === id)
      if (notification && !notification.read) {
        setUnreadCount((count) => Math.max(0, count - 1))
      }
      return prev.filter((n) => n.id !== id)
    })
  }

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "stock":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "order":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "system":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  const formatTime = (date: Date) => {
    return new Intl.RelativeTimeFormat("es", { numeric: "auto" }).format(
      Math.round((date.getTime() - Date.now()) / (1000 * 60)),
      "minute",
    )
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-5 w-5 mr-2" />
          Notificaciones
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[1.25rem] h-5" variant="destructive">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[380px] sm:w-[540px] px-4">
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle>Notificaciones</SheetTitle>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Marcar todas como leídas
            </Button>
          )}
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mb-4 opacity-20" />
              <p>No hay notificaciones</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative p-4 rounded-lg border ${notification.read ? "opacity-70" : ""} ${getNotificationColor(notification.type)}`}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => removeNotification(notification.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <p className="pr-6">{notification.message}</p>
                  <p className="text-xs mt-2 opacity-70">{notification.timestamp.toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
