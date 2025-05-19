'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { VentaContainer } from '@/components/venta-container';
import { StockNotification } from '@/components/stock-notification';
import { NotificationCenter } from '@/components/notification-center';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar showNotifications={true} />

      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Sistema Ferremas</h1>
          <NotificationCenter />
        </div>

        <StockNotification />
        <VentaContainer />
      </div>
    </main>
  );
}
