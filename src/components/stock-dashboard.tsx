"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search } from "lucide-react"
import type { Sucursal, Producto, StockSucursal } from "@/lib/types"
import { CreateProductModal } from "@/components/create-product-modal"

export function StockDashboard() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [selectedSucursal, setSelectedSucursal] = useState<string>("")
  const [productos, setProductos] = useState<Producto[]>([])
  const [stockData, setStockData] = useState<StockSucursal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [stockUpdates, setStockUpdates] = useState<{ [key: string]: boolean }>({})

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch sucursales
        const sucursalesResponse = await fetch("http://localhost:8000/api/sucursales/")
        const sucursalesData = await sucursalesResponse.json()
        setSucursales(sucursalesData)

        if (sucursalesData.length > 0 && !selectedSucursal) {
          setSelectedSucursal(sucursalesData[0].id.toString())
        }

        // Fetch productos
        const productosResponse = await fetch("http://localhost:8000/api/productos/")
        const productosData = await productosResponse.json()
        setProductos(productosData)

        // Fetch stock
        const stockResponse = await fetch("http://localhost:8000/api/stock/")
        const stockData = await stockResponse.json()
        setStockData(stockData)

        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Listen for SSE updates
  useEffect(() => {
    const eventSource = new EventSource("http://localhost:8000/api/sse/stock/")

    eventSource.onmessage = (event) => {
      const data = event.data

      if (data && !data.includes("No falta stock")) {
        // In a real app, you would parse the message to extract the product and branch IDs
        // For this example, we'll just highlight a random product
        if (productos.length > 0) {
          const randomIndex = Math.floor(Math.random() * productos.length)
          const productoId = productos[randomIndex].id

          // Set this product as updated
          setStockUpdates((prev) => ({
            ...prev,
            [productoId]: true,
          }))

          // Clear the highlight after 5 seconds
          setTimeout(() => {
            setStockUpdates((prev) => {
              const newUpdates = { ...prev }
              delete newUpdates[productoId]
              return newUpdates
            })
          }, 5000)
        }
      }
    }

    return () => {
      eventSource.close()
    }
  }, [productos])

  // Filter products based on search term
  const filteredProductos = productos.filter(
    (producto) =>
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.marca.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Get stock for a product in the selected branch
  const getStockForProduct = (productoId: number) => {
    return stockData.find((stock) => stock.producto === productoId && stock.sucursal.toString() === selectedSucursal)
  }

  // Render stock status badge
  const renderStockBadge = (cantidad: number | undefined) => {
    if (cantidad === undefined) return <Badge variant="outline">No disponible</Badge>
    if (cantidad === 0) return <Badge variant="destructive">Sin stock</Badge>
    if (cantidad <= 5) return <Badge variant="destructive">Stock bajo: {cantidad}</Badge>
    return <Badge variant="default">En stock: {cantidad}</Badge>
  }

  const handleProductCreated = (newProduct: Producto) => {
    setProductos((prev) => [...prev, newProduct])
  }

  return (
    <div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedSucursal} onValueChange={setSelectedSucursal}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Seleccionar sucursal" />
              </SelectTrigger>
              <SelectContent>
                {sucursales.map((sucursal) => (
                  <SelectItem key={sucursal.id} value={sucursal.id.toString()}>
                    {sucursal.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <CreateProductModal onProductCreated={handleProductCreated} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inventario en Tiempo Real</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Precio USD</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProductos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No se encontraron productos
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProductos.map((producto) => {
                      const stock = getStockForProduct(producto.id)
                      const isUpdated = stockUpdates[producto.id]

                      return (
                        <TableRow
                          key={producto.id}
                          className={
                            isUpdated ? "bg-yellow-50 dark:bg-yellow-900/20 transition-colors duration-500" : ""
                          }
                        >
                          <TableCell className="font-medium">{producto.codigo}</TableCell>
                          <TableCell>{producto.nombre}</TableCell>
                          <TableCell>{producto.marca}</TableCell>
                          <TableCell>{renderStockBadge(stock?.cantidad)}</TableCell>
                          <TableCell>{stock ? `$${stock.precio.toLocaleString()}` : "-"}</TableCell>
                          <TableCell>{stock?.precio_usd ? `$${stock.precio_usd.toFixed(2)}` : "-"}</TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
