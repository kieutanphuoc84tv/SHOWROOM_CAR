import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, type ReactNode } from 'react'

// Layout components
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import { useGsapBrandEffects } from './hooks/useGsapBrandEffects'

// Page components
import HomePage from './pages/HomePage'
import VehiclesPage from './pages/VehiclesPage'
import VehicleDetailsPage from './pages/VehicleDetailsPage'
import TradeInPage from './pages/TradeInPage'
import FinancePage from './pages/FinancePage'
import BlogPage from './pages/BlogPage'
import BlogDetailPage from './pages/BlogDetailPage'
import LegalPage from './pages/LegalPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import NotFoundPage from './pages/NotFoundPage'

// Admin components
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminLayout from './components/admin/AdminLayout'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import VehicleManagerPage from './pages/admin/VehicleManagerPage'
import LeadManagerPage from './pages/admin/LeadManagerPage'
import TestDriveManagerPage from './pages/admin/TestDriveManagerPage'
import FinanceManagerPage from './pages/admin/FinanceManagerPage'
import PaymentManagerPage from './pages/admin/PaymentManagerPage'
import SettingsPage from './pages/admin/SettingsPage'
import DepositManagerPage from './pages/admin/DepositManagerPage'
import QuotationManagerPage from './pages/admin/QuotationManagerPage'
import InvoiceManagerPage from './pages/admin/InvoiceManagerPage'
import ReportsPage from './pages/admin/ReportsPage'

function AppShell({ children }: { children: ReactNode }) {
  useGsapBrandEffects()

  return (
    <div className="flex flex-col min-h-screen bg-surface-base text-text-primary antialiased">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen bg-surface-base">
            <div className="text-[13px] text-text-secondary">Loading...</div>
          </div>
        }>
          <Routes>
            {/* ── PUBLIC ROUTES ── */}
            <Route path="/" element={<AppShell><HomePage /></AppShell>} />
            <Route path="/vehicles" element={<AppShell><VehiclesPage /></AppShell>} />
            <Route path="/vehicles/:id" element={<AppShell><VehicleDetailsPage /></AppShell>} />
            <Route path="/trade-in" element={<AppShell><TradeInPage /></AppShell>} />
            <Route path="/financing" element={<AppShell><FinancePage /></AppShell>} />
            <Route path="/blog" element={<AppShell><BlogPage /></AppShell>} />
            <Route path="/blog/:slug" element={<AppShell><BlogDetailPage /></AppShell>} />
            <Route path="/legal" element={<AppShell><LegalPage /></AppShell>} />
            <Route path="/about" element={<AppShell><AboutPage /></AppShell>} />
            <Route path="/contact" element={<AppShell><ContactPage /></AppShell>} />

            {/* ── ADMIN AUTH ── */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/login" element={<Navigate to="/admin/login" replace />} />

            {/* ── ADMIN ROUTES (Protected) ── */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="vehicles" element={<VehicleManagerPage />} />
              <Route path="leads" element={<LeadManagerPage />} />
              <Route path="test-drives" element={<TestDriveManagerPage />} />
              <Route path="finance" element={<FinanceManagerPage />} />
              <Route path="payments" element={<PaymentManagerPage />} />
              <Route path="deposits" element={<DepositManagerPage />} />
              <Route path="quotations" element={<QuotationManagerPage />} />
              <Route path="invoices" element={<InvoiceManagerPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* ── 404 ── */}
            <Route path="*" element={<AppShell><NotFoundPage /></AppShell>} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
