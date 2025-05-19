"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Calculator } from "lucide-react"
import type { Producto, Sucursal } from "@/lib/types"
import { toast } from "sonner"
import { formatCLP } from "@/lib/utils"

interface CarritoVentaProps {
  items: { producto: Producto; cantidad: number; precio: number }[]
  sucursal?: Sucursal
  onRemoveItem: (productoId: number) => void
  onUpdateItem: (productoId: number, cantidad: number) => void
}

export function CarritoVenta({ items, sucursal, onRemoveItem, onUpdateItem }: CarritoVentaProps) {
  const [cliente, setCliente] = useState("")
  const [loading, setLoading] = useState(false)
  const [totalUSD, setTotalUSD] = useState<number | null>(null)

  const subtotal = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0)

  const handleCantidadChange = (productoId: number, value: string) => {
    const cantidad = Number.parseInt(value) || 1
    onUpdateItem(productoId, cantidad)
  }

  const calcularUSD = async () => {
    try {
      // Using ExchangeRate.host API - free, public, and supports CLP
      const response = await fetch("https://api.exchangerate.host/latest?base=CLP&symbols=USD")
      const data = await response.json()

      if (!data || !data.success || !data.rates || !data.rates.USD) {
        toast.error("No se pudo obtener el tipo de cambio")
        return
      }

      // ExchangeRate.host returns the conversion rate from CLP to USD
      const exchangeRate = data.rates.USD

      // Calculate the total in USD
      const calculatedTotalUSD = subtotal * exchangeRate
      setTotalUSD(calculatedTotalUSD)

      toast.success("Valor en USD calculado correctamente")
    } catch (error) {
      console.error("Error calculando USD:", error)
      toast.error("No se pudo calcular el valor en USD")
    }
  }

  const procesarVenta = async () => {
    if (!sucursal) {
      toast.error("Seleccione una sucursal")
      return
    }

    if (items.length === 0) {
      toast.error("El carrito está vacío")
      return
    }

    if (!cliente.trim()) {
      toast.error("Ingrese el nombre del cliente")
      return
    }

    try {
      setLoading(true)

      // 1. Crear pedido
      const pedidoResponse = await fetch("http://localhost:8000/api/pedidos/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sucursal: sucursal.id,
          cliente: cliente,
          estado: "pendiente",
        }),
      })

      if (!pedidoResponse.ok) {
        throw new Error("Error al crear el pedido")
      }

      const pedidoData = await pedidoResponse.json()

      // 2. Crear detalles del pedido
      for (const item of items) {
        const detalleResponse = await fetch("http://localhost:8000/api/detalles-pedido/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pedido: pedidoData.id,
            producto: item.producto.id,
            cantidad: item.cantidad,
            precio_unitario: item.precio,
          }),
        })

        if (!detalleResponse.ok) {
          throw new Error("Error al crear detalle del pedido")
        }
      }

      // 3. Iniciar proceso de pago con Transbank
      const pagoResponse = await fetch("http://localhost:8000/api/pagos/webpay/init/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buy_order: `orden-${pedidoData.id}`,
          session_id: `sesion-${Date.now()}`,
          amount: subtotal,
        }),
      })

      if (!pagoResponse.ok) {
        throw new Error("Error al iniciar el pago")
      }

      const pagoData = await pagoResponse.text()

      // Crear un div temporal para insertar el HTML de redirección
      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = pagoData
      document.body.appendChild(tempDiv)

      // Enviar el formulario automáticamente
      const form = tempDiv.querySelector("form")
      if (form) {
        form.submit()
      } else {
        throw new Error("No se pudo procesar el pago")
      }
    } catch (error) {
      console.error("Error procesando venta:", error)
      toast.error(error instanceof Error ? error.message : "Error al procesar la venta")
      setLoading(false)
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Carrito de Venta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="cliente" className="text-sm font-medium mb-1 block">
            Cliente
          </label>
          <Input
            id="cliente"
            placeholder="Nombre del cliente"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Sucursal</label>
          <div className="p-2 border rounded-md bg-muted">{sucursal ? sucursal.nombre : "Seleccione una sucursal"}</div>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Cant.</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Total</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No hay productos en el carrito
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.producto.id}>
                    <TableCell className="font-medium">{item.producto.nombre}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        className="w-16"
                        value={item.cantidad}
                        onChange={(e) => handleCantidadChange(item.producto.id, e.target.value)}
                      />
                    </TableCell>
                    <TableCell>{formatCLP(item.precio)}</TableCell>
                    <TableCell>{formatCLP(item.precio * item.cantidad)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => onRemoveItem(item.producto.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-between items-center">
          <div className="font-medium">Subtotal:</div>
          <div className="font-bold">{formatCLP(subtotal)}</div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="w-full" onClick={calcularUSD}>
            <Calculator className="mr-2 h-4 w-4" />
            Calcular USD
          </Button>
        </div>

        {totalUSD !== null && (
          <div className="flex justify-between items-center">
            <div className="font-medium">Total USD:</div>
            <div className="font-bold">${totalUSD.toFixed(2)}</div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" size="lg" onClick={procesarVenta} disabled={loading || items.length === 0}>
          {loading ? "Procesando..." : "Procesar Venta"}
        </Button>
      </CardFooter>
    </Card>
  )
}
