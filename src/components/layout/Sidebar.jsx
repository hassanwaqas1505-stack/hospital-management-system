
import { NavLink, useNavigate } from 'react-router-dom'

import {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarDays,
  Receipt,
  Hospital,
  LogOut,
} from 'lucide-react'

import { useAuth } from '../../features/auth/AuthContext'

const navItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    roles: ['Admin', 'Doctor', 'Receptionist'],
  },
  {
    name: 'Patients',
    path: '/patients',
    icon: Users,
    roles: ['Admin', 'Doctor', 'Receptionist'],
  },
  {
    name: 'Doctors',
    path: '/doctors',
    icon: Stethoscope,
    roles: ['Admin', 'Receptionist'],
  },
  {
    name: 'Appointments',
    path: '/appointments',
    icon: CalendarDays,
    roles: ['Admin', 'Doctor', 'Receptionist'],
  },
  {
    name: 'Billing',
    path: '/billing',
    icon: Receipt,
    roles: ['Admin', 'Receptionist'],
  },
]

function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role)
  )

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="flex min-h-screen w-64 flex-col bg-slate-900 p-5 text-white">
      {/* Logo */}
      <div className="mb-10 flex items-center gap-3">
        <Hospital size={30} className="text-cyan-400" />
        <h1 className="text-xl font-bold">MediCare</h1>
      </div>

      {/* Navigation */}
      <p className="mb-4 text-xs uppercase tracking-wider text-slate-400">
        Main Menu
      </p>

      <nav className="flex-1 space-y-2">
        {filteredNavItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                  isActive
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* User Information */}
      <div className="mb-4 border-t border-slate-700 pt-4">
        <p className="truncate text-sm font-medium text-white">
          {user?.name}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {user?.role}
        </p>

        <p className="mt-1 truncate text-xs text-slate-500">
          {user?.email}
        </p>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </aside>
  )
}

export default Sidebar
