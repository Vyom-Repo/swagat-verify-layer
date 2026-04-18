import { useState, useEffect, useCallback } from 'react';
import {
    Chart as ChartJS,
    ArcElement, Tooltip, Legend,
    CategoryScale, LinearScale, BarElement, Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import './App.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const API = 'http://localhost:8000';

export default function App() {
    const [stats, setStats] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [fraudAlerts, setFraudAlerts] = useState([]);
    const [recent, setRecent] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [statsRes, deptRes, fraudRes, recentRes] = await Promise.all([
                fetch(`${API}/api/dashboard/stats`),
                fetch(`${API}/api/dashboard/departments`),
                fetch(`${API}/api/dashboard/fraud-alerts`),
                fetch(`${API}/api/dashboard/recent?limit=10`),
            ]);
            setStats(await statsRes.json());
            setDepartments(await deptRes.json());
            setFraudAlerts(await fraudRes.json());
            setRecent(await recentRes.json());
        } catch (err) {
            console.error('Dashboard fetch failed:', err);
        }
        setLoading(false);
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner" />
            </div>
        );
    }

    // Chart data — Status Distribution (Doughnut)
    const statusChartData = {
        labels: ['Pending', 'Verifying', 'Verified', 'Reopened'],
        datasets: [{
            data: [
                stats?.pending_verification || 0,
                stats?.verifying || 0,
                stats?.verified_closed || 0,
                stats?.reopened || 0,
            ],
            backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'],
            borderColor: 'transparent',
            borderWidth: 0,
            hoverOffset: 6,
        }],
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: '#94a3b8', padding: 16, usePointStyle: true, pointStyleWidth: 10, font: { size: 12 } },
            },
        },
    };

    // Chart data — Department Comparison (Bar)
    const barData = {
        labels: departments.map(d => d.name),
        datasets: [
            {
                label: 'Verified',
                data: departments.map(d => d.verified_closed),
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderRadius: 4,
            },
            {
                label: 'Reopened',
                data: departments.map(d => d.reopened),
                backgroundColor: 'rgba(239, 68, 68, 0.7)',
                borderRadius: 4,
            },
            {
                label: 'Pending',
                data: departments.map(d => d.pending),
                backgroundColor: 'rgba(245, 158, 11, 0.7)',
                borderRadius: 4,
            },
        ],
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: '#94a3b8', padding: 16, usePointStyle: true, font: { size: 12 } },
            },
        },
        scales: {
            x: {
                ticks: { color: '#64748b', font: { size: 11 } },
                grid: { display: false },
            },
            y: {
                ticks: { color: '#64748b', font: { size: 11 } },
                grid: { color: 'rgba(255,255,255,0.04)' },
                beginAtZero: true,
            },
        },
    };

    const getRateClass = (rate) => rate <= 15 ? 'good' : rate <= 30 ? 'warning' : 'bad';

    const getStatusDot = (status) => {
        const map = {
            'Pending Verification': 'pending',
            'Verifying': 'verifying',
            'Verified Closed': 'verified',
            'Reopened': 'reopened',
        };
        return map[status] || '';
    };

    const timeAgo = (dateStr) => {
        if (!dateStr) return '';
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    return (
        <div className="dashboard">
            {/* Header */}
            <header className="dash-header">
                <div className="dash-header-inner">
                    <div className="dash-brand">
                        <div className="dash-brand-icon">🛡️</div>
                        <h1>Lakshya <span>Dashboard</span></h1>
                    </div>
                    <div className="dash-header-right">
                        <a href="/static/index.html" className="back-link">← Back to Portal</a>
                        <button className="refresh-btn" onClick={fetchAll}>⟳ Refresh</button>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="dash-main">
                <h2 className="dash-title">District Collector Overview</h2>
                <p className="dash-subtitle">
                    Real-time verification analytics • {stats?.total_grievances || 0} total grievances tracked
                </p>

                {/* Stat Cards */}
                <div className="stats-grid">
                    <div className="stat-card indigo">
                        <div className="stat-label">Total Grievances</div>
                        <div className="stat-value indigo">{stats?.total_grievances || 0}</div>
                    </div>
                    <div className="stat-card green">
                        <div className="stat-label">Verified Closed</div>
                        <div className="stat-value green">{stats?.verified_closed || 0}</div>
                        <div className="stat-sub">{stats?.verification_rate_pct || 0}% verification rate</div>
                    </div>
                    <div className="stat-card red">
                        <div className="stat-label">Reopened</div>
                        <div className="stat-value red">{stats?.reopened || 0}</div>
                        <div className="stat-sub">{stats?.reopen_rate_pct || 0}% reopen rate</div>
                    </div>
                    <div className="stat-card amber">
                        <div className="stat-label">Pending</div>
                        <div className="stat-value amber">{stats?.pending_verification || 0}</div>
                    </div>
                    <div className="stat-card blue">
                        <div className="stat-label">Verifying</div>
                        <div className="stat-value blue">{stats?.verifying || 0}</div>
                    </div>
                    <div className="stat-card cyan">
                        <div className="stat-label">Avg Quality Score</div>
                        <div className="stat-value cyan">{stats?.avg_quality_score || 0}</div>
                        <div className="stat-sub">{stats?.failed_ivr_count || 0} failed IVR calls</div>
                    </div>
                </div>

                {/* Charts */}
                <div className="charts-row">
                    <div className="chart-card">
                        <h3>📊 Status Distribution</h3>
                        <div style={{ height: 280 }}>
                            <Doughnut data={statusChartData} options={doughnutOptions} />
                        </div>
                    </div>
                    <div className="chart-card">
                        <h3>📈 Department Comparison</h3>
                        <div style={{ height: 280 }}>
                            <Bar data={barData} options={barOptions} />
                        </div>
                    </div>
                </div>

                {/* Department Table */}
                <div className="table-card">
                    <h3>🏛 Department Performance</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Department</th>
                                <th>Total</th>
                                <th>Verified</th>
                                <th>Reopened</th>
                                <th>Reopen Rate</th>
                                <th>Failed IVR</th>
                                <th>Quality Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departments.map(d => (
                                <tr key={d.id}>
                                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.name}</td>
                                    <td>{d.total_grievances}</td>
                                    <td style={{ color: 'var(--accent-green)' }}>{d.verified_closed}</td>
                                    <td style={{ color: 'var(--accent-red)' }}>{d.reopened}</td>
                                    <td>
                                        <span className={`rate-pill ${getRateClass(d.reopen_rate_pct)}`}>
                                            {d.reopen_rate_pct}%
                                        </span>
                                    </td>
                                    <td>{d.failed_ivr_count}</td>
                                    <td>{d.quality_score}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Bottom row: Fraud Alerts + Recent Activity */}
                <div className="charts-row">
                    {/* Fraud Alerts */}
                    <div className="table-card" style={{ marginBottom: 0 }}>
                        <h3>🚨 Fraud Alerts — GPS Mismatch ({fraudAlerts.length})</h3>
                        {fraudAlerts.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>No fraud alerts detected</p>
                        ) : (
                            <div className="alerts-list">
                                {fraudAlerts.map((a, i) => (
                                    <div className="alert-card" key={i}>
                                        <div className="alert-icon">⚠️</div>
                                        <div className="alert-info">
                                            <h4>Grievance #{a.grievance_id} — {a.department}</h4>
                                            <p>
                                                {a.citizen_name} • IVR: {a.ivr_keypress === 1 ? '✅ Satisfied' : a.ivr_keypress === 2 ? '❌ Unsatisfied' : '⏳ Pending'}
                                            </p>
                                        </div>
                                        <div className="alert-distance">
                                            <div className="dist-val">{(a.distance_meters / 1000).toFixed(1)}km</div>
                                            <div className="dist-label">GPS offset</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Activity */}
                    <div className="table-card" style={{ marginBottom: 0 }}>
                        <h3>⏱ Recent Activity</h3>
                        <div>
                            {recent.map((r, i) => (
                                <div className="recent-item" key={i}>
                                    <div className={`recent-dot ${getStatusDot(r.status)}`} />
                                    <div className="recent-text">
                                        <strong>#{r.id}</strong> {r.description} — <em>{r.department}</em>
                                    </div>
                                    <div className="recent-time">{timeAgo(r.updated_at)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
