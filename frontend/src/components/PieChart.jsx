import { useRef, useEffect } from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Pie } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

const PIE_DATA = {
  labels: ['Water', 'Electricity', 'Roads', 'Sanitation'],
  datasets: [
    {
      data: [40, 25, 20, 15],
      backgroundColor: [
        '#3b51e8',
        '#f0a500',
        '#10b981',
        '#e94f6f',
      ],
      borderColor: '#ffffff',
      borderWidth: 3,
      hoverOffset: 8,
    },
  ],
}

const OPTIONS = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        font: { family: 'DM Sans', size: 13 },
        color: '#1a2480',
        padding: 16,
        usePointStyle: true,
        pointStyle: 'circle',
      },
    },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%`,
      },
    },
  },
}

export default function PieChart() {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gov-100 overflow-hidden">
      <div className="bg-gradient-to-r from-gov-900 to-gov-700 px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">Grievance Distribution</h3>
          <p className="text-gov-300 text-xs">By Department</p>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-xs mx-auto">
          <Pie data={PIE_DATA} options={OPTIONS} />
        </div>

        {/* Legend stats */}
        <div className="grid grid-cols-2 gap-2 mt-5">
          {PIE_DATA.labels.map((label, i) => (
            <div key={label} className="flex items-center gap-2 bg-gov-50 rounded-lg px-3 py-2">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: PIE_DATA.datasets[0].backgroundColor[i] }}
              />
              <span className="text-xs text-gov-700 font-medium">{label}</span>
              <span className="ml-auto text-xs font-mono font-bold text-gov-900">
                {PIE_DATA.datasets[0].data[i]}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
