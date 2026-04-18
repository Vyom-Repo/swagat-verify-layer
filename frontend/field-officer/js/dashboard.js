// ===== AUTH =====
(function(){
  const name = sessionStorage.getItem('officer_name') || 'FO-101';
  document.getElementById('officerNameDisplay').textContent = name;
  document.getElementById('avatarInitial').textContent = name.substring(0,2).toUpperCase();
})();
document.getElementById('logoutBtn').addEventListener('click', doLogout);
document.getElementById('sideLogout').addEventListener('click', doLogout);
document.getElementById('mobileLogout').addEventListener('click', doLogout);
function doLogout(){ sessionStorage.clear(); window.location.href='index.html'; }

// ===== NAV =====
const sideNavs = document.querySelectorAll('.dash-sidebar .s-nav[data-tab]');
const botNavs = document.querySelectorAll('.bottom-nav .nav-item[data-tab]');
const tabPanes = document.querySelectorAll('.tab-pane');
function switchTab(tab){
  sideNavs.forEach(n=>n.classList.toggle('active',n.dataset.tab===tab));
  botNavs.forEach(n=>n.classList.toggle('active',n.dataset.tab===tab));
  tabPanes.forEach(p=>p.classList.toggle('active',p.id==='tab-'+tab));
  if(tab==='resolution') populateGrievanceSelect();
  if(tab==='submitted') renderSubmitted();
}
sideNavs.forEach(n=>n.addEventListener('click',()=>switchTab(n.dataset.tab)));
botNavs.forEach(n=>n.addEventListener('click',()=>switchTab(n.dataset.tab)));

// ===== SUMMARY =====
function renderSummary(){
  const c={Total:GRIEVANCES.length,Pending:0,'In Progress':0,Submitted:0,Resolved:0,Reopened:0};
  GRIEVANCES.forEach(g=>{
    if(g.current_status==='Pending'||g.current_status==='Assigned')c.Pending++;
    else if(g.current_status==='In Progress')c['In Progress']++;
    else if(g.current_status==='Submitted')c.Submitted++;
    else if(g.current_status==='Resolved')c.Resolved++;
    else if(g.current_status==='Reopened')c.Reopened++;
  });
  const colors={
    Total:['#EFF6FF','#1E3A8A','bi-collection'],
    Pending:['#FEF3C7','#92400E','bi-hourglass-split'],
    'In Progress':['#E0E7FF','#3730A3','bi-arrow-clockwise'],
    Submitted:['#DBEAFE','#1E40AF','bi-send-check'],
    Resolved:['#D1FAE5','#065F46','bi-check-circle'],
    Reopened:['#FEE2E2','#991B1B','bi-arrow-repeat']
  };
  let h='';
  for(const[k,v]of Object.entries(c)){
    const cl=colors[k];
    h+=`<div class="summary-card"><div class="ic" style="background:${cl[0]};color:${cl[1]}"><i class="bi ${cl[2]}"></i></div><div class="info"><h3>${v}</h3><p>${k}</p></div></div>`;
  }
  document.getElementById('summaryCards').innerHTML=h;
}
renderSummary();

// ===== TABLE =====
const PER_PAGE=8;
let curPage=1;
function getFiltered(){
  const s=document.getElementById('searchInput').value.toLowerCase();
  const st=document.getElementById('statusFilter').value;
  const pr=document.getElementById('priorityFilter').value;
  return GRIEVANCES.filter(g=>{
    if(st&&g.current_status!==st)return false;
    if(pr&&g.priority!==pr)return false;
    if(s){
      const hay=(g.grievance_id+g.complaint_title+g.citizen_name+g.area_name+g.complaint_category).toLowerCase();
      if(!hay.includes(s))return false;
    }
    return true;
  });
}
function renderTable(){
  const data=getFiltered();
  const total=data.length;
  const pages=Math.max(1,Math.ceil(total/PER_PAGE));
  if(curPage>pages)curPage=pages;
  const start=(curPage-1)*PER_PAGE;
  const page=data.slice(start,start+PER_PAGE);
  // Helper: check if grievance is actionable (pending/assigned/reopened/in-progress)
  function isActionable(g){ return g.submission_status !== 'Submitted'; }
  // Desktop table
  document.getElementById('tableBody').innerHTML=page.map(g=>`
    <tr onclick="openDetail('${g.grievance_id}')">
      <td><strong>${g.grievance_id}</strong></td>
      <td style="max-width:170px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${g.complaint_title}">${g.complaint_title}</td>
      <td>${g.complaint_category}</td>
      <td>${g.area_name}</td>
      <td><span class="badge-s ${getPriorityClass(g.priority)}">${g.priority}</span></td>
      <td><span class="badge-s ${getStatusBadgeClass(g.current_status)}">${g.current_status}</span></td>
      <td>${g.due_date}</td>
      <td>
        ${isActionable(g) ?
          `<button class="btn-quick-submit" onclick="event.stopPropagation();quickSubmit('${g.grievance_id}');" title="Auto-fill & Submit">
            <i class="bi bi-send-check me-1"></i>Submit
          </button>` :
          `<span class="badge-s ${getStatusBadgeClass(g.submission_status)}">${g.submission_status}</span>`
        }
      </td>
    </tr>
  `).join('');
  // Mobile cards
  document.getElementById('mobileCards').innerHTML=page.map(g=>`
    <div class="m-card" onclick="openDetail('${g.grievance_id}')">
      <div class="m-top">
        <span class="m-id">${g.grievance_id}</span>
        <span class="badge-s ${getPriorityClass(g.priority)}">${g.priority}</span>
      </div>
      <div class="m-title">${g.complaint_title}</div>
      <div class="m-meta"><span><i class="bi bi-geo-alt me-1"></i>${g.area_name}</span><span><i class="bi bi-tag me-1"></i>${g.complaint_category}</span></div>
      <div class="m-bottom">
        <span class="badge-s ${getStatusBadgeClass(g.current_status)}">${g.current_status}</span>
        <span style="color:#6B7280;">Due: ${g.due_date}</span>
      </div>
      ${isActionable(g) ?
        `<button class="btn-quick-submit mt-2 w-100" onclick="event.stopPropagation();quickSubmit('${g.grievance_id}');">
          <i class="bi bi-send-check me-1"></i>Select & Submit — Only Live Photo Needed
        </button>` : ''
      }
    </div>
  `).join('');
  document.getElementById('pageInfo').textContent=`${start+1}–${Math.min(start+PER_PAGE,total)} of ${total}`;
  let pb='';for(let i=1;i<=pages;i++)pb+=`<button class="page-btn ${i===curPage?'active':''}" onclick="goPage(${i})">${i}</button>`;
  document.getElementById('pageBtns').innerHTML=pb;
}
function goPage(p){curPage=p;renderTable();}
document.getElementById('searchInput').addEventListener('input',()=>{curPage=1;renderTable();});
document.getElementById('statusFilter').addEventListener('change',()=>{curPage=1;renderTable();});
document.getElementById('priorityFilter').addEventListener('change',()=>{curPage=1;renderTable();});
renderTable();

// ===== DETAIL PANEL =====
const overlay=document.getElementById('detailOverlay');
const panel=document.getElementById('detailPanel');
function openDetail(id){
  const g=GRIEVANCES.find(x=>x.grievance_id===id);
  if(!g)return;
  document.getElementById('panelTitle').textContent=g.grievance_id;
  document.getElementById('panelBody').innerHTML=`
    <div class="detail-section">
      <h5><i class="bi bi-info-circle me-1"></i>Grievance Information</h5>
      ${dr('ID',g.grievance_id)}${dr('Title',g.complaint_title)}${dr('Category',g.complaint_category)}
      ${dr('Status','<span class="badge-s '+getStatusBadgeClass(g.current_status)+'">'+g.current_status+'</span>')}
      ${dr('Priority','<span class="badge-s '+getPriorityClass(g.priority)+'">'+g.priority+'</span>')}
      ${dr('Work Type',g.work_type)}
      <div class="status-reason"><i class="bi bi-info-circle me-1"></i>${getSubmissionReason(g)}</div>
    </div>
    <div class="detail-section">
      <h5><i class="bi bi-person me-1"></i>Citizen Details</h5>
      ${dr('Name',g.citizen_name)}${dr('Phone',g.citizen_phone)}${dr('Area',g.area_name)}${dr('Address',g.address)}
    </div>
    <div class="detail-section">
      <h5><i class="bi bi-geo-alt me-1"></i>Location</h5>
      ${dr('Latitude',g.latitude)}${dr('Longitude',g.longitude)}
    </div>
    <div class="detail-section">
      <h5><i class="bi bi-calendar me-1"></i>Assignment</h5>
      ${dr('Assigned Date',g.assignment_date)}${dr('Due Date',g.due_date)}${dr('Remarks',g.remarks)}
      ${g.reopen_count?dr('Reopen Count','<span class="text-danger fw-bold">'+g.reopen_count+'</span>'):''}
    </div>
    <div class="detail-section">
      <h5><i class="bi bi-camera me-1"></i>Evidence Status</h5>
      ${dr('Before Photo',g.before_photo_status?'<span class="bool-yes">✓ Uploaded</span>':'<span class="bool-no">✗ Not uploaded</span>')}
      ${dr('After Photo',g.after_photo_status?'<span class="bool-yes">✓ Uploaded</span>':'<span class="bool-no">✗ Not uploaded</span>')}
      ${dr('Live Photo',g.live_photo_status?'<span class="bool-yes">✓ Captured</span>':'<span class="bool-no">✗ Not captured</span>')}
      ${dr('GPS',g.gps_status?'<span class="bool-yes">✓ Captured</span>':'<span class="bool-no">✗ Not captured</span>')}
      ${dr('Submission','<span class="badge-s '+getStatusBadgeClass(g.submission_status)+'">'+g.submission_status+'</span>')}
    </div>
    ${g.resolution_title?`<div class="detail-section"><h5><i class="bi bi-check-circle me-1"></i>Resolution</h5>${dr('Title',g.resolution_title)}${dr('Description',g.resolution_description)}</div>`:''}
    <div style="padding:0.5rem 0;">
      <button class="btn btn-gps w-100" onclick="closeDetail();switchTab('resolution');document.getElementById('resGrievance').value='${g.grievance_id}';onGrievanceSelect();">
        <i class="bi bi-upload me-1"></i>Submit Resolution for this Grievance
      </button>
    </div>
  `;
  overlay.classList.add('show');panel.classList.add('show');
}
function dr(l,v){return `<div class="d-row"><span class="lbl">${l}</span><span class="val">${v}</span></div>`;}
function closeDetail(){overlay.classList.remove('show');panel.classList.remove('show');}
overlay.addEventListener('click',closeDetail);
document.getElementById('panelClose').addEventListener('click',closeDetail);

// ===== QUICK SUBMIT (from Assigned tab) =====
function quickSubmit(grievanceId){
  // Switch to resolution tab
  switchTab('resolution');
  // Select the grievance in dropdown
  const sel = document.getElementById('resGrievance');
  sel.value = grievanceId;
  // Trigger auto-fill
  onGrievanceSelect();
  // Scroll to the live photo capture section
  setTimeout(()=>{
    const photoBox = document.getElementById('boxLive');
    if(photoBox) photoBox.scrollIntoView({behavior:'smooth', block:'center'});
  }, 400);
}

// ===== RESOLUTION FORM =====
function populateGrievanceSelect(){
  const sel=document.getElementById('resGrievance');
  const cur=sel.value;
  sel.innerHTML='<option value="">-- Choose a pending grievance --</option>';
  GRIEVANCES.filter(g=>g.submission_status!=='Submitted').forEach(g=>{
    sel.innerHTML+=`<option value="${g.grievance_id}">${g.grievance_id} — ${g.complaint_title} (${g.current_status})</option>`;
  });
  if(cur)sel.value=cur;
}
document.getElementById('resGrievance').addEventListener('change',onGrievanceSelect);
function onGrievanceSelect(){
  const id=document.getElementById('resGrievance').value;
  const info=document.getElementById('selectedInfo');
  if(!id){
    info.innerHTML='';
    // Clear all auto-filled fields
    document.getElementById('resTitle').value='';
    document.getElementById('resDesc').value='';
    document.getElementById('resLat').value='';
    document.getElementById('resLng').value='';
    document.getElementById('resRemarks').value='';
    gpsOk=false;
    document.getElementById('gpsDot').className='perm-dot no';
    document.getElementById('gpsLabel').textContent='GPS: Not captured';
    document.getElementById('gpsMsg').innerHTML='';
    return;
  }
  const g=GRIEVANCES.find(x=>x.grievance_id===id);
  if(!g){info.innerHTML='';return;}

  // Show grievance info banner
  info.innerHTML=`<div style="background:linear-gradient(135deg,#EFF6FF,#DBEAFE);border:1px solid #93C5FD;border-radius:10px;padding:0.75rem 1rem;margin-top:0.5rem;">
    <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.4rem;">
      <i class="bi bi-info-circle-fill" style="color:#1E40AF;"></i>
      <strong style="color:#1E3A8A;">${g.complaint_title}</strong>
    </div>
    <div style="font-size:0.82rem;color:#374151;margin-bottom:0.35rem;"><i class="bi bi-geo-alt me-1"></i>${g.area_name}, ${g.address}</div>
    <div style="font-size:0.82rem;color:#374151;margin-bottom:0.35rem;"><i class="bi bi-person me-1"></i>${g.citizen_name} — ${g.citizen_phone}</div>
    <div style="display:flex;gap:0.4rem;flex-wrap:wrap;">
      <span class="badge-s ${getPriorityClass(g.priority)}">${g.priority}</span>
      <span class="badge-s ${getStatusBadgeClass(g.current_status)}">${g.current_status}</span>
      <span class="badge-s" style="background:#F3F4F6;color:#374151;">${g.work_type}</span>
    </div>
    <div style="margin-top:0.5rem;padding-top:0.4rem;border-top:1px dashed #93C5FD;font-size:0.78rem;color:#1E40AF;">
      <i class="bi bi-lightning-charge-fill me-1"></i>All fields auto-filled — <strong>only capture a Live Photo</strong> to submit
    </div>
  </div>`;

  // === AUTO-FILL ALL FIELDS ===

  // 1. Resolution Title — auto-generate from complaint
  const autoTitle = g.resolution_title || `Resolved: ${g.complaint_title}`;
  document.getElementById('resTitle').value = autoTitle;

  // 2. Resolution Description — auto-generate from grievance context
  const autoDesc = g.resolution_description || `${g.work_type} work completed for "${g.complaint_title}" at ${g.area_name}, ${g.address}. Category: ${g.complaint_category}. Citizen: ${g.citizen_name}.`;
  document.getElementById('resDesc').value = autoDesc;

  // 3. GPS — auto-fill from grievance coordinates
  if(g.latitude && g.longitude){
    document.getElementById('resLat').value = g.latitude;
    document.getElementById('resLng').value = g.longitude;
    gpsOk = true;
    document.getElementById('gpsDot').classList.remove('no');
    document.getElementById('gpsDot').classList.add('ok');
    document.getElementById('gpsLabel').textContent = 'GPS: Auto-filled from grievance ✓';
    document.getElementById('gpsMsg').innerHTML = '<span class="text-success"><i class="bi bi-check-circle"></i> Location auto-filled from grievance record (Lat: '+g.latitude+', Lng: '+g.longitude+')</span>';
  }

  // 4. Remarks — carry over existing remarks
  document.getElementById('resRemarks').value = g.remarks || '';

  // Highlight that only live photo is needed
  if(!livePhoto){
    showToast('📋 All fields auto-filled! Just capture a Live Photo to submit.');
  }
}

// GPS
let gpsOk=false;
document.getElementById('fetchGpsBtn').addEventListener('click',()=>{
  const msg=document.getElementById('gpsMsg');
  if(!navigator.geolocation){msg.innerHTML='<span class="text-danger">Geolocation not supported. Enter manually.</span>';return;}
  msg.innerHTML='<span class="text-info"><i class="bi bi-arrow-repeat"></i> Fetching location...</span>';
  navigator.geolocation.getCurrentPosition(pos=>{
    document.getElementById('resLat').value=pos.coords.latitude.toFixed(6);
    document.getElementById('resLng').value=pos.coords.longitude.toFixed(6);
    gpsOk=true;
    document.getElementById('gpsDot').classList.replace('no','ok');
    document.getElementById('gpsLabel').textContent='GPS: Captured ✓';
    msg.innerHTML='<span class="text-success"><i class="bi bi-check-circle"></i> Location captured successfully</span>';
  },err=>{
    msg.innerHTML='<span class="text-danger"><i class="bi bi-x-circle"></i> GPS denied. Please enter manually.</span>';
  },{enableHighAccuracy:true,timeout:10000});
});
// Manual lat/lng
['resLat','resLng'].forEach(id=>{
  document.getElementById(id).addEventListener('input',()=>{
    if(document.getElementById('resLat').value&&document.getElementById('resLng').value){
      gpsOk=true;
      document.getElementById('gpsDot').classList.replace('no','ok');
      document.getElementById('gpsLabel').textContent='GPS: Entered manually ✓';
    }
  });
});

// Photo state
let livePhoto=null;

// ===== CAMERA =====
let camStream=null,capturedImg=null;
function openCamera(){
  document.getElementById('camModalBg').classList.add('show');
  const video=document.getElementById('camVideo');
  const preview=document.getElementById('camPreview');
  video.style.display='block';preview.style.display='none';
  document.getElementById('camCapture').style.display='inline-flex';
  document.getElementById('camRetake').style.display='none';
  document.getElementById('camUse').disabled=true;
  navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}}).then(stream=>{
    camStream=stream;video.srcObject=stream;
    document.getElementById('camDot').classList.replace('no','ok');
    document.getElementById('camLabel').textContent='Camera: Granted ✓';
  }).catch(()=>{
    document.getElementById('camLabel').textContent='Camera: Denied ✗';
    showToast('Camera access denied');
    closeCam();
  });
}
document.getElementById('camCapture').addEventListener('click',()=>{
  const video=document.getElementById('camVideo');
  const canvas=document.getElementById('camCanvas');
  const preview=document.getElementById('camPreview');
  canvas.width=video.videoWidth;canvas.height=video.videoHeight;
  canvas.getContext('2d').drawImage(video,0,0);
  capturedImg=canvas.toDataURL('image/jpeg',0.85);
  preview.src=capturedImg;
  video.style.display='none';preview.style.display='block';
  document.getElementById('camCapture').style.display='none';
  document.getElementById('camRetake').style.display='inline-flex';
  document.getElementById('camUse').disabled=false;
});
document.getElementById('camRetake').addEventListener('click',()=>{
  document.getElementById('camVideo').style.display='block';
  document.getElementById('camPreview').style.display='none';
  document.getElementById('camCapture').style.display='inline-flex';
  document.getElementById('camRetake').style.display='none';
  document.getElementById('camUse').disabled=true;
  capturedImg=null;
});
document.getElementById('camUse').addEventListener('click',()=>{
  if(!capturedImg)return;
  livePhoto=capturedImg;
  const box=document.getElementById('boxLive');
  box.classList.add('has-photo');
  box.innerHTML=`<img src="${capturedImg}"><span style="margin-top:4px;">Live ✓</span>`;
  closeCam();
  showToast('Live photo captured successfully');
});
document.getElementById('camClose').addEventListener('click',closeCam);
function closeCam(){
  if(camStream){camStream.getTracks().forEach(t=>t.stop());camStream=null;}
  document.getElementById('camModalBg').classList.remove('show');
}

// ===== SUBMIT =====
document.getElementById('submitBtn').addEventListener('click',()=>{
  const id=document.getElementById('resGrievance').value;
  const title=document.getElementById('resTitle').value.trim();
  const desc=document.getElementById('resDesc').value.trim();
  const lat=document.getElementById('resLat').value.trim();
  const lng=document.getElementById('resLng').value.trim();
  const remarks=document.getElementById('resRemarks').value.trim();
  // Validate
  const errs=[];
  if(!id)errs.push('Please select a grievance');
  if(!title)errs.push('Resolution title is required');
  if(!lat||!lng)errs.push('Latitude and longitude are required');
  if(!livePhoto)errs.push('Live photo must be captured');
  const errBox=document.getElementById('valErrors');
  if(errs.length){
    errBox.style.display='block';
    errBox.innerHTML=errs.map(e=>`<p><i class="bi bi-exclamation-triangle me-1"></i>${e}</p>`).join('');
    return;
  }
  errBox.style.display='none';
  // Update data
  const idx=GRIEVANCES.findIndex(g=>g.grievance_id===id);
  if(idx!==-1){
    GRIEVANCES[idx].resolution_title=title;
    GRIEVANCES[idx].resolution_description=desc;
    GRIEVANCES[idx].live_photo_status=true;
    GRIEVANCES[idx].gps_status=true;
    GRIEVANCES[idx].current_status='Submitted';
    GRIEVANCES[idx].submission_status='Submitted';
    GRIEVANCES[idx].remarks=remarks||GRIEVANCES[idx].remarks;
    GRIEVANCES[idx].last_updated=new Date().toISOString().split('T')[0];
  }
  // Reset form
  document.getElementById('resGrievance').value='';
  document.getElementById('resTitle').value='';
  document.getElementById('resDesc').value='';
  document.getElementById('resLat').value='';
  document.getElementById('resLng').value='';
  document.getElementById('resRemarks').value='';
  document.getElementById('selectedInfo').innerHTML='';
  livePhoto=null;
  document.getElementById('boxLive').classList.remove('has-photo');
  document.getElementById('boxLive').innerHTML='<i class="bi bi-camera-video"></i><span>Capture Live Photo</span>';
  // Reset GPS status
  gpsOk=false;
  document.getElementById('gpsDot').className='perm-dot no';
  document.getElementById('gpsLabel').textContent='GPS: Not captured';
  // Scroll to top on mobile
  window.scrollTo({top:0,behavior:'smooth'});
  renderSummary();renderTable();populateGrievanceSelect();
  showToast('Evidence submitted successfully for '+id);
});

// ===== SUBMITTED EVIDENCE =====
function renderSubmitted(){
  const submitted=GRIEVANCES.filter(g=>g.submission_status==='Submitted');
  if(!submitted.length){document.getElementById('submittedList').innerHTML='<div class="ev-card text-center" style="padding:2rem;color:#9CA3AF;"><i class="bi bi-inbox" style="font-size:2rem;"></i><p class="mt-2">No submissions yet</p></div>';return;}
  document.getElementById('submittedList').innerHTML=submitted.map(g=>`
    <div class="ev-card">
      <div class="ev-top">
        <strong style="color:var(--primary);">${g.grievance_id}</strong>
        <span class="badge-s badge-submitted">Submitted</span>
      </div>
      <div style="font-weight:600;margin-bottom:0.35rem;">${g.complaint_title}</div>
      <div style="font-size:0.82rem;color:#6B7280;margin-bottom:0.5rem;">${g.area_name} — ${g.address}</div>
      ${g.resolution_title?`<div style="font-size:0.85rem;"><strong>Resolution:</strong> ${g.resolution_title}</div>`:''}
      <div style="display:flex;gap:0.75rem;flex-wrap:wrap;margin-top:0.5rem;font-size:0.78rem;">
        <span class="${g.before_photo_status?'bool-yes':'bool-no'}"><i class="bi ${g.before_photo_status?'bi-check-lg':'bi-x-lg'}"></i> Before</span>
        <span class="${g.after_photo_status?'bool-yes':'bool-no'}"><i class="bi ${g.after_photo_status?'bi-check-lg':'bi-x-lg'}"></i> After</span>
        <span class="${g.live_photo_status?'bool-yes':'bool-no'}"><i class="bi ${g.live_photo_status?'bi-check-lg':'bi-x-lg'}"></i> Live</span>
        <span class="${g.gps_status?'bool-yes':'bool-no'}"><i class="bi ${g.gps_status?'bi-check-lg':'bi-x-lg'}"></i> GPS</span>
      </div>
      <div style="font-size:0.78rem;color:#9CA3AF;margin-top:0.35rem;">Last updated: ${g.last_updated}</div>
    </div>
  `).join('');
}

// ===== TOAST =====
function showToast(msg){
  const t=document.createElement('div');
  t.className='toast-msg';
  t.innerHTML='<i class="bi bi-check-circle me-1"></i>'+msg;
  document.body.appendChild(t);
  setTimeout(()=>{t.style.opacity='0';t.style.transition='opacity 0.3s';setTimeout(()=>t.remove(),300);},2500);
}
