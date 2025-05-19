export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",

  endpoints: {
    sucursales: "/api/sucursales/",
    productos: "/api/productos/",
    stock: "/api/stock/",
    pedidos: "/api/pedidos/",
    detallesPedido: "/api/detalles-pedido/",
    sseStock: "/sse/stock/",
    pagos: "/api/pagos/",
  },

  defaults: {
    currency: "CLP",
  },

  features: {
    enableSearch: true,
    enableCurrencyConversion: true,
    enableSSE: true,
  },
}
