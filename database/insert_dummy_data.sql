-- ============================================================
-- Lakshya Grievance Redressal System — Dummy Data
-- Run AFTER schema.sql
-- ============================================================

-- -------------------------------------------------------
-- 1. Departments (5)
-- -------------------------------------------------------
INSERT INTO departments (name, total_claimed_resolved, quality_score) VALUES
    ('Water Supply',    42, 78.5),
    ('Roads',           35, 65.2),
    ('Electricity',     50, 82.1),
    ('Sanitation',      28, 59.8),
    ('Drainage',        18, 71.0);

-- -------------------------------------------------------
-- 2. Grievances (20)
--    • IDs 1-5   → Reopened
--    • IDs 6-8   → Pending Verification
--    • IDs 9-10  → Verifying (in-progress)
--    • IDs 11-20 → Verified Closed
--
--    GPS coordinates are based around Ahmedabad, Gujarat
-- -------------------------------------------------------
INSERT INTO grievances (department_id, citizen_name, citizen_phone, description, original_gps_lat, original_gps_long, status) VALUES
    -- Reopened (5)
    (1, 'Rajesh Patel',     '+919876543210', 'Water pipeline burst near Navrangpura Circle',                    23.02250, 72.57136, 'Reopened'),
    (2, 'Meena Sharma',     '+919812345678', 'Huge pothole on SG Highway causing accidents',                    23.03050, 72.58540, 'Reopened'),
    (3, 'Amit Desai',       '+919998887776', 'Frequent power cuts in Bopal area since 2 weeks',                 23.04100, 72.56320, 'Reopened'),
    (4, 'Priya Joshi',      '+919765432100', 'Garbage not collected from Society for 5 days',                   23.01500, 72.59100, 'Reopened'),
    (5, 'Suresh Mehta',     '+919654321098', 'Drainage overflow flooding the main road in Satellite',           23.05200, 72.55000, 'Reopened'),

    -- Pending Verification (3)
    (1, 'Kavita Singh',     '+919543210987', 'No water supply in Vastrapur for 3 days',                         23.02800, 72.58200, 'Pending Verification'),
    (2, 'Deepak Chauhan',   '+919432109876', 'Road divider broken near Paldi junction',                         23.03500, 72.57800, 'Pending Verification'),
    (3, 'Nisha Trivedi',    '+919321098765', 'Street lights not working on CG Road stretch',                    23.04500, 72.56700, 'Pending Verification'),

    -- Verifying (2)
    (4, 'Ramesh Yadav',     '+919210987654', 'Open garbage dump near school in Maninagar',                      23.01900, 72.59500, 'Verifying'),
    (5, 'Anita Bhatt',      '+919109876543', 'Blocked drain causing waterlogging in Thaltej',                   23.05800, 72.54500, 'Verifying'),

    -- Verified Closed (10)
    (1, 'Vikram Rathod',    '+919988776655', 'Water meter showing wrong reading in Ambawadi',                   23.02100, 72.57500, 'Verified Closed'),
    (2, 'Sonal Parikh',     '+919877665544', 'Speed breaker needed near Ashram Road school zone',               23.03200, 72.58100, 'Verified Closed'),
    (3, 'Hemant Pandey',    '+919766554433', 'Transformer sparking in Chandkheda locality',                     23.04300, 72.56500, 'Verified Closed'),
    (4, 'Geeta Iyer',       '+919655443322', 'Public toilet in Jamalpur needs maintenance',                     23.01700, 72.59300, 'Verified Closed'),
    (5, 'Manoj Thakor',     '+919544332211', 'Storm drain cover missing on Ashram Road',                        23.05500, 72.55300, 'Verified Closed'),
    (1, 'Pooja Acharya',    '+919433221100', 'Rusty water coming from taps in Memnagar',                        23.02600, 72.57900, 'Verified Closed'),
    (2, 'Kiran Solanki',    '+919322110099', 'Footpath broken near Helmet Circle',                              23.03800, 72.58700, 'Verified Closed'),
    (3, 'Bhavna Shah',      '+919211009988', 'Low voltage issue in Gota area apartment complex',                23.04700, 72.56100, 'Verified Closed'),
    (4, 'Dinesh Raval',     '+919100998877', 'Overflowing community dustbin near Kankaria Lake',                23.01300, 72.59800, 'Verified Closed'),
    (5, 'Farida Mansuri',   '+919009887766', 'Drainage pipe leak contaminating nearby borewell in Vastral',     23.06000, 72.54200, 'Verified Closed');

-- -------------------------------------------------------
-- 3. Evidence Logs
-- -------------------------------------------------------
INSERT INTO evidence_logs (grievance_id, field_officer_gps_lat, field_officer_gps_long, ivr_keypress, photo_url) VALUES
    -- === Reopened grievances (citizen NOT satisfied → ivr_keypress = 2) ===
    (1, 23.02260, 72.57140, 2, 'https://storage.lakshya.gov.in/evidence/g1_pipe_leak.jpg'),
    -- #2 — GPS MISMATCH (fraud) + citizen unsatisfied
    (2, 23.09000, 72.64000, 2, 'https://storage.lakshya.gov.in/evidence/g2_pothole.jpg'),
    (3, 23.04110, 72.56330, 2, 'https://storage.lakshya.gov.in/evidence/g3_transformer.jpg'),
    -- #4 — GPS MISMATCH (fraud) + citizen unsatisfied
    (4, 23.07500, 72.65000, 2, 'https://storage.lakshya.gov.in/evidence/g4_garbage.jpg'),
    (5, 23.05210, 72.55010, 2, 'https://storage.lakshya.gov.in/evidence/g5_drain.jpg'),

    -- === Verified Closed — legitimate (ivr_keypress = 1, GPS close) ===
    (11, 23.02105, 72.57510, 1, 'https://storage.lakshya.gov.in/evidence/g11_fixed.jpg'),
    (12, 23.03210, 72.58110, 1, 'https://storage.lakshya.gov.in/evidence/g12_fixed.jpg'),
    (13, 23.04310, 72.56510, 1, 'https://storage.lakshya.gov.in/evidence/g13_fixed.jpg'),
    (14, 23.01710, 72.59310, 1, 'https://storage.lakshya.gov.in/evidence/g14_fixed.jpg'),
    (15, 23.05510, 72.55310, 1, 'https://storage.lakshya.gov.in/evidence/g15_fixed.jpg'),
    (16, 23.02610, 72.57910, 1, 'https://storage.lakshya.gov.in/evidence/g16_fixed.jpg'),
    (17, 23.03810, 72.58710, 1, 'https://storage.lakshya.gov.in/evidence/g17_fixed.jpg'),
    (18, 23.04710, 72.56110, 1, 'https://storage.lakshya.gov.in/evidence/g18_fixed.jpg'),

    -- === Verified Closed — GPS MISMATCH (fraud suspect, but citizen said OK) ===
    (19, 23.08000, 72.66000, 1, 'https://storage.lakshya.gov.in/evidence/g19_suspicious.jpg'),
    (20, 23.12000, 72.60000, 1, 'https://storage.lakshya.gov.in/evidence/g20_suspicious.jpg'),

    -- === Verifying — partial evidence (IVR pending) ===
    (9,  23.01910, 72.59510, NULL, 'https://storage.lakshya.gov.in/evidence/g9_partial.jpg'),
    -- #10 — GPS MISMATCH on verifying grievance
    (10, 23.10000, 72.63000, NULL, 'https://storage.lakshya.gov.in/evidence/g10_fraud.jpg');
