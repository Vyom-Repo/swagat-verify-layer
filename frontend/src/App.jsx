import { useState } from 'react'
import UploadForm from './components/UploadForm'
import Dashboard from './components/Dashboard'

const NAV_ITEMS = [
  {
    id: 'upload',
    label: 'Evidence Verification',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    id: 'dashboard',
    label: 'Collector Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('upload')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gov-50 via-blue-50 to-indigo-100">
      {/* Top Header */}
      <header className="bg-gov-950 text-white shadow-2xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Emblem placeholder */}
            <div className="w-10 h-10 bg-accent-400 rounded-full flex items-center justify-center text-gov-950 font-bold text-lg shadow-lg">
              🏛️
            </div>
            <div>
              <p className="text-accent-400 text-xs font-mono tracking-widest uppercase">Government of India</p>
              <h1 className="font-heading text-lg leading-tight">Grievance Resolution Verifier</h1>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-gov-300 text-xs font-mono">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse-slow inline-block"></span>
            System Online
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1 pb-0">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-t-lg transition-all duration-200
                  ${activeTab === item.id
                    ? 'bg-gov-50 text-gov-800 shadow-inner'
                    : 'text-gov-300 hover:text-white hover:bg-gov-800'
                  }`}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-fade-in">
          {activeTab === 'upload' && <UploadForm />}
          {activeTab === 'dashboard' && <Dashboard />}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-gov-400 text-xs font-mono border-t border-gov-200 mt-8">
        © 2025 Ministry of Grievance Redressal · Secure · Verified · Transparent
      </footer>
    </div>
  )
}
