
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'

import { useAuth } from './features/auth/AuthContext'

import Login from './features/auth/Login'
import DashboardLayout from './components/layout/DashboardLayout'

import Dashboard from './features/dashboard/Dashboard'
import Patients from './features/patients/Patients'
import Doctors from './features/doctors/Doctors'
import Appointments from './features/appointments/Appointments'
import Billing from './features/billing/Billing'

function ProtectedRoute() {
  const { user } = useAuth()

  return user ? <Outlet /> : <Navigate to="/login" replace />
}

function PublicRoute() {
  const { user } = useAuth()

  return user ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Login />
  )
}

function RoleProtectedRoute({ allowedRoles }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/patients" element={<Patients />} />

          <Route path="/appointments" element={<Appointments />} />

          {/* Admin and Receptionist Routes */}
          <Route
            element={
              <RoleProtectedRoute allowedRoles={['Admin', 'Receptionist']} />
            }
          >
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/billing" element={<Billing />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
