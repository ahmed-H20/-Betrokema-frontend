import { DirectionProvider } from '@radix-ui/react-direction'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider, getDefaultRouteForRole, useAuth } from '@/features/auth/AuthContext'
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
import { ClientLayout } from '@/features/client/ClientLayout'
import { ClientCatalogPage } from '@/features/client/ClientCatalogPage'
import { ClientInvoicesPage } from '@/features/client/ClientInvoicesPage'
import { ClientProfilePage } from '@/features/client/ClientProfilePage'
import { queryClient } from '@/lib/queryClient'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { InvoicePrintPage } from '@/pages/InvoicePrintPage'
import { PriceMenuPrintPage } from '@/pages/PriceMenuPrintPage'
import { PageTitleManager } from '@/components/layout/PageTitleManager'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { useNotificationSocket } from '@/features/notifications'

function NotificationGlobalListener() {
  useNotificationSocket()
  return null
}

function RoleHomeRedirect() {
  const { isAuthenticated, isLoading, role } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-on-surface-variant">جاري التوجيه...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !role) {
    return <Navigate replace to="/login" />
  }

  return <Navigate replace to={getDefaultRouteForRole(role)} />
}

function App() {
  return (
    <ErrorBoundary>
      <DirectionProvider dir="rtl">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <BrowserRouter>
              <PageTitleManager />
              <NotificationGlobalListener />
            <Routes>
              {/* Public Route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Dedicated Standalone Invoice Print Route */}
              <Route path="/invoices/print/:id" element={<InvoicePrintPage />} />
              <Route path="/print/invoice/:id" element={<InvoicePrintPage />} />

              {/* Dedicated Standalone Price Menu Print Route */}
              <Route path="/products/price-menu" element={<PriceMenuPrintPage />} />
              <Route path="/print/price-menu" element={<PriceMenuPrintPage />} />

              {/* Dynamic Root Redirection based on Authenticated Role */}
              <Route path="/" element={<RoleHomeRedirect />} />

              {/* Admin Operations Portal (Strictly restricted to Admin, Manager, Accountant) */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'manager', 'accountant']} />}>
                <Route path="/admin" element={<Navigate replace to="/products" />} />
                <Route path="/admin/*" element={<Navigate replace to="/products" />} />
                <Route element={<AppLayout />}>
                  <Route element={<ProductsPage />} path="/products" />
                  <Route element={<InvoicesPage />} path="/invoices" />
                  <Route element={<SellersPage />} path="/sellers" />
                  <Route element={<WarehousesPage />} path="/warehouses" />
                  <Route element={<AnalyticsPage />} path="/analytics" />
                </Route>
              </Route>

              {/* Seller Portal (Strictly restricted to Field Sales Reps) */}
              <Route element={<ProtectedRoute allowedRoles={['seller']} />}>
                <Route element={<SellerLayout />} path="/seller">
                  <Route element={<Navigate replace to="/seller/dashboard" />} index />
                  <Route element={<SellerDashboardPage />} path="dashboard" />
                  <Route element={<SellerClientsPage />} path="clients" />
                  <Route element={<SellerClientDetailPage />} path="clients/:id" />
                  <Route element={<SellerInvoicesPage />} path="invoices" />
                  <Route element={<SellerWarehousesPage />} path="warehouses" />
                </Route>
              </Route>

              {/* Client Portal (Strictly restricted to Customers / Clients) */}
              <Route element={<ProtectedRoute allowedRoles={['client']} />}>
                <Route element={<ClientLayout />} path="/client">
                  <Route element={<ClientCatalogPage />} index />
                  <Route element={<ClientCatalogPage />} path="catalog" />
                  <Route element={<ClientInvoicesPage />} path="invoices" />
                  <Route element={<ClientProfilePage />} path="profile" />
                </Route>
              </Route>

              {/* Fallback 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          <Toaster
            icons={{
              success: (
                <span className="material-symbols-outlined text-[24px] text-secondary-fixed">
                  task_alt
                </span>
              ),
            }}
            position="top-center"
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
    </ErrorBoundary>
  )
}

export default App
