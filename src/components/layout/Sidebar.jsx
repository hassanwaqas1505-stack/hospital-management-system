
import { NavLink, useNavigate } from 'react-router-dom'

import {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarDays,
  Receipt,
  Hospital,
  LogOut,
  Sun,
  Moon,
  X,
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

function Sidebar({ darkMode, setDarkMode, isOpen, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role)
  )

  function handleLogout() {
    logout()
    onClose?.()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex h-dvh w-64 flex-col overflow-y-auto
          bg-slate-900 p-5 text-white
          transition-transform duration-300
          md:sticky md:top-0 md:z-30 md:translate-x-0
          ${
            isOpen
              ? 'translate-x-0'
              : '-translate-x-full'
          }
        `}
      >
        {/* Logo */}
        <div className="mb-6 flex shrink-0 items-center justify-between">
          <div className="flex items-center gap-3">
            <Hospital size={30} className="text-cyan-400" />
            <h1 className="text-xl font-bold">MediCare</h1>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 md:hidden"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation */}
        <p className="mb-3 shrink-0 text-xs uppercase tracking-wider text-slate-400">
          Main Menu
        </p>

        <nav className="flex-1 space-y-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
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
        <div className="mb-3 mt-5 shrink-0 border-t border-slate-700 pt-3">
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

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={() => setDarkMode((prev) => !prev)}
          aria-label="Toggle theme"
          className="mb-2 flex w-full shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-slate-300 transition hover:bg-slate-800 hover:text-cyan-400"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </aside>
    </>
  )
}

export default Sidebar
