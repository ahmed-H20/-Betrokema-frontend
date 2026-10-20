import { DirectionProvider } from '@radix-ui/react-direction'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/features/auth/AuthContext'
import { LoginPage } from '@/features/auth/LoginPage'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { AnalyticsPage } from '@/features/analytics/AnalyticsPage'
import { InvoicesPage } from '@/features/invoices/InvoicesPage'
import { ProductsPage } from '@/features/products/ProductsPage'
import { SellersPage } from '@/features/sellers/SellersPage'
import { WarehousesPage } from '@/features/warehouses/WarehousesPage'
import { SellerLayout } from '@/features/seller/SellerLayout'
import { SellerDashboardPage } from '@/features/seller/SellerDashboardPage'
import { SellerClientsPage } from '@/features/seller/SellerClientsPage'
import { SellerClientDetailPage } from '@/features/seller/SellerClientDetailPage'
import { SellerInvoicesPage } from '@/features/seller/SellerInvoicesPage'
import { SellerWarehousesPage } from '@/features/seller/SellerWarehousesPage'
import { queryClient } from '@/lib/queryClient'
import { NotFoundPage } from '@/pages/NotFoundPage'

function App() {
  return (
    // Radix primitives (Tabs, Select, DropdownMenu, ...) default their own
    // internal `dir` to "ltr" unless told otherwise — they don't inherit
    // <html dir="rtl">. Without this provider, Radix renders a stray
    // dir="ltr" on its own DOM output, which silently reverses column order
    // on any <table> nested inside (e.g. Tabs.Content), among other things.
    // This app is RTL-only (CLAUDE.md), so set it globally, once.
    <DirectionProvider dir="rtl">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Application Layout */}
              <Route element={<ProtectedRoute />}>
                {/* Admin Operations Layout */}
                <Route element={<AppLayout />} path="/">
                  <Route element={<Navigate replace to="/products" />} index />
                  <Route element={<ProductsPage />} path="products" />
                  <Route element={<InvoicesPage />} path="invoices" />
                  <Route element={<SellersPage />} path="sellers" />
                  <Route element={<WarehousesPage />} path="warehouses" />
                  <Route element={<AnalyticsPage />} path="analytics" />
                </Route>

                {/* Seller Portal (Field Sales Rep Interface - Mobile First) */}
                <Route element={<SellerLayout />} path="/seller">
                  <Route element={<Navigate replace to="/seller/dashboard" />} index />
                  <Route element={<SellerDashboardPage />} path="dashboard" />
                  <Route element={<SellerClientsPage />} path="clients" />
                  <Route element={<SellerClientDetailPage />} path="clients/:id" />
                  <Route element={<SellerInvoicesPage />} path="invoices" />
                  <Route element={<SellerWarehousesPage />} path="warehouses" />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          <Toaster
            icons={{
              success: (
                <span className="material-symbols-outlined text-[24px] text-secondary-fixed">
                  task_alt
                </span>
              ),
            }}
            position="bottom-left"
            toastOptions={{
              unstyled: true,
              classNames: {
                toast:
                  'flex items-center gap-space-sm rounded-xl bg-primary-container px-space-lg py-space-md text-on-primary shadow-2xl',
                title: 'font-body-md text-body-md font-medium',
              },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
    </DirectionProvider>
  )
}

export default App
