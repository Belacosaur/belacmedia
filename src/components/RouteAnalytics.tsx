import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPage } from '../lib/analytics'

export default function RouteAnalytics() {
  const location = useLocation()

  useEffect(() => {
    const path = `${location.pathname}${location.search}`
    trackPage(path)
  }, [location.pathname, location.search])

  return null
}
