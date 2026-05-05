import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import RouteAnalytics from './components/RouteAnalytics.tsx'
import { initAnalytics } from './lib/analytics.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <RouteAnalytics />
      <App />
    </BrowserRouter>
  </StrictMode>,
)

initAnalytics()
