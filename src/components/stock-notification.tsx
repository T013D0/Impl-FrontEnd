"use client"

import { useState, useEffect } from "react"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"

export function StockNotification() {
  const [notification, setNotification] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Create EventSource connection to the SSE endpoint
    const eventSource = new EventSource("http://localhost:8000/sse/stock/")

    // Handle incoming messages
    eventSource.onmessage = (event) => {
      const data = event.data

      // Only show notification if it's about low stock
      if (data && !data.includes("No falta stock")) {
        setNotification(data)
        setIsVisible(true)

        // Also show as toast for better visibility
        toast.error(data)

        // Auto-hide the alert after 10 seconds
        setTimeout(() => {
          setIsVisible(false)
        }, 10000)
      }
    }

    // Handle connection errors
    eventSource.onerror = (error) => {
      console.error("SSE Error:", error)
      // Try to reconnect after 5 seconds on error
      setTimeout(() => {
        eventSource.close()
        // The browser will automatically try to reconnect when creating a new EventSource
      }, 5000)
    }

    // Clean up the connection when component unmounts
    return () => {
      eventSource.close()
    }
  }, [])

  if (!isVisible || !notification) return null

  return (
    <Alert variant="destructive" className="mb-4 animate-in fade-in slide-in-from-top-5 duration-300">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Alerta de Stock</AlertTitle>
      <AlertDescription>{notification}</AlertDescription>
    </Alert>
  )
}
