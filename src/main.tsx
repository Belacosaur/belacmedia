import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import RouteAnalytics from './components/RouteAnalytics.tsx'
import SeoHead from './components/SeoHead.tsx'
import { initAnalytics } from './lib/analytics.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SeoHead />
      <RouteAnalytics />
      <App />
    </BrowserRouter>
  </StrictMode>,
)

initAnalytics()
