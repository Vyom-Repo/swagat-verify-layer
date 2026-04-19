// ===== HELPERS (moved from data.js) =====
// Status explanation helper
function getStatusExplanation(g) {
  if (g.status === 'Pending' && !g.assigned_officer) return 'Pending because not assigned';
  if (g.status === 'Pending' && !g.photo_uploaded) return 'Pending because field officer has not submitted evidence';
  if (g.status === 'Pending' && g.ivr_status === 'No Response') return 'Pending because IVR not completed';
  if (g.status === 'Pending' && g.ivr_status === 'Pending') return 'Pending because awaiting IVR verification';
  if (g.status === 'Pending') return 'Pending because review in progress';
  if (g.status === 'Submitted') return 'Submitted by field officer, awaiting monitoring review';
  if (g.status === 'Approved') return 'Approved because all checks passed';
  if (g.status === 'Rejected' && g.rejection_reason) return 'Rejected: ' + g.rejection_reason;
  if (g.status === 'Rejected') return 'Rejected because proof or location mismatch';
  if (g.status === 'Reopened' && g.reopen_reason) return 'Reopened: ' + g.reopen_reason;
  if (g.status === 'Reopened') return 'Reopened because citizen was not satisfied';
  return g.status;
}

// IVR detail helper
function getIVRDetails(g) {
  return {
    call_initiated: g.ivr_call_time ? true : false,
    call_answered: ['Confirmed', 'Not Confirmed'].includes(g.ivr_status),
    citizen_confirmed: g.ivr_status === 'Confirmed',
    no_response: g.ivr_status === 'No Response',
    failed: g.ivr_status === 'Failed',
    timestamp: g.ivr_call_time || 'N/A',
    summary: g.ivr_status === 'Confirmed' ? 'Citizen confirmed resolution' :
             g.ivr_status === 'Not Confirmed' ? 'Citizen denied resolution' :
             g.ivr_status === 'No Response' ? 'Citizen did not answer call' :
             g.ivr_status === 'Failed' ? 'Call could not be connected' :
             'IVR call not yet initiated'
  };
}

// ===== GLOBAL DATA =====
let GRIEVANCES = [];

// ===== STATUS MAPPING =====
function mapBackendStatus(status) {
  if (!status) return 'Pending';
  const map = {
    'pending': 'Pending',
    'VERIFIED': 'Approved',
    'REOPENED': 'Reopened',
    'Pending': 'Pending',
    'Submitted': 'Submitted',
    'Approved': 'Approved',
    'Rejected': 'Rejected',
    'Reopened': 'Reopened'
  };
  return map[status] || status;
}

// ===== AUTH CHECK =====
(function() {
  if (sessionStorage.getItem('logged_in') !== 'true') {
    // For demo allow direct access too
    // window.location.href = 'index.html'; return;
  }
  const name = sessionStorage.getItem('officer_name') || 'MO-Admin';
  document.getElementById('officerNameDisplay').textContent = name;
  document.getElementById('avatarInitial').textContent = name.substring(0, 2).toUpperCase();
})();

// ===== LOGOUT =====
document.getElementById('logoutBtn').addEventListener('click', doLogout);
document.getElementById('sidebarLogout').addEventListener('click', doLogout);
function doLogout() {
  sessionStorage.clear();
  window.location.href = 'index.html';
}

// ===== SIDEBAR NAV =====
const sidebar = document.getElementById('sidebar');
const hamburger = document.getElementById('hamburger');
const navItems = sidebar.querySelectorAll('.nav-item[data-tab]');
const tabPanes = document.querySelectorAll('.tab-pane');

hamburger.addEventListener('click', () => sidebar.classList.toggle('open'));

navItems.forEach(item => {
  item.addEventListener('click', () => {
    navItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    const tab = item.dataset.tab;
    tabPanes.forEach(p => p.classList.toggle('active', p.id === 'tab-' + tab));
    sidebar.classList.remove('open');
    if (tab === 'analytics') renderAnalytics();
  });
});

// ===== SUMMARY CARDS =====
function renderSummary() {
  const counts = { Total: GRIEVANCES.length, Pending: 0, Submitted: 0, Approved: 0, Rejected: 0, Reopened: 0 };
  GRIEVANCES.forEach(g => { if (counts.hasOwnProperty(g.status)) counts[g.status]++; });
  const colors = {
    Total: ['#EFF6FF', '#1E3A8A', 'bi-collection'],
    Pending: ['#FEF3C7', '#92400E', 'bi-hourglass-split'],
    Submitted: ['#DBEAFE', '#1E40AF', 'bi-send-check'],
    Approved: ['#D1FAE5', '#065F46', 'bi-check-circle'],
    Rejected: ['#FEE2E2', '#991B1B', 'bi-x-circle'],
    Reopened: ['#FDE8E8', '#C2410C', 'bi-arrow-repeat']
  };
  let html = '';
  for (const [key, val] of Object.entries(counts)) {
    const c = colors[key];
    html += `<div class="summary-card">
      <div class="icon-box" style="background:${c[0]};color:${c[1]}"><i class="bi ${c[2]}"></i></div>
      <div class="info"><h3>${val}</h3><p>${key}</p></div>
    </div>`;
  }
  document.getElementById('summaryCards').innerHTML = html;
}

// ===== TABLE RENDERING =====
const ROWS_PER_PAGE = 8;
let currentPage = 1;
let sortField = '';
let sortAsc = true;
let filteredData = [];

function getFiltered() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const status = document.getElementById('statusFilter').value;
  const category = document.getElementById('categoryFilter').value;
  let data = GRIEVANCES.filter(g => {
    if (status && g.status !== status) return false;
    if (category && g.complaint_category !== category) return false;
    if (search) {
      const hay = (g.grievance_id + g.complaint_title + g.citizen_name + g.assigned_officer + g.area_name + g.complaint_category).toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });
  if (sortField) {
    data.sort((a, b) => {
      const va = a[sortField] || '', vb = b[sortField] || '';
      return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
  }
  return data;
}

function renderTable() {
  filteredData = getFiltered();
  const total = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(total / ROWS_PER_PAGE));
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * ROWS_PER_PAGE;
  const pageData = filteredData.slice(start, start + ROWS_PER_PAGE);

  const tbody = document.getElementById('grievanceTableBody');
  tbody.innerHTML = pageData.map(g => `
    <tr onclick="openDetail('${g.grievance_id}')">
      <td><strong>${g.grievance_id}</strong></td>
      <td style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${g.complaint_title}">${g.complaint_title}</td>
      <td>${g.complaint_category}</td>
      <td>${g.citizen_name}</td>
      <td>${g.area_name}</td>
      <td>${g.assigned_officer}</td>
      <td><span class="badge-status badge-${g.status.toLowerCase()}">${g.status}</span></td>
      <td><span class="badge-status badge-ivr-${g.ivr_status === 'Confirmed' ? 'confirmed' : g.ivr_status === 'Failed' ? 'failed' : 'pending'}">${g.ivr_status}</span></td>
      <td><span class="${g.photo_uploaded ? 'bool-yes' : 'bool-no'}"><i class="bi ${g.photo_uploaded ? 'bi-check-lg' : 'bi-x-lg'}"></i></span></td>
      <td><span class="${g.live_photo_captured ? 'bool-yes' : 'bool-no'}"><i class="bi ${g.live_photo_captured ? 'bi-check-lg' : 'bi-x-lg'}"></i></span></td>
    </tr>
  `).join('');

  document.getElementById('paginationInfo').textContent = `Showing ${start + 1}–${Math.min(start + ROWS_PER_PAGE, total)} of ${total}`;

  let pHtml = '';
  for (let i = 1; i <= totalPages; i++) {
    pHtml += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
  }
  document.getElementById('paginationBtns').innerHTML = pHtml;
}

function goPage(p) { currentPage = p; renderTable(); }

// Sort
document.querySelectorAll('th[data-sort]').forEach(th => {
  th.addEventListener('click', () => {
    const field = th.dataset.sort;
    if (sortField === field) sortAsc = !sortAsc;
    else { sortField = field; sortAsc = true; }
    renderTable();
  });
});

// Filters
document.getElementById('searchInput').addEventListener('input', () => { currentPage = 1; renderTable(); });
document.getElementById('statusFilter').addEventListener('change', () => {
  currentPage = 1;
  const val = document.getElementById('statusFilter').value;
  const chipsEl = document.getElementById('filterChips');
  if (chipsEl) chipsEl.querySelectorAll('.filter-chip').forEach(c => c.classList.toggle('active', c.textContent === (val || 'All')));
  renderTable();
});
document.getElementById('categoryFilter').addEventListener('change', () => { currentPage = 1; renderTable(); });

// ===== DETAIL PANEL =====
const overlay = document.getElementById('detailOverlay');
const panel = document.getElementById('detailPanel');
let currentGrievance = null;

function openDetail(id) {
  currentGrievance = GRIEVANCES.find(g => g.grievance_id === id);
  if (!currentGrievance) return;
  const g = currentGrievance;
  const ivr = getIVRDetails(g);

  document.getElementById('panelTitle').textContent = g.grievance_id;

  document.getElementById('panelBody').innerHTML = `
    <div class="detail-section">
      <h5><i class="bi bi-info-circle me-1"></i> Grievance Information</h5>
      ${dRow('Grievance ID', g.grievance_id)}
      ${dRow('Title', g.complaint_title)}
      ${dRow('Category', g.complaint_category)}
      ${dRow('Status', `<span class="badge-status badge-${g.status.toLowerCase()}">${g.status}</span>`)}
      <div class="status-explanation"><i class="bi bi-lightbulb me-1"></i>${getStatusExplanation(g)}</div>
    </div>
    <div class="detail-section">
      <h5><i class="bi bi-person me-1"></i> Citizen Information</h5>
      ${dRow('Name', g.citizen_name)}
      ${dRow('Phone', g.phone_number)}
      ${dRow('Area', g.area_name)}
      ${dRow('Address', g.address)}
    </div>
    <div class="detail-section">
      <h5><i class="bi bi-geo-alt me-1"></i> GPS Information</h5>
      ${dRow('Latitude', g.latitude)}
      ${dRow('Longitude', g.longitude)}
      ${dRow('Location Match', g.resolution_verified ? '<span class="bool-yes">Verified ✓</span>' : '<span class="bool-no">Not Verified ✗</span>')}
    </div>
    <div class="detail-section">
      <h5><i class="bi bi-person-badge me-1"></i> Assigned Officer</h5>
      ${dRow('Officer Name', g.assigned_officer)}
      ${dRow('Officer ID', g.officer_id)}
      ${dRow('Assignment Date', g.assign_date)}
      ${dRow('Submission Date', g.submission_date || 'Not yet submitted')}
    </div>
    <div class="detail-section">
      <h5><i class="bi bi-telephone me-1"></i> IVR Verification</h5>
      ${dRow('Call Initiated', ivr.call_initiated ? '<span class="bool-yes">Yes</span>' : '<span class="bool-no">No</span>')}
      ${dRow('Call Answered', ivr.call_answered ? '<span class="bool-yes">Yes</span>' : '<span class="bool-no">No</span>')}
      ${dRow('Citizen Confirmed', ivr.citizen_confirmed ? '<span class="bool-yes">Yes</span>' : '<span class="bool-no">No</span>')}
      ${dRow('No Response', ivr.no_response ? '<span class="bool-no">Yes</span>' : '—')}
      ${dRow('Failed Call', ivr.failed ? '<span class="bool-no">Yes</span>' : '—')}
      ${dRow('Call Timestamp', ivr.timestamp)}
      ${dRow('Summary', ivr.summary)}
    </div>
    <div class="detail-section">
      <h5><i class="bi bi-camera me-1"></i> Evidence & Photos</h5>
      ${dRow('Photo Uploaded', g.photo_uploaded ? '<span class="bool-yes">Yes ✓</span>' : '<span class="bool-no">No ✗</span>')}
      ${dRow('Live Photo Captured', g.live_photo_captured ? '<span class="bool-yes">Yes ✓</span>' : '<span class="bool-no">No ✗</span>')}
      <div class="proof-preview mt-2">
        <div class="img-box">${g.photo_uploaded ? '<i class="bi bi-image" style="font-size:1.5rem;"></i><br>Proof Photo' : 'No Photo'}</div>
        <div class="img-box">${g.live_photo_captured ? '<i class="bi bi-camera-video" style="font-size:1.5rem;"></i><br>Live Photo' : 'No Live Photo'}</div>
      </div>
    </div>
    <div class="detail-section">
      <h5><i class="bi bi-emoji-smile me-1"></i> Citizen Satisfaction</h5>
      ${dRow('Feedback', g.citizen_feedback || 'Awaiting feedback')}
      ${dRow('Resolution Verified', g.resolution_verified ? '<span class="bool-yes">Yes</span>' : '<span class="bool-no">No</span>')}
      ${dRow('Reopened', g.reopened ? '<span class="bool-no">Yes</span>' : 'No')}
      ${g.reopen_reason ? dRow('Reopen Reason', g.reopen_reason) : ''}
    </div>
    <div class="detail-section">
      <h5><i class="bi bi-journal-text me-1"></i> Internal Notes</h5>
      ${dRow('Remarks', g.remarks || '—')}
      ${g.rejection_reason ? dRow('Rejection Reason', '<span class="text-danger">' + g.rejection_reason + '</span>') : ''}
      ${g.approval_time_hours ? dRow('Approval Time', g.approval_time_hours + ' hours') : ''}
    </div>
  `;

  // Action buttons
  const canApprove = g.photo_uploaded && g.live_photo_captured && g.resolution_verified && g.ivr_status === 'Confirmed';
  document.getElementById('panelActions').innerHTML = `
    <button class="btn btn-approve" onclick="doAction('Approved')" ${canApprove ? '' : 'disabled title="Requires: evidence, live photo, location verified, IVR confirmed"'}>
      <i class="bi bi-check-lg me-1"></i>Approve
    </button>
    <button class="btn btn-reject" onclick="doAction('Rejected')"><i class="bi bi-x-lg me-1"></i>Reject</button>
    <button class="btn btn-reopen" onclick="doAction('Reopened')"><i class="bi bi-arrow-repeat me-1"></i>Reopen</button>
    <button class="btn btn-remark" onclick="openRemarkModal()"><i class="bi bi-chat-square-text me-1"></i>Add Remark</button>
    <button class="btn btn-evidence" onclick="alert('Evidence viewer would open here')"><i class="bi bi-images me-1"></i>View Evidence</button>
    <button class="btn" style="border:1px solid #E5E7EB;border-radius:8px;" onclick="closeDetail()"><i class="bi bi-x me-1"></i>Close</button>
  `;

  overlay.classList.add('show');
  panel.classList.add('show');
}

function dRow(label, value) {
  return `<div class="detail-row"><span class="label">${label}</span><span class="value">${value}</span></div>`;
}

function closeDetail() {
  overlay.classList.remove('show');
  panel.classList.remove('show');
}
overlay.addEventListener('click', closeDetail);
document.getElementById('panelClose').addEventListener('click', closeDetail);

function doAction(newStatus) {
  if (!currentGrievance) return;
  const idx = GRIEVANCES.findIndex(g => g.grievance_id === currentGrievance.grievance_id);
  if (idx === -1) return;
  GRIEVANCES[idx].status = newStatus;
  if (newStatus === 'Reopened') { GRIEVANCES[idx].reopened = true; GRIEVANCES[idx].reopen_reason = 'Reopened by monitoring officer'; }
  if (newStatus === 'Rejected') { GRIEVANCES[idx].rejection_reason = GRIEVANCES[idx].rejection_reason || 'Rejected by monitoring officer'; }
  renderSummary();
  renderTable();
  openDetail(currentGrievance.grievance_id);
  showToast(`Grievance ${currentGrievance.grievance_id} marked as ${newStatus}`);
}

// ===== REMARK MODAL =====
function openRemarkModal() { document.getElementById('remarkModalBg').classList.add('show'); }
document.getElementById('remarkCancel').addEventListener('click', () => document.getElementById('remarkModalBg').classList.remove('show'));
document.getElementById('remarkSave').addEventListener('click', () => {
  const txt = document.getElementById('remarkTextarea').value.trim();
  if (!txt || !currentGrievance) return;
  const idx = GRIEVANCES.findIndex(g => g.grievance_id === currentGrievance.grievance_id);
  if (idx !== -1) GRIEVANCES[idx].remarks = txt;
  document.getElementById('remarkTextarea').value = '';
  document.getElementById('remarkModalBg').classList.remove('show');
  openDetail(currentGrievance.grievance_id);
  showToast('Remark saved successfully');
});

// ===== TOAST =====
function showToast(msg) {
  const t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#1E3A8A;color:white;padding:0.75rem 1.25rem;border-radius:10px;font-size:0.85rem;font-weight:600;z-index:9999;box-shadow:0 4px 15px rgba(0,0,0,0.2);animation:fadeUp 0.3s ease;';
  t.innerHTML = '<i class="bi bi-check-circle me-1"></i>' + msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; setTimeout(() => t.remove(), 300); }, 2500);
}

// ===== ANALYTICS =====
let chartsRendered = false;
function renderAnalytics() {
  if (chartsRendered) return;
  chartsRendered = true;

  // Insight cards
  const officers = {};
  const areas = {};
  GRIEVANCES.forEach(g => {
    if (!officers[g.assigned_officer]) officers[g.assigned_officer] = { approved: 0, rejected: 0, reopened: 0, total: 0, hours: [] };
    officers[g.assigned_officer].total++;
    if (g.status === 'Approved') { officers[g.assigned_officer].approved++; if (g.approval_time_hours) officers[g.assigned_officer].hours.push(g.approval_time_hours); }
    if (g.status === 'Rejected') officers[g.assigned_officer].rejected++;
    if (g.status === 'Reopened') officers[g.assigned_officer].reopened++;
    if (!areas[g.area_name]) areas[g.area_name] = { total: 0, reopened: 0 };
    areas[g.area_name].total++;
    if (g.reopened) areas[g.area_name].reopened++;
  });

  const officerEntries = Object.entries(officers);
  // Guard against empty data
  if (officerEntries.length === 0) {
    document.getElementById('insightCards').innerHTML = '<div style="padding:1rem;color:#9CA3AF;">No officer data available yet</div>';
    return;
  }

  const bestOfficer = officerEntries.sort((a, b) => b[1].approved - a[1].approved)[0];
  const highReopen = Object.entries(officers).sort((a, b) => b[1].reopened - a[1].reopened)[0];
  const highApproval = Object.entries(officers).sort((a, b) => (b[1].approved/b[1].total) - (a[1].approved/a[1].total))[0];
  const areaEntries = Object.entries(areas);
  const topArea = areaEntries.sort((a, b) => b[1].total - a[1].total)[0];
  const topReopenArea = Object.entries(areas).sort((a, b) => b[1].reopened - a[1].reopened)[0];

  document.getElementById('insightCards').innerHTML = `
    ${insightCard('bi-trophy', '#D1FAE5', '#065F46', 'Best Performing Officer', bestOfficer[0])}
    ${insightCard('bi-arrow-repeat', '#FEF3C7', '#92400E', 'Highest Reopen Count', highReopen[0] + ' (' + highReopen[1].reopened + ')')}
    ${insightCard('bi-graph-up-arrow', '#DBEAFE', '#1E40AF', 'Highest Approval Rate', highApproval[0] + ' (' + Math.round(highApproval[1].approved/highApproval[1].total*100) + '%)')}
    ${insightCard('bi-geo-alt', '#FDE8E8', '#C2410C', 'Most Complaints Area', topArea[0] + ' (' + topArea[1].total + ')')}
    ${insightCard('bi-exclamation-triangle', '#FEE2E2', '#991B1B', 'Most Reopened Area', topReopenArea[0] + ' (' + topReopenArea[1].reopened + ')')}
  `;

  // Charts
  const statusCounts = { Pending: 0, Submitted: 0, Approved: 0, Rejected: 0, Reopened: 0 };
  GRIEVANCES.forEach(g => { if (statusCounts.hasOwnProperty(g.status)) statusCounts[g.status]++; });

  // 1. Approved vs Rejected bar
  new Chart(document.getElementById('chartApproveReject'), {
    type: 'bar',
    data: {
      labels: ['Approved', 'Rejected'],
      datasets: [{ data: [statusCounts.Approved, statusCounts.Rejected], backgroundColor: ['#10B981', '#EF4444'], borderRadius: 8, barThickness: 60 }]
    },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
  });

  // 2. Status pie
  new Chart(document.getElementById('chartStatusDist'), {
    type: 'doughnut',
    data: {
      labels: Object.keys(statusCounts),
      datasets: [{ data: Object.values(statusCounts), backgroundColor: ['#F59E0B', '#3B82F6', '#10B981', '#EF4444', '#F97316'], borderWidth: 2 }]
    },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
  });

  // 3. Monthly trends
  new Chart(document.getElementById('chartMonthly'), {
    type: 'bar',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr'],
      datasets: [
        { label: 'Received', data: [3, 5, GRIEVANCES.length, 0], backgroundColor: '#3B82F6', borderRadius: 6 },
        { label: 'Resolved', data: [2, 3, statusCounts.Approved, 0], backgroundColor: '#10B981', borderRadius: 6 }
      ]
    },
    options: { responsive: true, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }
  });

  // 4. IVR rate
  const ivrCounts = { Confirmed: 0, 'Not Confirmed': 0, 'No Response': 0, Failed: 0, Pending: 0 };
  GRIEVANCES.forEach(g => { if (ivrCounts.hasOwnProperty(g.ivr_status)) ivrCounts[g.ivr_status]++; });
  new Chart(document.getElementById('chartIVR'), {
    type: 'doughnut',
    data: {
      labels: Object.keys(ivrCounts),
      datasets: [{ data: Object.values(ivrCounts), backgroundColor: ['#10B981', '#EF4444', '#F59E0B', '#6B7280', '#3B82F6'], borderWidth: 2 }]
    },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
  });

  // Performance table
  const perf = Object.entries(officers).map(([name, o]) => {
    const oid = GRIEVANCES.find(g => g.assigned_officer === name)?.officer_id || '';
    const avgHrs = o.hours.length ? Math.round(o.hours.reduce((a, b) => a + b, 0) / o.hours.length) : '—';
    const firstApproval = o.total ? Math.round(o.approved / o.total * 100) : 0;
    return { name, oid, ...o, avgHrs, firstApproval };
  }).sort((a, b) => b.approved - a.approved);

  document.getElementById('perfTableBody').innerHTML = perf.map((o, i) => `
    <tr>
      <td><strong>#${i + 1}</strong></td>
      <td>${o.name}</td>
      <td>${o.oid}</td>
      <td>${o.total}</td>
      <td><span class="bool-yes">${o.approved}</span></td>
      <td><span class="bool-no">${o.rejected}</span></td>
      <td>${o.reopened}</td>
      <td>${o.firstApproval}%</td>
      <td>${o.avgHrs} hrs</td>
    </tr>
  `).join('');
}

function insightCard(icon, bg, color, label, value) {
  return `<div class="insight-card">
    <div class="insight-icon" style="background:${bg};color:${color}"><i class="bi ${icon}"></i></div>
    <div class="insight-text"><p>${label}</p><h5>${value}</h5></div>
  </div>`;
}

// ===== BACKEND DATA LOADING =====
async function loadTasksFromBackend() {
  try {
    const res = await fetch('http://127.0.0.1:8000/monitoring/');
    const data = await res.json();

    console.log("Backend Data (Monitoring):", data);

    if (!Array.isArray(data)) {
      console.error("Expected array from backend, got:", typeof data, data);
      return;
    }

    GRIEVANCES = data.map(g => {
      // Debug: log IVR mapping per grievance
      console.log(`IVR Debug → ${g.grievance_code}: ivr_status=${g.ivr_status}, raw=${g.ivr_call_status_raw}, response=${g.ivr_response}`);

      return {
        grievance_id: g.grievance_code || 'N/A',
        complaint_title: g.type || g.grievance_type || 'N/A',
        complaint_category: g.department || 'N/A',
        citizen_name: g.citizen_name || '—',
        phone_number: g.phone_number || '—',
        area_name: g.district || 'N/A',
        address: g.address || g.district || '—',
        latitude: g.lat || 0,
        longitude: g.lon || 0,
        assigned_officer: g.assigned_officer || '—',
        officer_id: g.officer_id || '—',
        assign_date: g.assign_date || '—',
        submission_date: g.submission_date || '',
        status: mapBackendStatus(g.status),
        // IVR data from master_verification (source of truth)
        ivr_status: g.ivr_status || 'Pending',
        ivr_call_time: g.ivr_call_time || '',
        citizen_feedback: g.citizen_feedback || '',
        // Photo/GPS from master_verification
        photo_uploaded: g.photo_uploaded === 1 || g.photo_uploaded === true,
        live_photo_captured: g.photo_uploaded === 1 || g.photo_uploaded === true,
        resolution_verified: g.gps_match_flag === 1,
        reopened: g.reopen_flag === 1 || g.status === 'REOPENED',
        reopen_reason: g.status === 'REOPENED' ? (g.reopen_reason || 'Reopened after GPS verification failure') : (g.reopen_reason || ''),
        approval_time_hours: g.approval_time_hours || 0,
        rejection_reason: g.rejection_reason || '',
        remarks: g.remarks || ''
      };
    });

    console.log("Mapped GRIEVANCES (Monitoring):", GRIEVANCES);

    // Initialize dashboard with loaded data
    initDashboard();

  } catch (err) {
    console.error("Failed to load monitoring data:", err);
    // Initialize with empty data so UI doesn't crash
    initDashboard();
  }
}

// ===== INIT DASHBOARD (called after data loads) =====
function initDashboard() {
  // Summary cards
  renderSummary();

  // Category filter options
  const categories = [...new Set(GRIEVANCES.map(g => g.complaint_category))].sort();
  const catFilter = document.getElementById('categoryFilter');
  // Clear existing dynamic options
  catFilter.innerHTML = '<option value="">All Categories</option>';
  categories.forEach(c => { const o = document.createElement('option'); o.value = c; o.textContent = c; catFilter.appendChild(o); });

  // Filter chips
  const statuses = ['All', 'Pending', 'Submitted', 'Approved', 'Rejected', 'Reopened'];
  const chipsEl = document.getElementById('filterChips');
  chipsEl.innerHTML = ''; // Clear any existing chips
  statuses.forEach(s => {
    const chip = document.createElement('span');
    chip.className = 'filter-chip' + (s === 'All' ? ' active' : '');
    chip.textContent = s;
    chip.addEventListener('click', () => {
      chipsEl.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      document.getElementById('statusFilter').value = s === 'All' ? '' : s;
      currentPage = 1;
      renderTable();
    });
    chipsEl.appendChild(chip);
  });

  // Render table
  renderTable();
}

// ===== START: Load from backend =====
loadTasksFromBackend();
