import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppLayout } from '@/components/layout/AppLayout'
import { AnalyticsPage } from '@/features/analytics/AnalyticsPage'
import { InvoicesPage } from '@/features/invoices/InvoicesPage'
import { ProductsPage } from '@/features/products/ProductsPage'
import { SellersPage } from '@/features/sellers/SellersPage'
import { WarehousesPage } from '@/features/warehouses/WarehousesPage'
import { queryClient } from '@/lib/queryClient'
import { NotFoundPage } from '@/pages/NotFoundPage'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />} path="/">
            <Route element={<Navigate replace to="/products" />} index />
            <Route element={<ProductsPage />} path="products" />
            <Route element={<InvoicesPage />} path="invoices" />
            <Route element={<SellersPage />} path="sellers" />
            <Route element={<WarehousesPage />} path="warehouses" />
            <Route element={<AnalyticsPage />} path="analytics" />
            <Route element={<NotFoundPage />} path="*" />
          </Route>
        </Routes>
        <Toaster richColors position="top-center" />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
