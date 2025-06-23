"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Producto } from "@//lib/types"
import { toast } from "sonner"

interface CreateProductModalProps {
  onProductCreated: (producto: Producto) => void
}

export function CreateProductModal({ onProductCreated }: CreateProductModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    marca: "",
    descripcion: "",
  })

  const [errors, setErrors] = useState({
    codigo: "",
    nombre: "",
    marca: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {
      codigo: "",
      nombre: "",
      marca: "",
    }

    if (!formData.codigo.trim()) {
      newErrors.codigo = "El código es obligatorio"
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio"
    }

    if (!formData.marca.trim()) {
      newErrors.marca = "La marca es obligatoria"
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some((error) => error !== "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)

      const response = await fetch("http://127.0.0.1:8000/api/grpc/create-product/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()

        // Handle specific field errors from the backend
        if (errorData.codigo && errorData.codigo.includes("already exists")) {
          setErrors((prev) => ({
            ...prev,
            codigo: "Este código ya existe",
          }))
          return
        }

        throw new Error("Error al crear el producto")
      }

      const newProduct = await response.json()

      toast.success("Producto creado exitosamente")
      // Reset form
      setFormData({
        codigo: "",
        nombre: "",
        marca: "",
        descripcion: "",
      })

      // Close modal
      setOpen(false)

      // Notify parent component
      onProductCreated(newProduct)
    } catch (error) {
      console.error("Error creating product:", error)
      
      toast.error("Error al crear el producto")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading) {
      setOpen(newOpen)
      if (!newOpen) {
        // Reset form when closing
        setFormData({
          codigo: "",
          nombre: "",
          marca: "",
          descripcion: "",
        })
        setErrors({
          codigo: "",
          nombre: "",
          marca: "",
        })
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Crear Producto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Producto</DialogTitle>
          <DialogDescription>
            Ingresa los datos del nuevo producto. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="codigo">Código *</Label>
              <Input
                id="codigo"
                placeholder="Ej: MART001"
                value={formData.codigo}
                onChange={(e) => handleInputChange("codigo", e.target.value)}
                className={errors.codigo ? "border-red-500" : ""}
                disabled={loading}
              />
              {errors.codigo && <p className="text-sm text-red-500">{errors.codigo}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre del Producto *</Label>
              <Input
                id="nombre"
                placeholder="Ej: Martillo de Carpintero"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                className={errors.nombre ? "border-red-500" : ""}
                disabled={loading}
              />
              {errors.nombre && <p className="text-sm text-red-500">{errors.nombre}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="marca">Marca *</Label>
              <Input
                id="marca"
                placeholder="Ej: Stanley"
                value={formData.marca}
                onChange={(e) => handleInputChange("marca", e.target.value)}
                className={errors.marca ? "border-red-500" : ""}
                disabled={loading}
              />
              {errors.marca && <p className="text-sm text-red-500">{errors.marca}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="descripcion">Descripción (Opcional)</Label>
              <Textarea
                id="descripcion"
                placeholder="Descripción detallada del producto..."
                value={formData.descripcion}
                onChange={(e) => handleInputChange("descripcion", e.target.value)}
                className="min-h-[80px]"
                disabled={loading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Producto"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
