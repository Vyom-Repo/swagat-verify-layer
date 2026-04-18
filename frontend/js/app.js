/**
 * Lakshya Verify — Frontend Application Logic
 */

const API = 'http://localhost:8000';

// ============================================================
// TAB NAVIGATION
// ============================================================
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;

        // Update nav
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update panels
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        document.getElementById(`tab-${tab}`).classList.add('active');

        // Load data for the tab
        if (tab === 'citizen') loadGrievances();
        if (tab === 'officer') loadOfficerGrievances();
        if (tab === 'department') loadDeptGrievances();
    });
});

// ============================================================
// INIT — Load departments and grievances
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    loadDepartments();
    loadGrievances();
});

async function loadDepartments() {
    try {
        const res = await fetch(`${API}/api/dashboard/departments`);
        const departments = await res.json();

        const citizenSelect = document.getElementById('citizen-department');
        const filterSelect = document.getElementById('filter-department');

        departments.forEach(dept => {
            const opt1 = new Option(dept.name, dept.id);
            const opt2 = new Option(dept.name, dept.id);
            citizenSelect.appendChild(opt1);
            filterSelect.appendChild(opt2);
        });
    } catch (err) {
        console.error('Failed to load departments:', err);
    }
}

// ============================================================
// CITIZEN — Submit complaint
// ============================================================
document.getElementById('complaint-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const lat = document.getElementById('citizen-lat').value;
    const long = document.getElementById('citizen-long').value;

    if (!lat || !long) {
        showToast('Please capture your GPS location first', 'error');
        return;
    }

    const payload = {
        citizen_name: document.getElementById('citizen-name').value,
        citizen_phone: document.getElementById('citizen-phone').value,
        department_id: parseInt(document.getElementById('citizen-department').value),
        description: document.getElementById('citizen-description').value,
        original_gps_lat: parseFloat(lat),
        original_gps_long: parseFloat(long),
    };

    try {
        const res = await fetch(`${API}/api/grievances/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (res.ok) {
            showToast(`Complaint #${data.grievance_id} submitted successfully!`, 'success');
            document.getElementById('complaint-form').reset();
            document.getElementById('gps-status').textContent = 'Not captured';
            document.getElementById('gps-status').classList.remove('captured');
            loadGrievances();
        } else {
            showToast(data.detail || 'Failed to submit complaint', 'error');
        }
    } catch (err) {
        showToast('Network error — is the backend running?', 'error');
    }
});

// ============================================================
// GPS CAPTURE
// ============================================================
function getGPSLocation() {
    const status = document.getElementById('gps-status');
    const btn = document.getElementById('btn-get-gps');

    if (!navigator.geolocation) {
        showToast('Geolocation is not supported by your browser', 'error');
        return;
    }

    status.textContent = 'Capturing...';
    btn.disabled = true;

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            document.getElementById('citizen-lat').value = pos.coords.latitude.toFixed(6);
            document.getElementById('citizen-long').value = pos.coords.longitude.toFixed(6);
            status.textContent = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
            status.classList.add('captured');
            btn.disabled = false;
        },
        (err) => {
            status.textContent = 'Failed — using default';
            // Default: Ahmedabad center
            document.getElementById('citizen-lat').value = '23.0225';
            document.getElementById('citizen-long').value = '72.5714';
            status.textContent = '23.02250, 72.57140 (default)';
            status.classList.add('captured');
            btn.disabled = false;
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

function getOfficerGPS() {
    const status = document.getElementById('officer-gps-status');
    const btn = document.getElementById('btn-officer-gps');

    if (!navigator.geolocation) {
        showToast('Geolocation is not supported', 'error');
        return;
    }

    status.textContent = 'Capturing...';
    btn.disabled = true;

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            document.getElementById('officer-lat').value = pos.coords.latitude.toFixed(6);
            document.getElementById('officer-long').value = pos.coords.longitude.toFixed(6);
            status.textContent = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
            status.classList.add('captured');
            btn.disabled = false;
        },
        (err) => {
            document.getElementById('officer-lat').value = '23.0225';
            document.getElementById('officer-long').value = '72.5714';
            status.textContent = '23.02250, 72.57140 (default)';
            status.classList.add('captured');
            btn.disabled = false;
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

// ============================================================
// PHOTO PREVIEW
// ============================================================
document.getElementById('evidence-photo').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const preview = document.getElementById('photo-preview');
    const placeholder = document.getElementById('upload-placeholder');

    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            preview.src = ev.target.result;
            preview.style.display = 'block';
            placeholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
});

// ============================================================
// OFFICER — Upload evidence
// ============================================================
document.getElementById('evidence-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const lat = document.getElementById('officer-lat').value;
    const long = document.getElementById('officer-long').value;

    if (!lat || !long) {
        showToast('Please capture GPS location first', 'error');
        return;
    }

    const grievanceId = document.getElementById('evidence-grievance-id').value;
    const photoFile = document.getElementById('evidence-photo').files[0];

    const formData = new FormData();
    formData.append('field_officer_gps_lat', lat);
    formData.append('field_officer_gps_long', long);
    if (photoFile) {
        formData.append('photo', photoFile);
    }

    try {
        const res = await fetch(`${API}/api/evidence/${grievanceId}`, {
            method: 'POST',
            body: formData,
        });
        const data = await res.json();

        if (res.ok) {
            let msg = `Evidence uploaded for Grievance #${grievanceId}`;
            if (data.verification) {
                msg += ` — Status: ${data.verification.new_status}`;
            }
            showToast(msg, 'success');
            document.getElementById('evidence-form').reset();
            document.getElementById('photo-preview').style.display = 'none';
            document.getElementById('upload-placeholder').style.display = '';
            document.getElementById('officer-gps-status').textContent = 'Not captured';
            document.getElementById('officer-gps-status').classList.remove('captured');
            loadOfficerGrievances();
        } else {
            showToast(data.detail || 'Failed to upload evidence', 'error');
        }
    } catch (err) {
        showToast('Network error', 'error');
    }
});

// ============================================================
// LOAD GRIEVANCES
// ============================================================
async function loadGrievances() {
    const container = document.getElementById('grievances-list');
    container.innerHTML = '<div class="spinner"></div>';

    const status = document.getElementById('filter-status')?.value || '';
    const dept = document.getElementById('filter-department')?.value || '';

    let url = `${API}/api/grievances/?`;
    if (status) url += `status=${encodeURIComponent(status)}&`;
    if (dept) url += `department_id=${dept}&`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        renderGrievanceCards(container, data, 'citizen');
    } catch (err) {
        container.innerHTML = emptyState('Could not load grievances. Is the backend running?');
    }
}

async function loadOfficerGrievances() {
    const container = document.getElementById('officer-grievances-list');
    container.innerHTML = '<div class="spinner"></div>';

    try {
        const res = await fetch(`${API}/api/grievances/?status=${encodeURIComponent('Verifying')}`);
        const verifying = await res.json();

        const res2 = await fetch(`${API}/api/grievances/?status=${encodeURIComponent('Pending Verification')}`);
        const pending = await res2.json();

        const all = [...verifying, ...pending];
        renderGrievanceCards(container, all, 'officer');
    } catch (err) {
        container.innerHTML = emptyState('Could not load grievances');
    }
}

async function loadDeptGrievances() {
    const container = document.getElementById('dept-grievances-list');
    container.innerHTML = '<div class="spinner"></div>';

    try {
        const res1 = await fetch(`${API}/api/grievances/?status=${encodeURIComponent('Pending Verification')}`);
        const pending = await res1.json();

        const res2 = await fetch(`${API}/api/grievances/?status=${encodeURIComponent('Reopened')}`);
        const reopened = await res2.json();

        const all = [...pending, ...reopened];
        renderGrievanceCards(container, all, 'department');
    } catch (err) {
        container.innerHTML = emptyState('Could not load grievances');
    }
}

// ============================================================
// RENDER CARDS
// ============================================================
function renderGrievanceCards(container, grievances, mode) {
    if (!grievances.length) {
        container.innerHTML = emptyState('No grievances found');
        return;
    }

    container.innerHTML = grievances.map(g => {
        const statusClass = getStatusClass(g.status);
        const badgeClass = getBadgeClass(g.status);
        const date = g.created_at ? new Date(g.created_at).toLocaleDateString() : '';

        let actions = '';
        if (mode === 'department' && (g.status === 'Pending Verification' || g.status === 'Reopened')) {
            actions = `
                <div class="card-actions">
                    <button class="btn btn-success btn-sm" onclick="event.stopPropagation(); resolveGrievance(${g.id})">
                        ✓ Mark Resolved
                    </button>
                </div>`;
        }
        if (mode === 'officer') {
            actions = `
                <div class="card-actions">
                    <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); prefillEvidence(${g.id})">
                        📷 Upload Evidence
                    </button>
                </div>`;
        }

        return `
            <div class="grievance-card ${statusClass}" onclick="showGrievanceDetail(${g.id})">
                <div class="card-header">
                    <span class="card-id">#${g.id}</span>
                    <span class="status-badge ${badgeClass}">${g.status}</span>
                </div>
                <div class="card-title">${escapeHtml(g.description || 'No description')}</div>
                <div class="card-meta">
                    <span>🏛 ${g.department_name || 'Dept ' + g.department_id}</span>
                    <span>👤 ${escapeHtml(g.citizen_name || 'Anonymous')}</span>
                    <span>📅 ${date}</span>
                </div>
                ${actions}
            </div>`;
    }).join('');
}

function getStatusClass(status) {
    const map = {
        'Pending Verification': 'status-pending',
        'Verifying': 'status-verifying',
        'Verified Closed': 'status-verified',
        'Reopened': 'status-reopened',
    };
    return map[status] || '';
}

function getBadgeClass(status) {
    const map = {
        'Pending Verification': 'pending',
        'Verifying': 'verifying',
        'Verified Closed': 'verified',
        'Reopened': 'reopened',
    };
    return map[status] || '';
}

// ============================================================
// GRIEVANCE DETAIL MODAL
// ============================================================
async function showGrievanceDetail(id) {
    const modal = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');

    content.innerHTML = '<div class="spinner"></div>';
    modal.classList.add('open');

    try {
        const res = await fetch(`${API}/api/grievances/${id}`);
        const g = await res.json();

        const statusBadge = `<span class="status-badge ${getBadgeClass(g.status)}">${g.status}</span>`;

        let evidenceHtml = '';
        if (g.evidence_logs && g.evidence_logs.length) {
            evidenceHtml = `
                <div class="evidence-section">
                    <h4>📋 Evidence Logs (${g.evidence_logs.length})</h4>
                    ${g.evidence_logs.map(e => `
                        <div class="evidence-item">
                            <div class="modal-detail-grid">
                                <div class="detail-item">
                                    <span class="detail-label">Officer GPS</span>
                                    <span class="detail-value">${e.field_officer_gps_lat ?? 'N/A'}, ${e.field_officer_gps_long ?? 'N/A'}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">IVR Response</span>
                                    <span class="detail-value">${e.ivr_keypress === 1 ? '✅ Satisfied' : e.ivr_keypress === 2 ? '❌ Not Satisfied' : '⏳ Awaiting'}</span>
                                </div>
                                ${e.photo_url ? `
                                <div class="detail-item" style="grid-column: 1/-1">
                                    <span class="detail-label">Photo</span>
                                    <a href="${e.photo_url}" target="_blank" style="color: var(--accent-cyan)">${e.photo_url}</a>
                                </div>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>`;
        }

        content.innerHTML = `
            <h3 style="margin-bottom: 0.25rem; display: flex; align-items: center; gap: 0.75rem;">
                Grievance #${g.id} ${statusBadge}
            </h3>
            <p style="color: var(--text-secondary); margin-bottom: 1rem; font-size: 0.9rem;">${escapeHtml(g.description)}</p>

            <div class="modal-detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Citizen</span>
                    <span class="detail-value">${escapeHtml(g.citizen_name)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Phone</span>
                    <span class="detail-value">${g.citizen_phone}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Department</span>
                    <span class="detail-value">${g.department_name || 'Dept ' + g.department_id}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Location</span>
                    <span class="detail-value">${g.original_gps_lat}, ${g.original_gps_long}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Filed On</span>
                    <span class="detail-value">${g.created_at ? new Date(g.created_at).toLocaleString() : 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">IVR Call SID</span>
                    <span class="detail-value">${g.ivr_call_sid || 'None'}</span>
                </div>
            </div>
            ${evidenceHtml}

            ${g.status === 'Verifying' ? `
            <div style="margin-top: 1.25rem; padding-top: 1.25rem; border-top: 1px solid var(--border-glass);">
                <h4 style="margin-bottom: 0.75rem; color: var(--accent-amber);">⚡ Simulate IVR Response</h4>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-success btn-sm" onclick="simulateIVR(${g.id}, 1)">Press 1 — Satisfied</button>
                    <button class="btn btn-danger btn-sm" onclick="simulateIVR(${g.id}, 2)">Press 2 — Not Satisfied</button>
                </div>
            </div>` : ''}
        `;
    } catch (err) {
        content.innerHTML = '<p style="color: var(--accent-red)">Failed to load grievance details</p>';
    }
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('open');
}

// Close modal on outside click
document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
});

// Close modal on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// ============================================================
// ACTIONS
// ============================================================
async function resolveGrievance(id) {
    try {
        const res = await fetch(`${API}/api/grievances/${id}/resolve`, { method: 'PATCH' });
        const data = await res.json();

        if (res.ok) {
            showToast(`Grievance #${id} → Verifying. IVR call initiated.`, 'success');
            loadDeptGrievances();
            loadGrievances();
        } else {
            showToast(data.detail || 'Failed to resolve', 'error');
        }
    } catch (err) {
        showToast('Network error', 'error');
    }
}

async function simulateIVR(grievanceId, keypress) {
    try {
        const res = await fetch(`${API}/api/ivr/simulate/${grievanceId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keypress }),
        });
        const data = await res.json();

        if (res.ok) {
            const outcome = keypress === 1 ? 'Satisfied' : 'Not Satisfied';
            showToast(`IVR simulated for #${grievanceId} — Citizen: ${outcome}`, keypress === 1 ? 'success' : 'info');
            closeModal();
            loadGrievances();
        } else {
            showToast(data.detail || 'Simulation failed', 'error');
        }
    } catch (err) {
        showToast('Network error', 'error');
    }
}

function prefillEvidence(id) {
    document.getElementById('evidence-grievance-id').value = id;
    document.getElementById('evidence-grievance-id').focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Evidence form prefilled for Grievance #${id}`, 'info');
}

// ============================================================
// UTILITIES
// ============================================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function emptyState(msg) {
    return `
        <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
            </svg>
            <h3>${msg}</h3>
            <p>Submit a complaint or check your backend connection.</p>
        </div>`;
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
