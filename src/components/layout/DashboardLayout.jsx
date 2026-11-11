import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="flex-1 min-w-0 p-6">
        <Outlet />
      </main>
    </div>
  )
}

export default DashboardLayout
