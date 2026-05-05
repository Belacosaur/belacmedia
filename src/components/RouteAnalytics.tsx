import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPage } from '../lib/analytics'

export default function RouteAnalytics() {
  const location = useLocation()

  useEffect(() => {
    trackPage(location.pathname)
  }, [location.pathname])

  return null
}
