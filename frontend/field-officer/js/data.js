// Field Officer Dummy Dataset
const GRIEVANCES = [
  {
    grievance_id: "GRV-1001", complaint_title: "Streetlight not working", complaint_category: "Electrical",
    citizen_name: "Rahul Sharma", citizen_phone: "9876543210", area_name: "Ward 5",
    address: "Main Road, Near Bus Stand", latitude: 22.4707, longitude: 70.0577,
    assigned_officer: "Amit Patel", officer_id: "FO-101", assignment_date: "2026-04-15",
    due_date: "2026-04-18", priority: "High", current_status: "Pending", work_type: "Repair",
    resolution_title: "", resolution_description: "",
    before_photo_status: false, after_photo_status: false, live_photo_status: false, gps_status: false,
    submission_status: "Not Started", remarks: "Needs urgent attention", reopen_count: 0, last_updated: "2026-04-15"
  },
  {
    grievance_id: "GRV-1002", complaint_title: "Water leakage on road", complaint_category: "Water Supply",
    citizen_name: "Neha Patel", citizen_phone: "9823456780", area_name: "Zone 2",
    address: "Shivaji Chowk", latitude: 22.3039, longitude: 70.8022,
    assigned_officer: "Amit Patel", officer_id: "FO-101", assignment_date: "2026-04-14",
    due_date: "2026-04-19", priority: "Medium", current_status: "Submitted", work_type: "Inspection",
    resolution_title: "Leak repaired", resolution_description: "Pipe joint repaired and road cleaned",
    before_photo_status: true, after_photo_status: true, live_photo_status: true, gps_status: true,
    submission_status: "Submitted", remarks: "Work completed and ready for review", reopen_count: 0, last_updated: "2026-04-16"
  },
  {
    grievance_id: "GRV-1003", complaint_title: "Garbage not collected", complaint_category: "Sanitation",
    citizen_name: "Suresh Kumar", citizen_phone: "9901122334", area_name: "Sector 8",
    address: "Near Temple Road", latitude: 23.0225, longitude: 72.5714,
    assigned_officer: "Amit Patel", officer_id: "FO-101", assignment_date: "2026-04-13",
    due_date: "2026-04-17", priority: "High", current_status: "Reopened", work_type: "Cleaning",
    resolution_title: "", resolution_description: "",
    before_photo_status: true, after_photo_status: false, live_photo_status: false, gps_status: false,
    submission_status: "Failed Submission", remarks: "Need to revisit and resubmit proof", reopen_count: 1, last_updated: "2026-04-17"
  },
  {
    grievance_id: "GRV-1004", complaint_title: "Pothole on highway stretch", complaint_category: "Roads",
    citizen_name: "Meena Devi", citizen_phone: "9812345678", area_name: "Ward 12",
    address: "NH-48, Near Toll Booth", latitude: 22.4850, longitude: 70.0680,
    assigned_officer: "Amit Patel", officer_id: "FO-101", assignment_date: "2026-04-16",
    due_date: "2026-04-20", priority: "High", current_status: "In Progress", work_type: "Repair",
    resolution_title: "", resolution_description: "",
    before_photo_status: true, after_photo_status: false, live_photo_status: false, gps_status: true,
    submission_status: "In Progress", remarks: "Material arranged, filling in progress", reopen_count: 0, last_updated: "2026-04-17"
  },
  {
    grievance_id: "GRV-1005", complaint_title: "Drain overflow in colony", complaint_category: "Drainage",
    citizen_name: "Arvind Joshi", citizen_phone: "9934567890", area_name: "Zone 4",
    address: "Laxmi Nagar, Block C", latitude: 22.3100, longitude: 70.7900,
    assigned_officer: "Amit Patel", officer_id: "FO-101", assignment_date: "2026-04-12",
    due_date: "2026-04-16", priority: "Critical", current_status: "Resolved", work_type: "Cleaning",
    resolution_title: "Drain cleaned completely", resolution_description: "Blocked drain cleared, disinfectant sprayed",
    before_photo_status: true, after_photo_status: true, live_photo_status: true, gps_status: true,
    submission_status: "Submitted", remarks: "Resolved and submitted for approval", reopen_count: 0, last_updated: "2026-04-15"
  },
  {
    grievance_id: "GRV-1006", complaint_title: "Broken park bench", complaint_category: "Parks & Gardens",
    citizen_name: "Priya Mehta", citizen_phone: "9845678901", area_name: "Ward 3",
    address: "Central Park, Sector 5", latitude: 22.4600, longitude: 70.0500,
    assigned_officer: "Amit Patel", officer_id: "FO-101", assignment_date: "2026-04-17",
    due_date: "2026-04-22", priority: "Low", current_status: "Assigned", work_type: "Replacement",
    resolution_title: "", resolution_description: "",
    before_photo_status: false, after_photo_status: false, live_photo_status: false, gps_status: false,
    submission_status: "Not Started", remarks: "New bench to be installed", reopen_count: 0, last_updated: "2026-04-17"
  },
  {
    grievance_id: "GRV-1007", complaint_title: "Illegal dumping near school", complaint_category: "Sanitation",
    citizen_name: "Fatima Begum", citizen_phone: "9756789012", area_name: "Zone 6",
    address: "Behind Govt. School, Ring Road", latitude: 22.3200, longitude: 70.8100,
    assigned_officer: "Amit Patel", officer_id: "FO-101", assignment_date: "2026-04-11",
    due_date: "2026-04-15", priority: "High", current_status: "Submitted", work_type: "Cleaning",
    resolution_title: "Area cleared and sanitized", resolution_description: "All waste removed, area disinfected, warning board placed",
    before_photo_status: true, after_photo_status: true, live_photo_status: true, gps_status: true,
    submission_status: "Submitted", remarks: "Complete evidence submitted", reopen_count: 0, last_updated: "2026-04-14"
  },
  {
    grievance_id: "GRV-1008", complaint_title: "Traffic signal not functioning", complaint_category: "Traffic",
    citizen_name: "Karan Singh", citizen_phone: "9867890123", area_name: "Ward 1",
    address: "MG Road Crossing", latitude: 22.4750, longitude: 70.0600,
    assigned_officer: "Amit Patel", officer_id: "FO-101", assignment_date: "2026-04-16",
    due_date: "2026-04-18", priority: "Critical", current_status: "Pending", work_type: "Repair",
    resolution_title: "", resolution_description: "",
    before_photo_status: false, after_photo_status: false, live_photo_status: false, gps_status: false,
    submission_status: "Not Started", remarks: "Signal board electrician to be arranged", reopen_count: 0, last_updated: "2026-04-16"
  },
  {
    grievance_id: "GRV-1009", complaint_title: "Stray animal menace", complaint_category: "Public Health",
    citizen_name: "Vijay Patil", citizen_phone: "9878901234", area_name: "Sector 11",
    address: "Near Milk Dairy, Industrial Area", latitude: 22.2950, longitude: 70.7850,
    assigned_officer: "Amit Patel", officer_id: "FO-101", assignment_date: "2026-04-15",
    due_date: "2026-04-19", priority: "Medium", current_status: "In Progress", work_type: "Coordination",
    resolution_title: "", resolution_description: "",
    before_photo_status: true, after_photo_status: false, live_photo_status: false, gps_status: true,
    submission_status: "In Progress", remarks: "Animal control team notified", reopen_count: 0, last_updated: "2026-04-17"
  },
  {
    grievance_id: "GRV-1010", complaint_title: "Water supply disruption", complaint_category: "Water Supply",
    citizen_name: "Lakshmi Nair", citizen_phone: "9889012345", area_name: "Ward 8",
    address: "Gandhi Nagar, Plot 45", latitude: 22.4680, longitude: 70.0550,
    assigned_officer: "Amit Patel", officer_id: "FO-101", assignment_date: "2026-04-14",
    due_date: "2026-04-17", priority: "High", current_status: "Reopened", work_type: "Repair",
    resolution_title: "", resolution_description: "",
    before_photo_status: true, after_photo_status: true, live_photo_status: false, gps_status: true,
    submission_status: "Failed Submission", remarks: "Citizen says water still not coming, needs revisit", reopen_count: 2, last_updated: "2026-04-18"
  },
  {
    grievance_id: "GRV-1011", complaint_title: "Footpath encroachment", complaint_category: "Town Planning",
    citizen_name: "Dinesh Agarwal", citizen_phone: "9890123456", area_name: "Zone 1",
    address: "Station Road, Shop No 12-15", latitude: 22.3050, longitude: 70.8000,
    assigned_officer: "Amit Patel", officer_id: "FO-101", assignment_date: "2026-04-17",
    due_date: "2026-04-21", priority: "Medium", current_status: "Assigned", work_type: "Inspection",
    resolution_title: "", resolution_description: "",
    before_photo_status: false, after_photo_status: false, live_photo_status: false, gps_status: false,
    submission_status: "Not Started", remarks: "Visit and document encroachment details", reopen_count: 0, last_updated: "2026-04-17"
  },
  {
    grievance_id: "GRV-1012", complaint_title: "Public toilet not cleaned", complaint_category: "Sanitation",
    citizen_name: "Rekha Chauhan", citizen_phone: "9801234567", area_name: "Ward 7",
    address: "Bus Stand Complex", latitude: 22.4720, longitude: 70.0590,
    assigned_officer: "Amit Patel", officer_id: "FO-101", assignment_date: "2026-04-13",
    due_date: "2026-04-16", priority: "High", current_status: "Resolved", work_type: "Cleaning",
    resolution_title: "Deep cleaning done", resolution_description: "Complete deep cleaning with disinfection, new supplies added",
    before_photo_status: true, after_photo_status: true, live_photo_status: true, gps_status: true,
    submission_status: "Submitted", remarks: "All evidence uploaded", reopen_count: 0, last_updated: "2026-04-15"
  }
];

// Status color mapping
function getStatusBadgeClass(status) {
  const map = {
    'Assigned': 'badge-assigned', 'Pending': 'badge-pending', 'In Progress': 'badge-inprogress',
    'Resolved': 'badge-resolved', 'Submitted': 'badge-submitted', 'Reopened': 'badge-reopened',
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
  if (g.submission_status === 'Failed Submission') return g.remarks;
  const reasons = [];
  if (!g.before_photo_status && !g.after_photo_status) reasons.push('Photos not uploaded');
  else if (!g.after_photo_status) reasons.push('After photo not uploaded');
  if (!g.live_photo_status) reasons.push('Live photo not captured');
  if (!g.gps_status) reasons.push('GPS location not captured');
  if (!g.resolution_title) reasons.push('Resolution note not entered');
  return reasons.length ? reasons.join(' • ') : 'Ready to begin work';
}
