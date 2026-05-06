import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import './portal.css'
import RequireRole from './components/RequireRole'
import AppHub from './pages/AppHub'
import BrandKit from './pages/BrandKit'
import MarketingHome from './pages/MarketingHome'
import PortalLogin from './pages/PortalLogin'
import PrivacyPolicy from './pages/PrivacyPolicy'
import SeoChecker from './pages/SeoChecker'
import Terms from './pages/Terms'

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const AdminSetup = lazy(() => import('./pages/AdminSetup'))
const ClientInvoiceDetail = lazy(() => import('./pages/ClientInvoiceDetail'))
const ClientInvoices = lazy(() => import('./pages/ClientInvoices'))
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
        <Route path="/seo-checker" element={<SeoChecker />} />
        <Route path="/app" element={<Navigate to="/app/login" replace />} />
        <Route path="/app/hub" element={<AppHub />} />
        <Route path="/app/login" element={<PortalLogin />} />
        <Route path="/app/admin/setup" element={<AdminSetup />} />
        <Route path="/app/admin/login" element={<Navigate to="/app/login" replace />} />
        <Route
          path="/app/admin"
          element={
            <RequireRole role="admin" redirectTo="/app/login">
              <AdminDashboard />
            </RequireRole>
          }
        />
        <Route path="/app/forgot-password" element={<ForgotPassword />} />
        <Route path="/app/reset-password" element={<ResetPassword />} />
        <Route path="/app/client/login" element={<Navigate to="/app/login" replace />} />
        <Route path="/app/client/magic" element={<ClientMagic />} />
        <Route
          path="/app/client"
          element={
            <RequireRole role="client" redirectTo="/app/login">
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
