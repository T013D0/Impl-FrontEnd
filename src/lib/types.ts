export interface Sucursal {
  id: number
  nombre: string
  direccion: string
  region: string
}

export interface Producto {
  id: number
  codigo: string
  nombre: string
  marca: string
  descripcion: string
}

export interface StockSucursal {
  id: number
  producto: number
  sucursal: number
  cantidad: number
  precio: number
  precio_usd: number
}

export interface Pedido {
  id: number
  sucursal: number
  cliente: string
  fecha: string
  estado: string
}

export interface DetallePedido {
  id: number
  pedido: number
  producto: number
  cantidad: number
  precio_unitario: number
  precio_usd: number
}
