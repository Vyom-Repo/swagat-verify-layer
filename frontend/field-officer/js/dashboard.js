// ================== GLOBAL ==================
let GRIEVANCES = [];
const ROWS_PER_PAGE = 8;
let currentPage = 1;
let capturedPhotoBlob = null;
let capturedPhotoDataUrl = null;
let cameraStream = null;

// ================== HELPERS FROM data.js ==================
function getStatusBadgeClass(status) {
  const map = {
    'Assigned': 'badge-assigned', 'Pending': 'badge-pending', 'In Progress': 'badge-inprogress',
    'Resolved': 'badge-resolved', 'Submitted': 'badge-submitted', 'Reopened': 'badge-reopened',
    'REOPENED': 'badge-reopened', 'VERIFIED': 'badge-resolved', 'pending': 'badge-pending',
    'Not Started': 'badge-pending', 'Failed Submission': 'badge-reopened'
  };
  return map[status] || 'badge-pending';
}

function getPriorityClass(p) {
  const map = { 'Critical': 'priority-critical', 'High': 'priority-high', 'Medium': 'priority-medium', 'Low': 'priority-low' };
  return map[p] || 'priority-medium';
}

function getSubmissionReason(g) {
  if (g.submission_status === 'Submitted') return 'All evidence submitted successfully';
  if (g.submission_status === 'Failed Submission') return g.remarks || 'Submission failed';
  const reasons = [];
  if (!g.before_photo_status && !g.after_photo_status) reasons.push('Photos not uploaded');
  else if (!g.after_photo_status) reasons.push('After photo not uploaded');
  if (!g.live_photo_status) reasons.push('Live photo not captured');
  if (!g.gps_status) reasons.push('GPS location not captured');
  if (!g.resolution_title) reasons.push('Resolution note not entered');
  return reasons.length ? reasons.join(' • ') : 'Ready to begin work';
}

function formatStatus(status) {
  if (!status) return 'Pending';
  const map = {
    'pending': 'Pending', 'VERIFIED': 'Resolved', 'REOPENED': 'Reopened',
    'Assigned': 'Assigned', 'In Progress': 'In Progress', 'Submitted': 'Submitted',
    'Resolved': 'Resolved', 'Reopened': 'Reopened', 'Pending': 'Pending'
  };
  return map[status] || status;
}

// ================== AUTH ==================
(function () {
  const name = sessionStorage.getItem("username") || "Officer";
  document.getElementById("officerNameDisplay").textContent = name;
  document.getElementById("avatarInitial").textContent = name.substring(0, 2).toUpperCase();
})();

function doLogout() {
  sessionStorage.clear();
  window.location.href = "index.html";
}

document.getElementById("logoutBtn").addEventListener("click", doLogout);
document.getElementById("sideLogout").addEventListener("click", doLogout);
document.getElementById("mobileLogout").addEventListener("click", doLogout);

// ================== LOAD FROM BACKEND ==================
async function loadTasksFromBackend() {
  const user_id = sessionStorage.getItem("user_id");

  if (!user_id) {
    alert("Not logged in");
    window.location.href = "index.html";
    return;
  }

  try {
    const res = await fetch(`http://127.0.0.1:8000/tasks/${user_id}`);
    const data = await res.json();

    console.log("Backend Data:", data);

    if (!Array.isArray(data)) {
      console.error("Expected array from backend, got:", typeof data, data);
      alert("Invalid data from server");
      return;
    }

    GRIEVANCES = data.map(g => ({
      id: g.id,
      grievance_id: g.grievance_code || "N/A",
      complaint_title: g.type || g.grievance_type || "N/A",
      complaint_category: g.department || "N/A",
      citizen_name: g.citizen_name || "",
      citizen_phone: g.citizen_phone || "",
      area_name: g.district || "N/A",
      address: g.address || g.district || "",
      latitude: g.lat || 0,
      longitude: g.lon || 0,
      assigned_officer: sessionStorage.getItem("username") || "Officer",
      officer_id: sessionStorage.getItem("user_id") || "",
      assignment_date: g.assignment_date || "",
      due_date: g.due_date || "",
      priority: g.priority || "Medium",
      current_status: formatStatus(g.status),
      work_type: g.work_type || "",
      resolution_title: g.resolution_title || "",
      resolution_description: g.resolution_description || "",
      before_photo_status: g.status === "VERIFIED",
      after_photo_status: g.status === "VERIFIED",
      live_photo_status: g.status === "VERIFIED",
      gps_status: g.status === "VERIFIED",
      submission_status: g.status === "VERIFIED" ? "Submitted" : g.status === "REOPENED" ? "Failed Submission" : "Not Started",
      remarks: g.remarks || "",
      reopen_count: g.reopen_count || 0,
      last_updated: g.last_updated || ""
    }));

    console.log("Mapped GRIEVANCES:", GRIEVANCES);

    // Render everything
    renderSummary();
    renderTable();
    renderMobileCards();
    populateResolutionDropdown();

  } catch (err) {
    console.error("Failed to load tasks:", err);
    alert("Failed to load tasks from server");
  }
}

// ================== SUMMARY CARDS ==================
function renderSummary() {
  const c = { Total: GRIEVANCES.length, Pending: 0, Submitted: 0, Reopened: 0, Resolved: 0 };
  GRIEVANCES.forEach(g => {
    const s = g.current_status;
    if (s === "Pending" || s === "Assigned") c.Pending++;
    else if (s === "Submitted" || s === "In Progress") c.Submitted++;
    else if (s === "Reopened") c.Reopened++;
    else if (s === "Resolved") c.Resolved++;
  });

  const colors = {
    Total: ['#EFF6FF', '#1E3A8A', 'bi-collection'],
    Pending: ['#FEF3C7', '#92400E', 'bi-hourglass-split'],
    Submitted: ['#DBEAFE', '#1E40AF', 'bi-send-check'],
    Resolved: ['#D1FAE5', '#065F46', 'bi-check-circle'],
    Reopened: ['#FDE8E8', '#C2410C', 'bi-arrow-repeat']
  };

  let html = '';
  for (const [key, val] of Object.entries(c)) {
    const cl = colors[key];
    html += `<div class="summary-card">
      <div class="icon-box" style="background:${cl[0]};color:${cl[1]}"><i class="bi ${cl[2]}"></i></div>
      <div class="info"><h3>${val}</h3><p>${key}</p></div>
    </div>`;
  }
  document.getElementById("summaryCards").innerHTML = html;
}

// ================== FILTERING ==================
function getFiltered() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const status = document.getElementById("statusFilter").value;
  const priority = document.getElementById("priorityFilter").value;

  return GRIEVANCES.filter(g => {
    if (status && g.current_status !== status) return false;
    if (priority && g.priority !== priority) return false;
    if (search) {
      const hay = (
        g.grievance_id + g.complaint_title + g.complaint_category +
        g.area_name + g.citizen_name + g.current_status
      ).toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });
}

// ================== TABLE ==================
function renderTable() {
  const filtered = getFiltered();
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / ROWS_PER_PAGE));
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * ROWS_PER_PAGE;
  const pageData = filtered.slice(start, start + ROWS_PER_PAGE);

  const tbody = document.getElementById("tableBody");
  if (!pageData.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:2rem;color:#9CA3AF;">No grievances found</td></tr>`;
  } else {
    tbody.innerHTML = pageData.map(g => `
      <tr onclick="openDetail('${g.grievance_id}')" style="cursor:pointer;">
        <td><strong>${g.grievance_id}</strong></td>
        <td style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${g.complaint_title}">${g.complaint_title}</td>
        <td>${g.complaint_category}</td>
        <td>${g.area_name}</td>
        <td><span class="${getPriorityClass(g.priority)}">${g.priority}</span></td>
        <td><span class="${getStatusBadgeClass(g.current_status)}">${g.current_status}</span></td>
        <td>${g.due_date || '—'}</td>
        <td><span class="${getStatusBadgeClass(g.submission_status)}">${g.submission_status}</span></td>
      </tr>
    `).join("");
  }

  // Pagination info
  const pageInfo = document.getElementById("pageInfo");
  if (pageInfo) {
    pageInfo.textContent = total > 0
      ? `Showing ${start + 1}–${Math.min(start + ROWS_PER_PAGE, total)} of ${total}`
      : 'No results';
  }

  // Pagination buttons
  const pageBtns = document.getElementById("pageBtns");
  if (pageBtns) {
    let pHtml = '';
    for (let i = 1; i <= totalPages; i++) {
      pHtml += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
    }
    pageBtns.innerHTML = pHtml;
  }
}

function goPage(p) {
  currentPage = p;
  renderTable();
  renderMobileCards();
}

// ================== MOBILE CARDS ==================
function renderMobileCards() {
  const container = document.getElementById("mobileCards");
  if (!container) return;

  const filtered = getFiltered();

  if (!filtered.length) {
    container.innerHTML = `<div style="text-align:center;padding:2rem;color:#9CA3AF;">No grievances found</div>`;
    return;
  }

  container.innerHTML = filtered.map(g => `
    <div class="mobile-card" onclick="openDetail('${g.grievance_id}')">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <strong style="color:#1E3A8A;font-size:0.85rem;">${g.grievance_id}</strong>
        <span class="${getStatusBadgeClass(g.current_status)}" style="font-size:0.72rem;padding:2px 8px;border-radius:6px;">${g.current_status}</span>
      </div>
      <div style="font-weight:600;margin-bottom:4px;">${g.complaint_title}</div>
      <div style="font-size:0.8rem;color:#6B7280;">
        <i class="bi bi-tag me-1"></i>${g.complaint_category}
        <span class="ms-2"><i class="bi bi-geo-alt me-1"></i>${g.area_name}</span>
      </div>
      <div class="d-flex justify-content-between align-items-center mt-2" style="font-size:0.75rem;color:#9CA3AF;">
        <span><i class="bi bi-flag me-1"></i>${g.priority}</span>
        <span>${g.submission_status}</span>
      </div>
    </div>
  `).join("");
}

// ================== DETAIL PANEL ==================
function openDetail(id) {
  const g = GRIEVANCES.find(gr => gr.grievance_id === id);
  if (!g) return;

  document.getElementById("panelTitle").textContent = g.grievance_id + " — Details";

  document.getElementById("panelBody").innerHTML = `
    <div class="detail-section">
      <h5><i class="bi bi-info-circle me-1"></i> Grievance Information</h5>
      ${dRow('ID', g.grievance_id)}
      ${dRow('Title', g.complaint_title)}
      ${dRow('Category', g.complaint_category)}
      ${dRow('Area', g.area_name)}
      ${dRow('Address', g.address || g.area_name)}
      ${dRow('Priority', `<span class="${getPriorityClass(g.priority)}">${g.priority}</span>`)}
      ${dRow('Status', `<span class="${getStatusBadgeClass(g.current_status)}">${g.current_status}</span>`)}
    </div>
    <div class="detail-section">
      <h5><i class="bi bi-geo-alt me-1"></i> Location</h5>
      ${dRow('Latitude', g.latitude)}
      ${dRow('Longitude', g.longitude)}
      ${dRow('GPS Captured', g.gps_status ? '<span class="bool-yes">Yes ✓</span>' : '<span class="bool-no">No ✗</span>')}
    </div>
    <div class="detail-section">
      <h5><i class="bi bi-camera me-1"></i> Evidence Status</h5>
      ${dRow('Before Photo', g.before_photo_status ? '<span class="bool-yes">Yes ✓</span>' : '<span class="bool-no">No ✗</span>')}
      ${dRow('After Photo', g.after_photo_status ? '<span class="bool-yes">Yes ✓</span>' : '<span class="bool-no">No ✗</span>')}
      ${dRow('Live Photo', g.live_photo_status ? '<span class="bool-yes">Yes ✓</span>' : '<span class="bool-no">No ✗</span>')}
    </div>
    <div class="detail-section">
      <h5><i class="bi bi-clipboard-check me-1"></i> Submission</h5>
      ${dRow('Submission Status', `<span class="${getStatusBadgeClass(g.submission_status)}">${g.submission_status}</span>`)}
      ${dRow('Details', getSubmissionReason(g))}
      ${g.remarks ? dRow('Remarks', g.remarks) : ''}
    </div>
  `;

  document.getElementById("detailOverlay").classList.add("show");
  document.getElementById("detailPanel").classList.add("show");
}

function dRow(label, value) {
  return `<div class="detail-row"><span class="label">${label}</span><span class="value">${value}</span></div>`;
}

function closeDetail() {
  document.getElementById("detailOverlay").classList.remove("show");
  document.getElementById("detailPanel").classList.remove("show");
}

document.getElementById("detailOverlay").addEventListener("click", closeDetail);
document.getElementById("panelClose").addEventListener("click", closeDetail);

// ================== RESOLUTION FORM ==================
function populateResolutionDropdown() {
  const sel = document.getElementById("resGrievance");
  if (!sel) return;

  // Clear existing options except the placeholder
  sel.innerHTML = '<option value="">-- Choose a pending grievance --</option>';

  GRIEVANCES.filter(g =>
    g.current_status === "Pending" || g.current_status === "Assigned" ||
    g.current_status === "In Progress" || g.current_status === "Reopened"
  ).forEach(g => {
    const opt = document.createElement("option");
    opt.value = g.grievance_id;
    opt.textContent = `${g.grievance_id} — ${g.complaint_title}`;
    opt.dataset.lat = g.latitude;
    opt.dataset.lon = g.longitude;
    opt.dataset.dbId = g.id;
    sel.appendChild(opt);
  });
}

// Show selected grievance info
const resGrievanceEl = document.getElementById("resGrievance");
if (resGrievanceEl) {
  resGrievanceEl.addEventListener("change", () => {
    const id = resGrievanceEl.value;
    const info = document.getElementById("selectedInfo");
    if (!id) { if (info) info.innerHTML = ''; return; }
    const g = GRIEVANCES.find(gr => gr.grievance_id === id);
    if (g && info) {
      info.innerHTML = `<i class="bi bi-geo-alt me-1"></i>${g.area_name} • ${g.complaint_category} • Target: ${g.latitude}, ${g.longitude}`;
    }
  });
}

// ================== GPS ==================
const fetchGpsBtn = document.getElementById("fetchGpsBtn");
if (fetchGpsBtn) {
  fetchGpsBtn.addEventListener("click", () => {
    const gpsMsg = document.getElementById("gpsMsg");
    const gpsDot = document.getElementById("gpsDot");
    const gpsLabel = document.getElementById("gpsLabel");

    if (!navigator.geolocation) {
      if (gpsMsg) gpsMsg.innerHTML = '<span class="text-danger">Geolocation not supported</span>';
      return;
    }

    if (gpsMsg) gpsMsg.innerHTML = '<span class="text-warning">Fetching GPS...</span>';

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        document.getElementById("resLat").value = pos.coords.latitude.toFixed(6);
        document.getElementById("resLng").value = pos.coords.longitude.toFixed(6);
        if (gpsDot) { gpsDot.classList.remove("no"); gpsDot.classList.add("yes"); }
        if (gpsLabel) gpsLabel.textContent = `GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
        if (gpsMsg) gpsMsg.innerHTML = '<span class="text-success"><i class="bi bi-check-circle me-1"></i>GPS captured successfully</span>';
      },
      (err) => {
        console.error("GPS Error:", err);
        if (gpsMsg) gpsMsg.innerHTML = `<span class="text-danger"><i class="bi bi-x-circle me-1"></i>GPS failed: ${err.message}</span>`;
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
}

// ================== CAMERA MODAL ==================
function openCamera() {
  const modalBg = document.getElementById("camModalBg");
  const video = document.getElementById("camVideo");
  const canvas = document.getElementById("camCanvas");
  const preview = document.getElementById("camPreview");
  const captureBtn = document.getElementById("camCapture");
  const retakeBtn = document.getElementById("camRetake");
  const useBtn = document.getElementById("camUse");

  if (!modalBg) return;

  modalBg.classList.add("show");
  preview.style.display = "none";
  video.style.display = "block";
  captureBtn.style.display = "inline-block";
  retakeBtn.style.display = "none";
  useBtn.disabled = true;

  // Check camera permission
  const camDot = document.getElementById("camDot");
  const camLabel = document.getElementById("camLabel");

  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => {
      cameraStream = stream;
      video.srcObject = stream;
      if (camDot) { camDot.classList.remove("no"); camDot.classList.add("yes"); }
      if (camLabel) camLabel.textContent = "Camera: Active";
    })
    .catch(err => {
      console.error("Camera Error:", err);
      if (camDot) { camDot.classList.remove("yes"); camDot.classList.add("no"); }
      if (camLabel) camLabel.textContent = "Camera: Denied";
      alert("Camera access denied. Please allow camera permissions.");
      modalBg.classList.remove("show");
    });
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
  }
}

// Camera Capture
const camCaptureBtn = document.getElementById("camCapture");
if (camCaptureBtn) {
  camCaptureBtn.addEventListener("click", () => {
    const video = document.getElementById("camVideo");
    const canvas = document.getElementById("camCanvas");
    const preview = document.getElementById("camPreview");
    const retakeBtn = document.getElementById("camRetake");
    const useBtn = document.getElementById("camUse");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    capturedPhotoDataUrl = canvas.toDataURL("image/jpeg", 0.85);
    preview.src = capturedPhotoDataUrl;

    // Convert to blob
    canvas.toBlob(blob => {
      capturedPhotoBlob = blob;
    }, "image/jpeg", 0.85);

    video.style.display = "none";
    preview.style.display = "block";
    camCaptureBtn.style.display = "none";
    retakeBtn.style.display = "inline-block";
    useBtn.disabled = false;

    stopCamera();
  });
}

// Camera Retake
const camRetakeBtn = document.getElementById("camRetake");
if (camRetakeBtn) {
  camRetakeBtn.addEventListener("click", () => {
    capturedPhotoBlob = null;
    capturedPhotoDataUrl = null;
    openCamera();
  });
}

// Camera Use Photo
const camUseBtn = document.getElementById("camUse");
if (camUseBtn) {
  camUseBtn.addEventListener("click", () => {
    if (!capturedPhotoDataUrl) return;

    const box = document.getElementById("boxLive");
    if (box) {
      box.innerHTML = `<img src="${capturedPhotoDataUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`;
      box.onclick = null; // Disable re-click after photo taken
    }

    document.getElementById("camModalBg").classList.remove("show");
    stopCamera();
  });
}

// Camera Close / Cancel
const camCloseBtn = document.getElementById("camClose");
if (camCloseBtn) {
  camCloseBtn.addEventListener("click", () => {
    document.getElementById("camModalBg").classList.remove("show");
    stopCamera();
  });
}

// ================== SUBMIT EVIDENCE ==================
let selectedGrievance = null;

// Update selectedGrievance when dropdown changes
const resGrievanceForSubmit = document.getElementById("resGrievance");
if (resGrievanceForSubmit) {
  resGrievanceForSubmit.addEventListener("change", () => {
    const id = resGrievanceForSubmit.value;
    if (!id) { selectedGrievance = null; return; }
    selectedGrievance = GRIEVANCES.find(gr => gr.grievance_id === id) || null;
    console.log("Selected Grievance:", selectedGrievance);
  });
}

const submitBtn = document.getElementById("submitBtn");
if (submitBtn) {
  submitBtn.addEventListener("click", async () => {
    const valErrors = document.getElementById("valErrors");
    const errors = [];

    // Validate
    const grievanceId = document.getElementById("resGrievance").value;
    const resTitle = document.getElementById("resTitle").value.trim();
    const lat = document.getElementById("resLat").value.trim();
    const lng = document.getElementById("resLng").value.trim();

    if (!grievanceId) errors.push("Select a grievance");
    if (!resTitle) errors.push("Enter resolution title");
    if (!lat || !lng) errors.push("Capture GPS location");
    if (!capturedPhotoBlob) errors.push("Capture a live photo");

    // Validate selectedGrievance has coords
    if (!selectedGrievance || !selectedGrievance.latitude || !selectedGrievance.longitude) {
      errors.push("Grievance location data missing — re-select grievance");
    }

    if (errors.length) {
      if (valErrors) {
        valErrors.style.display = "block";
        valErrors.innerHTML = errors.map(e => `<div><i class="bi bi-exclamation-circle me-1"></i>${e}</div>`).join("");
      }
      return;
    }

    if (valErrors) valErrors.style.display = "none";

    // Get values from selectedGrievance (direct object lookup — no dataset string issues)
    const dbId = selectedGrievance.id;
    const targetLat = selectedGrievance.latitude;
    const targetLon = selectedGrievance.longitude;
    const liveLat = parseFloat(lat);
    const liveLon = parseFloat(lng);
    const userId = sessionStorage.getItem("user_id");

    if (!dbId || !userId) {
      alert("Missing grievance ID or user ID");
      return;
    }

    // 🔥 DEBUG LOGS — verify exact coords before API call
    console.log("TARGET:", targetLat, targetLon);
    console.log("PHOTO:", liveLat, liveLon);
    console.log("DB Grievance ID:", dbId, "User ID:", userId);

    // Build FormData — send officer's live GPS as photo_lat/photo_lon
    const formData = new FormData();
    formData.append("grievance_id", dbId);
    formData.append("user_id", userId);
    formData.append("target_lat", targetLat);
    formData.append("target_lon", targetLon);
    formData.append("photo_lat", liveLat);
    formData.append("photo_lon", liveLon);
    formData.append("file", capturedPhotoBlob, "evidence_" + Date.now() + ".jpg");

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Submitting...';

    try {
      const res = await fetch("http://127.0.0.1:8000/verify-evidence/", {
        method: "POST",
        body: formData
      });
      const result = await res.json();

      console.log("Submit Result:", result);

      if (result.error) {
        alert("Error: " + result.error);
      } else {
        alert(`Verification: ${result.status}\n${result.message}`);

        // Reset form
        document.getElementById("resGrievance").value = "";
        document.getElementById("resTitle").value = "";
        document.getElementById("resDesc").value = "";
        document.getElementById("resLat").value = "";
        document.getElementById("resLng").value = "";
        document.getElementById("resRemarks").value = "";
        if (document.getElementById("selectedInfo")) document.getElementById("selectedInfo").innerHTML = "";
        if (document.getElementById("gpsMsg")) document.getElementById("gpsMsg").innerHTML = "";

        const gpsDot = document.getElementById("gpsDot");
        const gpsLabel = document.getElementById("gpsLabel");
        if (gpsDot) { gpsDot.classList.remove("yes"); gpsDot.classList.add("no"); }
        if (gpsLabel) gpsLabel.textContent = "GPS: Not captured";

        const box = document.getElementById("boxLive");
        if (box) {
          box.innerHTML = '<i class="bi bi-camera-video"></i><span>Capture Live Photo</span>';
          box.onclick = openCamera;
        }

        capturedPhotoBlob = null;
        capturedPhotoDataUrl = null;
        selectedGrievance = null;

        // Reload tasks
        await loadTasksFromBackend();
      }
    } catch (err) {
      console.error("Submit Error:", err);
      alert("Failed to submit evidence. Check console.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="bi bi-send-check me-1"></i>Submit Evidence';
    }
  });
}

// ================== SUBMITTED EVIDENCE TAB ==================
function renderSubmittedEvidence() {
  const container = document.getElementById("submittedList");
  if (!container) return;

  const submitted = GRIEVANCES.filter(g =>
    g.submission_status === "Submitted" || g.current_status === "Resolved"
  );

  if (!submitted.length) {
    container.innerHTML = `<div style="text-align:center;padding:2rem;color:#9CA3AF;">
      <i class="bi bi-inbox" style="font-size:2rem;"></i>
      <p class="mt-2">No submitted evidence yet</p>
    </div>`;
    return;
  }

  container.innerHTML = submitted.map(g => `
    <div class="submitted-card" style="background:white;border:1px solid #E5E7EB;border-radius:12px;padding:1rem;margin-bottom:0.75rem;">
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <strong style="color:#1E3A8A;">${g.grievance_id}</strong>
          <div style="font-size:0.85rem;margin-top:2px;">${g.complaint_title}</div>
          <div style="font-size:0.78rem;color:#6B7280;margin-top:2px;">
            ${g.complaint_category} • ${g.area_name}
          </div>
        </div>
        <span class="${getStatusBadgeClass(g.current_status)}" style="font-size:0.72rem;padding:2px 8px;border-radius:6px;">${g.current_status}</span>
      </div>
    </div>
  `).join("");
}

// ================== TAB SWITCHING ==================
document.querySelectorAll("[data-tab]").forEach(btn => {
  btn.addEventListener("click", () => {
    const tab = btn.getAttribute("data-tab");

    document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
    document.getElementById("tab-" + tab).classList.add("active");

    document.querySelectorAll("[data-tab]").forEach(b => b.classList.remove("active"));
    // Activate both sidebar and bottom nav buttons with the same data-tab value
    document.querySelectorAll(`[data-tab="${tab}"]`).forEach(b => b.classList.add("active"));

    // Render tab-specific content
    if (tab === "submitted") renderSubmittedEvidence();
    if (tab === "grievances") { renderTable(); renderMobileCards(); }
  });
});

// ================== FILTER EVENT LISTENERS ==================
document.getElementById("searchInput").addEventListener("input", () => {
  currentPage = 1;
  renderTable();
  renderMobileCards();
});

document.getElementById("statusFilter").addEventListener("change", () => {
  currentPage = 1;
  renderTable();
  renderMobileCards();
});

document.getElementById("priorityFilter").addEventListener("change", () => {
  currentPage = 1;
  renderTable();
  renderMobileCards();
});

// ================== INIT ==================
loadTasksFromBackend();