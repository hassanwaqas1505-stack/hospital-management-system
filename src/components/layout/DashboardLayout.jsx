
import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'

function DashboardLayout() {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('hospital_theme') === 'dark'
  )

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Apply and save theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)

    localStorage.setItem(
      'hospital_theme',
      darkMode ? 'dark' : 'light'
    )
  }, [darkMode])

  // Close sidebar whenever route changes
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Lock background scrolling and support Escape key
  useEffect(() => {
    if (!sidebarOpen) return

    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [sidebarOpen])

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-800 transition-colors duration-300 dark:bg-[#0b1220] dark:text-slate-100">

      <Sidebar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="min-w-0 flex-1 p-4 transition-colors duration-300 sm:p-5 md:p-6">

        {/* Mobile Topbar */}
        <div className="mb-5 flex items-center gap-3 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
            aria-expanded={sidebarOpen}
            className="rounded-lg bg-white p-2 text-slate-700 shadow-sm transition hover:bg-slate-200 dark:bg-[#172235] dark:text-white dark:hover:bg-slate-700"
          >
            <Menu size={24} />
          </button>

          <span className="font-bold text-slate-800 dark:text-white">
            MediCare
          </span>
        </div>

        <Outlet />
      </main>
    </div>
  )
}

export default DashboardLayout
