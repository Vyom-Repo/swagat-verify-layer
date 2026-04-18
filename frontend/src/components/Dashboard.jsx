import PieChart from './PieChart'
import QualityTable from './QualityTable'

const SUMMARY_STATS = [
  {
    label: 'Total Grievances',
    value: '1,284',
    sub: 'This month',
    icon: '📋',
    color: 'bg-gov-600',
  },
  {
    label: 'Resolved',
    value: '1,102',
    sub: '85.8% resolution rate',
    icon: '✅',
    color: 'bg-emerald-600',
  },
  {
    label: 'Verified',
    value: '892',
    sub: '81% of resolved',
    icon: '🔍',
    color: 'bg-amber-500',
  },
  {
    label: 'Pending',
    value: '182',
    sub: 'Awaiting resolution',
    icon: '⏳',
    color: 'bg-rose-500',
  },
]

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-slide-up">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-gov-900 text-2xl">District Collector Dashboard</h2>
          <p className="text-gov-500 text-sm mt-1">
            Analytical overview of grievance resolution quality across departments
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gov-200 rounded-lg px-4 py-2 shadow-sm text-sm text-gov-600 self-start sm:self-auto">
          <svg className="w-4 h-4 text-gov-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-mono text-xs font-semibold">April 2025</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {SUMMARY_STATS.map((stat) => (
          <div key={stat.label}
            className="bg-white rounded-2xl shadow-lg border border-gov-100 p-5 hover:shadow-xl
              transition-shadow duration-200 group">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center
                text-lg shadow-md group-hover:scale-105 transition-transform`}>
                {stat.icon}
              </div>
            </div>
            <p className="font-heading text-2xl font-bold text-gov-900">{stat.value}</p>
            <p className="text-xs font-semibold text-gov-600 mt-0.5">{stat.label}</p>
            <p className="text-xs text-gov-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie chart – takes 1/3 width */}
        <div className="lg:col-span-1">
          <PieChart />
        </div>

        {/* Quick insights – takes 2/3 on large */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gov-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gov-900 to-gov-700 px-6 py-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Monthly Trend</h3>
              <p className="text-gov-300 text-xs">Resolution performance – last 6 months</p>
            </div>
          </div>
          <div className="p-6">
            {/* Simple bar chart using pure Tailwind */}
            {[
              { month: 'Nov', val: 72 },
              { month: 'Dec', val: 65 },
              { month: 'Jan', val: 78 },
              { month: 'Feb', val: 81 },
              { month: 'Mar', val: 79 },
              { month: 'Apr', val: 86 },
            ].map((d) => (
              <div key={d.month} className="flex items-center gap-3 mb-3">
                <span className="text-xs font-mono text-gov-400 w-8 text-right">{d.month}</span>
                <div className="flex-1 h-6 bg-gov-50 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gov-500 to-gov-400 rounded-lg flex items-center
                      justify-end pr-2 transition-all duration-700"
                    style={{ width: `${d.val}%` }}
                  >
                    <span className="text-white text-xs font-bold font-mono">{d.val}%</span>
                  </div>
                </div>
              </div>
            ))}
            <p className="text-xs text-gov-400 mt-4 text-right font-mono">
              ▲ +14pp improvement over 6 months
            </p>
          </div>
        </div>
      </div>

      {/* Full Quality Table */}
      <QualityTable />

      {/* Alert Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4 items-start shadow">
        <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-amber-800 text-sm">Action Required: Roads & Sanitation Departments</p>
          <p className="text-amber-700 text-xs mt-1">
            Quality scores below 65% threshold. Field verification compliance needs immediate attention.
            Escalation notices have been issued to department heads.
          </p>
        </div>
      </div>
    </div>
  )
}
