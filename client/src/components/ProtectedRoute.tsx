import { Navigate, useLocation } from 'react-router-dom'
import { type ReactNode } from 'react'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation()
  const token = localStorage.getItem('admin_token')

  if (!token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  // Optional: verify token validity (simple JWT decode)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const isExpired = payload.exp * 1000 < Date.now()
    if (isExpired) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      return <Navigate to="/admin/login" replace />
    }
  } catch {
    // Token format issue — let the backend handle it
  }

  return <>{children}</>
}
