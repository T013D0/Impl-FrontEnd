'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProductoList } from '@/components/producto-list';
import { CarritoVenta } from '@/components/carrito-venta';
import { Separator } from '@/components/ui/separator';
import type { Sucursal, Producto, StockSucursal } from '@/lib/types';
import { CreateProductModal } from '@/components/create-product-modal';
import { toast } from 'sonner';

export function VentaContainer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [selectedSucursal, setSelectedSucursal] = useState<string>('');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [stockSucursales, setStockSucursales] = useState<StockSucursal[]>([]);
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([]);
  const [carrito, setCarrito] = useState<
    { producto: Producto; cantidad: number; precio: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Fetch sucursales
  useEffect(() => {
    const fetchSucursales = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/sucursales/');
        const data = await response.json();
        setSucursales(data);
        if (data.length > 0) {
          setSelectedSucursal(data[0].id.toString());
        }
      } catch (error) {
        console.error('Error fetching sucursales:', error);
      }
    };

    fetchSucursales();
  }, []);

  // Fetch productos and stock
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoading(true);
        const productosResponse = await fetch(
          'http://localhost:8000/api/productos/'
        );
        const productosData = await productosResponse.json();
        setProductos(productosData);

        const stockResponse = await fetch('http://localhost:8000/api/stock/');
        const stockData = await stockResponse.json();
        setStockSucursales(stockData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  // Filter productos based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProductos(productos);
    } else {
      const filtered = productos.filter(
        (producto) =>
          producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          producto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          producto.marca.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProductos(filtered);
    }
  }, [searchTerm, productos]);

  const handleAddToCart = (
    producto: Producto,
    cantidad: number,
    precio: number
  ) => {
    const existingItem = carrito.find(
      (item) => item.producto.id === producto.id
    );

    if (existingItem) {
      setCarrito(
        carrito.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        )
      );
    } else {
      setCarrito([...carrito, { producto, cantidad, precio }]);
    }
  };

  const handleRemoveFromCart = (productoId: number) => {
    setCarrito(carrito.filter((item) => item.producto.id !== productoId));
  };

  const handleUpdateCartItem = (productoId: number, cantidad: number) => {
    setCarrito(
      carrito.map((item) =>
        item.producto.id === productoId ? { ...item, cantidad } : item
      )
    );
  };

  const handleProductCreated = (newProduct: Producto) => {
    setProductos((prev) => [...prev, newProduct]);
    toast.success('Producto creado exitosamente');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar productos por nombre o código"
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select
                  value={selectedSucursal}
                  onValueChange={setSelectedSucursal}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Seleccionar sucursal" />
                  </SelectTrigger>
                  <SelectContent>
                    {sucursales.map((sucursal) => (
                      <SelectItem
                        key={sucursal.id}
                        value={sucursal.id.toString()}
                      >
                        {sucursal.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <CreateProductModal onProductCreated={handleProductCreated} />
              </div>

              <Separator />

              <ProductoList
                productos={filteredProductos}
                stockSucursales={stockSucursales}
                selectedSucursal={Number.parseInt(selectedSucursal)}
                onAddToCart={handleAddToCart}
                loading={loading}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <CarritoVenta
          items={carrito}
          sucursal={sucursales.find(
            (s) => s.id.toString() === selectedSucursal
          )}
          onRemoveItem={handleRemoveFromCart}
          onUpdateItem={handleUpdateCartItem}
        />
      </div>
    </div>
  );
}
