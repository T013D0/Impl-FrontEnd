"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductoStockBadge } from "@/components/producto-stock-badge"
import type { Producto, StockSucursal } from "@/lib/types"
import { Loader2 } from "lucide-react"
import { formatCLP } from "@/lib/utils"

interface ProductoListProps {
  productos: Producto[]
  stockSucursales: StockSucursal[]
  selectedSucursal: number
  onAddToCart: (producto: Producto, cantidad: number, precio: number) => void
  loading: boolean
}

export function ProductoList({
  productos,
  stockSucursales,
  selectedSucursal,
  onAddToCart,
  loading,
}: ProductoListProps) {
  const [cantidades, setCantidades] = useState<{ [key: number]: number }>({})

  const getStockForProducto = (productoId: number) => {
    return stockSucursales.find((stock) => stock.producto === productoId && stock.sucursal === selectedSucursal)
  }

  const handleCantidadChange = (productoId: number, value: string) => {
    const cantidad = Number.parseInt(value) || 0
    setCantidades({
      ...cantidades,
      [productoId]: cantidad,
    })
  }

  const handleAddToCart = (producto: Producto) => {
    const stock = getStockForProducto(producto.id)
    if (stock) {
      const cantidad = cantidades[producto.id] || 1
      onAddToCart(producto, cantidad, stock.precio)

      // Reset cantidad after adding to cart
      setCantidades({
        ...cantidades,
        [producto.id]: 0,
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead>Marca</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                No se encontraron productos
              </TableCell>
            </TableRow>
          ) : (
            productos.map((producto) => {
              const stock = getStockForProducto(producto.id)
              return (
                <TableRow key={producto.id}>
                  <TableCell className="font-medium">{producto.codigo}</TableCell>
                  <TableCell>{producto.nombre}</TableCell>
                  <TableCell>{producto.marca}</TableCell>
                  <TableCell>
                    <ProductoStockBadge
                      productoId={producto.id}
                      sucursalId={selectedSucursal}
                      initialStock={stock?.cantidad}
                    />
                  </TableCell>
                  <TableCell>{stock ? formatCLP(stock.precio) : "-"}</TableCell>
                  <TableCell className="w-24">
                    <Input
                      type="number"
                      min="0"
                      max={stock?.cantidad || 0}
                      value={cantidades[producto.id] || ""}
                      onChange={(e) => handleCantidadChange(producto.id, e.target.value)}
                      disabled={!stock || stock.cantidad === 0}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(producto)}
                      disabled={!stock || stock.cantidad === 0 || !cantidades[producto.id]}
                    >
                      Agregar
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
