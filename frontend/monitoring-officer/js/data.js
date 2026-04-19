// Dummy Dataset for Monitoring Officer Dashboard
const GRIEVANCES = [
  {
    grievance_id: "GRV-2026-0001", complaint_title: "Waterlogging on main road", complaint_category: "Roads & Drainage",
    citizen_name: "Rajesh Patel", phone_number: "9876543210", area_name: "Navrangpura", address: "Near Stadium Circle, Navrangpura, Ahmedabad",
    latitude: 23.0365, longitude: 72.5612, assigned_officer: "Amit Sharma", officer_id: "FO-101",
    assign_date: "2026-03-01", submission_date: "2026-03-05", status: "Approved",
    ivr_status: "Confirmed", ivr_call_time: "2026-03-06 10:30", citizen_feedback: "Satisfied",
    photo_uploaded: true, live_photo_captured: true, resolution_verified: true,
    reopened: false, reopen_reason: "", approval_time_hours: 96, rejection_reason: "", remarks: "Drainage cleared and road repaired"
  },
  {
    grievance_id: "GRV-2026-0002", complaint_title: "Streetlight not working", complaint_category: "Electricity",
    citizen_name: "Meena Shah", phone_number: "9876543211", area_name: "Maninagar", address: "Opp. Maninagar Railway Station, Ahmedabad",
    latitude: 23.0028, longitude: 72.6139, assigned_officer: "Vikram Singh", officer_id: "FO-102",
    assign_date: "2026-03-02", submission_date: "2026-03-06", status: "Approved",
    ivr_status: "Confirmed", ivr_call_time: "2026-03-07 11:00", citizen_feedback: "Very Satisfied",
    photo_uploaded: true, live_photo_captured: true, resolution_verified: true,
    reopened: false, reopen_reason: "", approval_time_hours: 72, rejection_reason: "", remarks: "New LED light installed"
  },
  {
    grievance_id: "GRV-2026-0003", complaint_title: "Garbage not collected for 5 days", complaint_category: "Sanitation",
    citizen_name: "Suresh Kumar", phone_number: "9876543212", area_name: "Satellite", address: "Jodhpur Cross Road, Satellite, Ahmedabad",
    latitude: 23.0258, longitude: 72.5106, assigned_officer: "Amit Sharma", officer_id: "FO-101",
    assign_date: "2026-03-03", submission_date: "2026-03-08", status: "Rejected",
    ivr_status: "Not Confirmed", ivr_call_time: "2026-03-09 09:15", citizen_feedback: "Not Satisfied",
    photo_uploaded: true, live_photo_captured: false, resolution_verified: false,
    reopened: false, reopen_reason: "", approval_time_hours: 0, rejection_reason: "Location mismatch in proof photo", remarks: "Photo GPS does not match complaint location"
  },
  {
    grievance_id: "GRV-2026-0004", complaint_title: "Pothole on highway stretch", complaint_category: "Roads & Drainage",
    citizen_name: "Fatima Begum", phone_number: "9876543213", area_name: "Vastrapur", address: "IIM Road, Vastrapur, Ahmedabad",
    latitude: 23.0302, longitude: 72.5274, assigned_officer: "Priya Desai", officer_id: "FO-103",
    assign_date: "2026-03-04", submission_date: "2026-03-10", status: "Pending",
    ivr_status: "Pending", ivr_call_time: "", citizen_feedback: "",
    photo_uploaded: false, live_photo_captured: false, resolution_verified: false,
    reopened: false, reopen_reason: "", approval_time_hours: 0, rejection_reason: "", remarks: "Awaiting field visit"
  },
  {
    grievance_id: "GRV-2026-0005", complaint_title: "Water supply irregular", complaint_category: "Water Supply",
    citizen_name: "Anita Joshi", phone_number: "9876543214", area_name: "Bodakdev", address: "Judges Bungalow Road, Bodakdev, Ahmedabad",
    latitude: 23.0388, longitude: 72.5046, assigned_officer: "Vikram Singh", officer_id: "FO-102",
    assign_date: "2026-03-05", submission_date: "2026-03-12", status: "Reopened",
    ivr_status: "Not Confirmed", ivr_call_time: "2026-03-13 14:00", citizen_feedback: "Not Satisfied",
    photo_uploaded: true, live_photo_captured: true, resolution_verified: false,
    reopened: true, reopen_reason: "Citizen reported issue persists after repair", approval_time_hours: 0, rejection_reason: "", remarks: "Pipe repaired but leakage continues"
  },
  {
    grievance_id: "GRV-2026-0006", complaint_title: "Illegal construction complaint", complaint_category: "Town Planning",
    citizen_name: "Dinesh Mehta", phone_number: "9876543215", area_name: "Prahlad Nagar", address: "CG Road Extension, Prahlad Nagar",
    latitude: 23.0145, longitude: 72.5125, assigned_officer: "Amit Sharma", officer_id: "FO-101",
    assign_date: "2026-03-06", submission_date: "2026-03-14", status: "Submitted",
    ivr_status: "Pending", ivr_call_time: "", citizen_feedback: "",
    photo_uploaded: true, live_photo_captured: true, resolution_verified: false,
    reopened: false, reopen_reason: "", approval_time_hours: 0, rejection_reason: "", remarks: "Evidence submitted, awaiting review"
  },
  {
    grievance_id: "GRV-2026-0007", complaint_title: "Stray dog menace in colony", complaint_category: "Public Health",
    citizen_name: "Kavita Rao", phone_number: "9876543216", area_name: "Thaltej", address: "SG Highway, Thaltej, Ahmedabad",
    latitude: 23.0480, longitude: 72.4997, assigned_officer: "Priya Desai", officer_id: "FO-103",
    assign_date: "2026-03-07", submission_date: "2026-03-15", status: "Approved",
    ivr_status: "Confirmed", ivr_call_time: "2026-03-16 10:45", citizen_feedback: "Satisfied",
    photo_uploaded: true, live_photo_captured: true, resolution_verified: true,
    reopened: false, reopen_reason: "", approval_time_hours: 48, rejection_reason: "", remarks: "Animal control team deployed"
  },
  {
    grievance_id: "GRV-2026-0008", complaint_title: "Broken footpath near school", complaint_category: "Roads & Drainage",
    citizen_name: "Mohan Lal", phone_number: "9876543217", area_name: "Paldi", address: "Near Gujarat College, Paldi, Ahmedabad",
    latitude: 23.0168, longitude: 72.5608, assigned_officer: "Raju Verma", officer_id: "FO-104",
    assign_date: "2026-03-08", submission_date: "2026-03-16", status: "Pending",
    ivr_status: "No Response", ivr_call_time: "2026-03-17 09:00", citizen_feedback: "",
    photo_uploaded: false, live_photo_captured: false, resolution_verified: false,
    reopened: false, reopen_reason: "", approval_time_hours: 0, rejection_reason: "", remarks: "Officer has not visited yet"
  },
  {
    grievance_id: "GRV-2026-0009", complaint_title: "Overflowing sewage drain", complaint_category: "Sanitation",
    citizen_name: "Sanjay Gupta", phone_number: "9876543218", area_name: "Naranpura", address: "GNFC Circle, Naranpura, Ahmedabad",
    latitude: 23.0487, longitude: 72.5543, assigned_officer: "Vikram Singh", officer_id: "FO-102",
    assign_date: "2026-03-09", submission_date: "2026-03-17", status: "Approved",
    ivr_status: "Confirmed", ivr_call_time: "2026-03-18 11:30", citizen_feedback: "Very Satisfied",
    photo_uploaded: true, live_photo_captured: true, resolution_verified: true,
    reopened: false, reopen_reason: "", approval_time_hours: 36, rejection_reason: "", remarks: "Drain cleaned and sanitized"
  },
  {
    grievance_id: "GRV-2026-0010", complaint_title: "Noise pollution from factory", complaint_category: "Environment",
    citizen_name: "Lakshmi Nair", phone_number: "9876543219", area_name: "Odhav", address: "GIDC Odhav, Ahmedabad",
    latitude: 23.0273, longitude: 72.6398, assigned_officer: "Raju Verma", officer_id: "FO-104",
    assign_date: "2026-03-10", submission_date: "2026-03-18", status: "Rejected",
    ivr_status: "Failed", ivr_call_time: "2026-03-19 15:00", citizen_feedback: "Not Satisfied",
    photo_uploaded: true, live_photo_captured: false, resolution_verified: false,
    reopened: false, reopen_reason: "", approval_time_hours: 0, rejection_reason: "Insufficient evidence provided", remarks: "No sound level reading submitted"
  },
  {
    grievance_id: "GRV-2026-0011", complaint_title: "Park not maintained", complaint_category: "Parks & Gardens",
    citizen_name: "Arjun Reddy", phone_number: "9876543220", area_name: "Ambawadi", address: "Nehru Park, Ambawadi, Ahmedabad",
    latitude: 23.0285, longitude: 72.5530, assigned_officer: "Priya Desai", officer_id: "FO-103",
    assign_date: "2026-03-11", submission_date: "2026-03-19", status: "Approved",
    ivr_status: "Confirmed", ivr_call_time: "2026-03-20 10:00", citizen_feedback: "Satisfied",
    photo_uploaded: true, live_photo_captured: true, resolution_verified: true,
    reopened: false, reopen_reason: "", approval_time_hours: 60, rejection_reason: "", remarks: "Gardening and cleaning completed"
  },
  {
    grievance_id: "GRV-2026-0012", complaint_title: "Encroachment on public land", complaint_category: "Town Planning",
    citizen_name: "Pooja Sharma", phone_number: "9876543221", area_name: "Ellis Bridge", address: "Riverfront Road, Ellis Bridge",
    latitude: 23.0262, longitude: 72.5654, assigned_officer: "Amit Sharma", officer_id: "FO-101",
    assign_date: "2026-03-12", submission_date: "", status: "Pending",
    ivr_status: "Pending", ivr_call_time: "", citizen_feedback: "",
    photo_uploaded: false, live_photo_captured: false, resolution_verified: false,
    reopened: false, reopen_reason: "", approval_time_hours: 0, rejection_reason: "", remarks: "Not yet assigned to field visit"
  },
  {
    grievance_id: "GRV-2026-0013", complaint_title: "Contaminated drinking water", complaint_category: "Water Supply",
    citizen_name: "Harish Pandey", phone_number: "9876543222", area_name: "Chandkheda", address: "New CG Road, Chandkheda",
    latitude: 23.1105, longitude: 72.5898, assigned_officer: "Raju Verma", officer_id: "FO-104",
    assign_date: "2026-03-13", submission_date: "2026-03-20", status: "Reopened",
    ivr_status: "Not Confirmed", ivr_call_time: "2026-03-21 14:30", citizen_feedback: "Not Satisfied",
    photo_uploaded: true, live_photo_captured: true, resolution_verified: false,
    reopened: true, reopen_reason: "Water quality test failed again", approval_time_hours: 0, rejection_reason: "", remarks: "Chlorination done but TDS still high"
  },
  {
    grievance_id: "GRV-2026-0014", complaint_title: "Traffic signal malfunction", complaint_category: "Traffic",
    citizen_name: "Nisha Agarwal", phone_number: "9876543223", area_name: "Ashram Road", address: "Income Tax Circle, Ashram Road",
    latitude: 23.0315, longitude: 72.5685, assigned_officer: "Vikram Singh", officer_id: "FO-102",
    assign_date: "2026-03-14", submission_date: "2026-03-21", status: "Approved",
    ivr_status: "Confirmed", ivr_call_time: "2026-03-22 09:45", citizen_feedback: "Satisfied",
    photo_uploaded: true, live_photo_captured: true, resolution_verified: true,
    reopened: false, reopen_reason: "", approval_time_hours: 24, rejection_reason: "", remarks: "Signal repaired and tested"
  },
  {
    grievance_id: "GRV-2026-0015", complaint_title: "Mosquito breeding in open area", complaint_category: "Public Health",
    citizen_name: "Ramesh Bhatt", phone_number: "9876543224", area_name: "Gota", address: "Gota Cross Road, Ahmedabad",
    latitude: 23.1020, longitude: 72.5440, assigned_officer: "Priya Desai", officer_id: "FO-103",
    assign_date: "2026-03-15", submission_date: "2026-03-22", status: "Submitted",
    ivr_status: "Pending", ivr_call_time: "", citizen_feedback: "",
    photo_uploaded: true, live_photo_captured: true, resolution_verified: false,
    reopened: false, reopen_reason: "", approval_time_hours: 0, rejection_reason: "", remarks: "Fogging done, awaiting IVR"
  },
  {
    grievance_id: "GRV-2026-0016", complaint_title: "School building needs repair", complaint_category: "Education",
    citizen_name: "Geeta Devi", phone_number: "9876543225", area_name: "Bapunagar", address: "Municipal School, Bapunagar",
    latitude: 23.0387, longitude: 72.6210, assigned_officer: "Amit Sharma", officer_id: "FO-101",
    assign_date: "2026-03-16", submission_date: "2026-03-24", status: "Approved",
    ivr_status: "Confirmed", ivr_call_time: "2026-03-25 10:15", citizen_feedback: "Very Satisfied",
    photo_uploaded: true, live_photo_captured: true, resolution_verified: true,
    reopened: false, reopen_reason: "", approval_time_hours: 48, rejection_reason: "", remarks: "Roof and wall plastering completed"
  },
  {
    grievance_id: "GRV-2026-0017", complaint_title: "Unauthorized parking on road", complaint_category: "Traffic",
    citizen_name: "Vijay Patil", phone_number: "9876543226", area_name: "Law Garden", address: "Law Garden Road, Ahmedabad",
    latitude: 23.0278, longitude: 72.5558, assigned_officer: "Raju Verma", officer_id: "FO-104",
    assign_date: "2026-03-17", submission_date: "2026-03-25", status: "Rejected",
    ivr_status: "Failed", ivr_call_time: "2026-03-26 16:00", citizen_feedback: "",
    photo_uploaded: true, live_photo_captured: false, resolution_verified: false,
    reopened: false, reopen_reason: "", approval_time_hours: 0, rejection_reason: "No live photo captured at site", remarks: "Field officer did not follow SOP"
  },
  {
    grievance_id: "GRV-2026-0018", complaint_title: "Bus stop shelter damaged", complaint_category: "Public Transport",
    citizen_name: "Sunita Devi", phone_number: "9876543227", area_name: "Kalupur", address: "Kalupur Station Road, Ahmedabad",
    latitude: 23.0225, longitude: 72.6055, assigned_officer: "Vikram Singh", officer_id: "FO-102",
    assign_date: "2026-03-18", submission_date: "2026-03-26", status: "Pending",
    ivr_status: "No Response", ivr_call_time: "2026-03-27 10:00", citizen_feedback: "",
    photo_uploaded: true, live_photo_captured: true, resolution_verified: false,
    reopened: false, reopen_reason: "", approval_time_hours: 0, rejection_reason: "", remarks: "IVR call not answered by citizen"
  },
  {
    grievance_id: "GRV-2026-0019", complaint_title: "Open manhole cover missing", complaint_category: "Roads & Drainage",
    citizen_name: "Kiran Desai", phone_number: "9876543228", area_name: "Shahibaug", address: "Shahibaug Road, near Police HQ",
    latitude: 23.0450, longitude: 72.5870, assigned_officer: "Priya Desai", officer_id: "FO-103",
    assign_date: "2026-03-19", submission_date: "2026-03-27", status: "Approved",
    ivr_status: "Confirmed", ivr_call_time: "2026-03-28 09:30", citizen_feedback: "Satisfied",
    photo_uploaded: true, live_photo_captured: true, resolution_verified: true,
    reopened: false, reopen_reason: "", approval_time_hours: 18, rejection_reason: "", remarks: "New manhole cover installed"
  },
  {
    grievance_id: "GRV-2026-0020", complaint_title: "Ration shop not distributing", complaint_category: "Food & Civil Supplies",
    citizen_name: "Bhavna Solanki", phone_number: "9876543229", area_name: "Juhapura", address: "Sarkhej Road, Juhapura",
    latitude: 23.0012, longitude: 72.5230, assigned_officer: "Raju Verma", officer_id: "FO-104",
    assign_date: "2026-03-20", submission_date: "2026-03-28", status: "Reopened",
    ivr_status: "Not Confirmed", ivr_call_time: "2026-03-29 11:00", citizen_feedback: "Not Satisfied",
    photo_uploaded: true, live_photo_captured: true, resolution_verified: false,
    reopened: true, reopen_reason: "Citizen says ration still not received", approval_time_hours: 0, rejection_reason: "", remarks: "Inspector visit scheduled again"
  },
  {
    grievance_id: "GRV-2026-0021", complaint_title: "Electricity bill overcharged", complaint_category: "Electricity",
    citizen_name: "Prakash Jain", phone_number: "9876543230", area_name: "CG Road", address: "Swastik Cross Road, CG Road",
    latitude: 23.0310, longitude: 72.5570, assigned_officer: "Amit Sharma", officer_id: "FO-101",
    assign_date: "2026-03-21", submission_date: "2026-03-29", status: "Submitted",
    ivr_status: "Pending", ivr_call_time: "", citizen_feedback: "",
    photo_uploaded: true, live_photo_captured: false, resolution_verified: false,
    reopened: false, reopen_reason: "", approval_time_hours: 0, rejection_reason: "", remarks: "Meter reading verification pending"
  },
  {
    grievance_id: "GRV-2026-0022", complaint_title: "Dangerous tree needs trimming", complaint_category: "Parks & Gardens",
    citizen_name: "Usha Prajapati", phone_number: "9876543231", area_name: "Bopal", address: "South Bopal, near Shilaj Circle",
    latitude: 23.0145, longitude: 72.4685, assigned_officer: "Vikram Singh", officer_id: "FO-102",
    assign_date: "2026-03-22", submission_date: "2026-03-30", status: "Approved",
    ivr_status: "Confirmed", ivr_call_time: "2026-03-31 10:00", citizen_feedback: "Very Satisfied",
    photo_uploaded: true, live_photo_captured: true, resolution_verified: true,
    reopened: false, reopen_reason: "", approval_time_hours: 30, rejection_reason: "", remarks: "Tree trimmed by garden dept"
  },
  {
    grievance_id: "GRV-2026-0023", complaint_title: "Public toilet not cleaned", complaint_category: "Sanitation",
    citizen_name: "Mahesh Thakor", phone_number: "9876543232", area_name: "Dariapur", address: "Dariapur Gate, Old City",
    latitude: 23.0290, longitude: 72.5890, assigned_officer: "Priya Desai", officer_id: "FO-103",
    assign_date: "2026-03-23", submission_date: "2026-04-01", status: "Approved",
    ivr_status: "Confirmed", ivr_call_time: "2026-04-02 09:00", citizen_feedback: "Satisfied",
    photo_uploaded: true, live_photo_captured: true, resolution_verified: true,
    reopened: false, reopen_reason: "", approval_time_hours: 42, rejection_reason: "", remarks: "Deep cleaning and disinfection done"
  },
  {
    grievance_id: "GRV-2026-0024", complaint_title: "Road divider broken after accident", complaint_category: "Roads & Drainage",
    citizen_name: "Nitin Vasava", phone_number: "9876543233", area_name: "Vastral", address: "Vastral Ring Road, Ahmedabad",
    latitude: 23.0150, longitude: 72.6500, assigned_officer: "Raju Verma", officer_id: "FO-104",
    assign_date: "2026-03-24", submission_date: "", status: "Pending",
    ivr_status: "Pending", ivr_call_time: "", citizen_feedback: "",
    photo_uploaded: false, live_photo_captured: false, resolution_verified: false,
    reopened: false, reopen_reason: "", approval_time_hours: 0, rejection_reason: "", remarks: "Awaiting material procurement"
  },
  {
    grievance_id: "GRV-2026-0025", complaint_title: "Hospital staff misbehavior", complaint_category: "Health Services",
    citizen_name: "Rekha Chauhan", phone_number: "9876543234", area_name: "Saraspur", address: "Civil Hospital Area, Saraspur",
    latitude: 23.0340, longitude: 72.5950, assigned_officer: "Amit Sharma", officer_id: "FO-101",
    assign_date: "2026-03-25", submission_date: "2026-04-02", status: "Rejected",
    ivr_status: "Not Confirmed", ivr_call_time: "2026-04-03 14:00", citizen_feedback: "Not Satisfied",
    photo_uploaded: true, live_photo_captured: false, resolution_verified: false,
    reopened: false, reopen_reason: "", approval_time_hours: 0, rejection_reason: "No actionable evidence submitted", remarks: "Verbal complaint only, no documentation"
  }
];

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
