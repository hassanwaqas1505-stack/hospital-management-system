function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-[#172235] dark:shadow-none">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <h2 className="mt-3 text-2xl font-bold text-slate-800 dark:text-white">
            {value}
          </h2>
        </div>

        <div className={`rounded-xl p-3 ${color}`}>
          <Icon size={25} />
        </div>
      </div>
    </div>
  )
}

export default StatCard
