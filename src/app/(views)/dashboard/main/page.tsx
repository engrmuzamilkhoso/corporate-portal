'use client'
import { api } from '@/utils/axios'
import { CSpinner } from '@coreui/react-pro'
import { useEffect, useState } from 'react'
import AdminDashboard from './admin'
import UserDashboard from './user'

const Dashboard = () => {
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (token) {
      const userData = JSON.parse(token)
      setRole(userData.role)
    }
  }, [])

  if (role === null) {
    return (
      <div className="d-flex justify-content-center">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: '100vh' }}
        >
          <CSpinner color="info" style={{ width: '5rem', height: '5rem' }} />
        </div>
      </div>
    )
  }
  return (
    <div>
      {role.toLowerCase() === 'corpadmin' || role.toLowerCase() === 'admin' ? (
        <AdminDashboard />
      ) : (
        <UserDashboard />
      )}
    </div>
  )
}

export default Dashboard
