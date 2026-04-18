-- ============================================================
-- Dashboard Queries for District Collector
-- ============================================================


-- 1. Total grievances per department (with department name)
-- ---------------------------------------------------------
SELECT
    d.name                          AS department,
    COUNT(g.id)                     AS total_grievances
FROM departments d
LEFT JOIN grievances g ON g.department_id = d.id
GROUP BY d.name
ORDER BY total_grievances DESC;


-- 2. Reopen rate per department
--    (reopened / total × 100, as a percentage)
-- ---------------------------------------------------------
SELECT
    d.name                          AS department,
    COUNT(g.id)                     AS total_grievances,
    COUNT(g.id) FILTER (WHERE g.status = 'Reopened')
                                    AS reopened_count,
    ROUND(
        COUNT(g.id) FILTER (WHERE g.status = 'Reopened') * 100.0
        / NULLIF(COUNT(g.id), 0),
        2
    )                               AS reopen_rate_pct
FROM departments d
LEFT JOIN grievances g ON g.department_id = d.id
GROUP BY d.name
ORDER BY reopen_rate_pct DESC;


-- 3. Average quality score across all departments
-- ---------------------------------------------------------
SELECT
    ROUND(AVG(quality_score)::numeric, 2) AS avg_quality_score
FROM departments;


-- 4. Count of failed IVR verifications (ivr_keypress = 2)
--    per department
-- ---------------------------------------------------------
SELECT
    d.name                          AS department,
    COUNT(e.id)                     AS failed_ivr_count
FROM departments d
JOIN grievances g     ON g.department_id = d.id
JOIN evidence_logs e  ON e.grievance_id  = g.id
WHERE e.ivr_keypress = 2
GROUP BY d.name
ORDER BY failed_ivr_count DESC;


-- 5. (BONUS) Potential fraud detection — GPS mismatch > 0.05°
--    Shows grievances where field officer GPS is far from
--    the original complaint GPS.
-- ---------------------------------------------------------
SELECT
    g.id                            AS grievance_id,
    d.name                          AS department,
    g.original_gps_lat,
    g.original_gps_long,
    e.field_officer_gps_lat,
    e.field_officer_gps_long,
    ROUND(
        (ABS(g.original_gps_lat  - e.field_officer_gps_lat)
       + ABS(g.original_gps_long - e.field_officer_gps_long))::numeric,
        5
    )                               AS gps_offset_degrees,
    CASE WHEN e.ivr_keypress = 2 THEN 'Citizen Unsatisfied'
         ELSE 'Citizen Satisfied'
    END                             AS citizen_feedback
FROM grievances g
JOIN evidence_logs e ON e.grievance_id = g.id
JOIN departments d   ON d.id = g.department_id
WHERE ABS(g.original_gps_lat  - e.field_officer_gps_lat)  > 0.05
   OR ABS(g.original_gps_long - e.field_officer_gps_long) > 0.05
ORDER BY gps_offset_degrees DESC;
