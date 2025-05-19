"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

interface ProductoStockBadgeProps {
  productoId: number
  sucursalId: number
  initialStock?: number
}

export function ProductoStockBadge({ productoId, sucursalId, initialStock }: ProductoStockBadgeProps) {
  const [stock, setStock] = useState<number | null>(initialStock ?? null)
  const [loading, setLoading] = useState(!initialStock)
  const [error, setError] = useState(false)

  useEffect(() => {
    // If we already have initial stock, no need to fetch
    if (initialStock !== undefined) {
      setStock(initialStock)
      setLoading(false)
      return
    }

    // Otherwise fetch the stock
    const fetchStock = async () => {
      try {
        setLoading(true)
        const response = await fetch(`http://localhost:8000/api/stock/?producto=${productoId}&sucursal=${sucursalId}`)
        const data = await response.json()

        if (data && data.length > 0) {
          setStock(data[0].cantidad)
        } else {
          setStock(0)
        }
        setLoading(false)
      } catch (error) {
        console.error("Error fetching stock:", error)
        setError(true)
        setLoading(false)
      }
    }

    fetchStock()
  }, [productoId, sucursalId, initialStock])

  // Listen for SSE updates
  useEffect(() => {
    const eventSource = new EventSource("http://localhost:8000/sse/stock/")

    eventSource.onmessage = (event) => {
      const data = event.data

      // This is a simplified example - in a real app, you'd parse the message
      // to check if it's relevant to this specific product and branch
      if (data && data.includes(`producto_${productoId}`) && data.includes(`sucursal_${sucursalId}`)) {
        // Extract the new stock value from the message
        const stockMatch = data.match(/stock: (\d+)/)
        if (stockMatch && stockMatch[1]) {
          setStock(Number.parseInt(stockMatch[1], 10))
        }
      }
    }

    return () => {
      eventSource.close()
    }
  }, [productoId, sucursalId])

  if (loading) {
    return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
  }

  if (error) {
    return <Badge variant="outline">Error</Badge>
  }

  if (stock === null) {
    return <Badge variant="outline">No disponible</Badge>
  }

  if (stock === 0) {
    return <Badge variant="destructive">Sin stock</Badge>
  }

  if (stock <= 5) {
    return <Badge variant="destructive">Stock bajo: {stock}</Badge>
  }

  return <Badge variant="default">En stock: {stock}</Badge>
}
