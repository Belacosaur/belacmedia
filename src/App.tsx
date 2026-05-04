import { Navigate, Route, Routes } from 'react-router-dom'
import './portal.css'
import AppHub from './pages/AppHub'
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'
import AdminSetup from './pages/AdminSetup'
import ClientInvoiceDetail from './pages/ClientInvoiceDetail'
import ClientInvoices from './pages/ClientInvoices'
import ClientLogin from './pages/ClientLogin'
import ClientMagic from './pages/ClientMagic'
import ClientShell from './pages/ClientShell'
import MarketingHome from './pages/MarketingHome'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MarketingHome />} />
      <Route path="/app" element={<AppHub />} />
      <Route path="/app/admin/setup" element={<AdminSetup />} />
      <Route path="/app/admin/login" element={<AdminLogin />} />
      <Route path="/app/admin" element={<AdminDashboard />} />
      <Route path="/app/client/login" element={<ClientLogin />} />
      <Route path="/app/client/magic" element={<ClientMagic />} />
      <Route path="/app/client" element={<ClientShell />}>
        <Route index element={<ClientInvoices />} />
        <Route path="invoices/:id" element={<ClientInvoiceDetail />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
