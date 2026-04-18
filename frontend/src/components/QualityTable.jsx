const QUALITY_DATA = [
  { department: 'Water',       icon: '💧', total: 120, verified: 108, score: 90, trend: '+3%' },
  { department: 'Roads',       icon: '🛣️',  total: 100, verified: 60,  score: 60, trend: '-2%' },
  { department: 'Electricity', icon: '⚡',  total: 85,  verified: 72,  score: 85, trend: '+5%' },
  { department: 'Sanitation',  icon: '🧹',  total: 95,  verified: 57,  score: 60, trend: '0%'  },
]

function ScoreBar({ score }) {
  const color =
    score >= 80 ? 'bg-emerald-500' :
    score >= 60 ? 'bg-amber-400' :
                  'bg-red-500'

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gov-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`text-xs font-mono font-bold w-10 text-right
        ${score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
        {score}%
      </span>
    </div>
  )
}

function Badge({ score }) {
  if (score >= 80) return (
    <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700
      px-2 py-0.5 rounded-full font-semibold">
      ✓ Excellent
    </span>
  )
  if (score >= 60) return (
    <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700
      px-2 py-0.5 rounded-full font-semibold">
      ⚠ Moderate
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700
      px-2 py-0.5 rounded-full font-semibold">
      ✗ Poor
    </span>
  )
}

export default function QualityTable() {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gov-100 overflow-hidden">
      <div className="bg-gradient-to-r from-gov-900 to-gov-700 px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">Department Quality Scorecard</h3>
          <p className="text-gov-300 text-xs">Verification accuracy by department</p>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gov-50 border-b border-gov-100">
              {['Department', 'Total Resolved', 'Verified', 'Quality Score', 'Grade', 'Trend'].map((col) => (
                <th key={col} className="px-5 py-3 text-left text-xs font-semibold text-gov-500 uppercase tracking-wider">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {QUALITY_DATA.map((row, i) => (
              <tr key={row.department}
                className={`border-b border-gov-50 hover:bg-gov-50 transition-colors duration-150
                  ${i % 2 === 0 ? 'bg-white' : 'bg-gov-50/40'}`}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{row.icon}</span>
                    <span className="font-semibold text-gov-800">{row.department}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 font-mono text-gov-700">{row.total}</td>
                <td className="px-5 py-3.5 font-mono text-gov-700">{row.verified}</td>
                <td className="px-5 py-3.5 min-w-40">
                  <ScoreBar score={row.score} />
                </td>
                <td className="px-5 py-3.5">
                  <Badge score={row.score} />
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-mono font-semibold
                    ${row.trend.startsWith('+') ? 'text-emerald-600' :
                      row.trend.startsWith('-') ? 'text-red-500' : 'text-gov-400'}`}>
                    {row.trend}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gov-100">
        {QUALITY_DATA.map((row) => (
          <div key={row.department} className="px-5 py-4 space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xl">{row.icon}</span>
                <span className="font-semibold text-gov-800">{row.department}</span>
              </div>
              <Badge score={row.score} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-center">
              <div className="bg-gov-50 rounded-lg py-1.5">
                <p className="text-gov-400">Total</p>
                <p className="font-mono font-bold text-gov-800">{row.total}</p>
              </div>
              <div className="bg-gov-50 rounded-lg py-1.5">
                <p className="text-gov-400">Verified</p>
                <p className="font-mono font-bold text-gov-800">{row.verified}</p>
              </div>
              <div className="bg-gov-50 rounded-lg py-1.5">
                <p className="text-gov-400">Trend</p>
                <p className={`font-mono font-bold
                  ${row.trend.startsWith('+') ? 'text-emerald-600' :
                    row.trend.startsWith('-') ? 'text-red-500' : 'text-gov-400'}`}>
                  {row.trend}
                </p>
              </div>
            </div>
            <ScoreBar score={row.score} />
          </div>
        ))}
      </div>

      {/* Footer summary */}
      <div className="bg-gov-50 border-t border-gov-100 px-6 py-3 flex flex-wrap gap-4 justify-between items-center">
        <div className="text-xs text-gov-500">
          Last updated: <span className="font-mono font-semibold text-gov-700">Today, 09:45 IST</span>
        </div>
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full inline-block"/>≥80% Excellent</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-400 rounded-full inline-block"/>60–79% Moderate</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full inline-block"/>&lt;60% Poor</span>
        </div>
      </div>
    </div>
  )
}
