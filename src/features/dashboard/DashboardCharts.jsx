
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

  const axisColor = '#94a3b8'
  const gridColor = '#334155'

  const tooltipStyle = {
    backgroundColor: '#172235',
    border: '1px solid #334155',
    borderRadius: '10px',
    color: '#f1f5f9',
  }

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">

      {/* Appointments by Department */}
      <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors duration-300 sm:p-6 dark:border-slate-700 dark:bg-[#172235] dark:shadow-none">

        <h2 className="mb-4 text-base font-bold text-slate-800 sm:mb-6 sm:text-lg dark:text-white">
          Appointments by Department
        </h2>

        {hasDepartmentData ? (
          <div className="h-[260px] w-full min-w-0 sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={departmentData}
                margin={{
                  top: 10,
                  right: 5,
                  left: -20,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={gridColor}
                />

                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: axisColor }}
                  axisLine={{ stroke: gridColor }}
                  tickLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={55}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: axisColor }}
                  axisLine={false}
                  tickLine={false}
                  width={35}
                />

                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
                />

                <Bar
                  dataKey="total"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={55}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-16 text-center text-sm text-slate-400 dark:text-slate-500">
            No appointment data available.
          </p>
        )}
      </div>

      {/* Appointment Status */}
      <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors duration-300 sm:p-6 dark:border-slate-700 dark:bg-[#172235] dark:shadow-none">

        <h2 className="mb-4 text-base font-bold text-slate-800 sm:mb-6 sm:text-lg dark:text-white">
          Appointment Overview
        </h2>

        {hasStatusData ? (
          <div className="h-[260px] w-full min-w-0 sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData.filter((item) => item.value > 0)}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius="65%"
                  label={false}
                >
                  {statusData
                    .filter((item) => item.value > 0)
                    .map((item) => (
                      <Cell
                        key={item.name}
                        fill={COLORS[statuses.indexOf(item.name)]}
                        stroke="none"
                      />
                    ))}
                </Pie>

                <Tooltip contentStyle={tooltipStyle} />

                <Legend
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{
                    fontSize: '12px',
                    paddingTop: '10px',
                  }}
                  formatter={(value) => (
                    <span style={{ color: axisColor, fontSize: 12 }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-16 text-center text-sm text-slate-400 dark:text-slate-500">
            No appointment data available.
          </p>
        )}
      </div>

    </div>
  )
}

export default DashboardCharts
