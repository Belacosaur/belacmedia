import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import './portal.css'
import RequireRole from './components/RequireRole'
import AppHub from './pages/AppHub'
import BrandKit from './pages/BrandKit'
import MarketingHome from './pages/MarketingHome'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Terms from './pages/Terms'

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const AdminSetup = lazy(() => import('./pages/AdminSetup'))
const ClientInvoiceDetail = lazy(() => import('./pages/ClientInvoiceDetail'))
const ClientInvoices = lazy(() => import('./pages/ClientInvoices'))
const ClientLogin = lazy(() => import('./pages/ClientLogin'))
const ClientMagic = lazy(() => import('./pages/ClientMagic'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const ClientShell = lazy(() => import('./pages/ClientShell'))

function RouteLoader() {
  return <div className="portal-main">Loading...</div>
}

export default function App() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
        <Route path="/" element={<MarketingHome />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/brand" element={<BrandKit />} />
        <Route path="/app" element={<AppHub />} />
        <Route path="/app/admin/setup" element={<AdminSetup />} />
        <Route path="/app/admin/login" element={<AdminLogin />} />
        <Route
          path="/app/admin"
          element={
            <RequireRole role="admin" redirectTo="/app/admin/login">
              <AdminDashboard />
            </RequireRole>
          }
        />
        <Route path="/app/forgot-password" element={<ForgotPassword />} />
        <Route path="/app/reset-password" element={<ResetPassword />} />
        <Route path="/app/client/login" element={<ClientLogin />} />
        <Route path="/app/client/magic" element={<ClientMagic />} />
        <Route
          path="/app/client"
          element={
            <RequireRole role="client" redirectTo="/app/client/login">
              <ClientShell />
            </RequireRole>
          }
        >
          <Route index element={<ClientInvoices />} />
          <Route path="invoices/:id" element={<ClientInvoiceDetail />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  )
}
