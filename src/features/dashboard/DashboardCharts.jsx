
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

const COLORS = ['#16a34a', '#f59e0b', '#3b82f6', '#ef4444']

function DashboardCharts({ appointments }) {
  const departmentCounts = appointments.reduce((result, appointment) => {
    const department = appointment.department || 'Other'

    result[department] = (result[department] || 0) + 1

    return result
  }, {})

  const departmentData = Object.entries(departmentCounts).map(
    ([name, total]) => ({
      name,
      total,
    })
  )

  const statuses = ['Confirmed', 'Pending', 'Completed', 'Cancelled']

  const statusData = statuses.map((status) => ({
    name: status,
    value: appointments.filter(
      (appointment) => appointment.status === status
    ).length,
  }))

  const hasDepartmentData = departmentData.length > 0
  const hasStatusData = statusData.some((item) => item.value > 0)

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

      {/* Appointments by Department */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-bold text-slate-800">
          Appointments by Department
        </h2>

        {hasDepartmentData ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
              />

              <YAxis allowDecimals={false} />

              <Tooltip />

              <Bar
                dataKey="total"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="py-20 text-center text-slate-400">
            No appointment data available.
          </p>
        )}
      </div>

      {/* Appointment Status */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-bold text-slate-800">
          Appointment Overview
        </h2>

        {hasStatusData ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData.filter((item) => item.value > 0)}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {statusData
                  .filter((item) => item.value > 0)
                  .map((item) => (
                    <Cell
                      key={item.name}
                      fill={
                        COLORS[statuses.indexOf(item.name)]
                      }
                    />
                  ))}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="py-20 text-center text-slate-400">
            No appointment data available.
          </p>
        )}
      </div>

    </div>
  )
}

export default DashboardCharts
