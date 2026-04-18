-- ============================================================
-- Lakshya Grievance Redressal System — PostgreSQL Schema
-- ============================================================

-- 1. Create ENUM type for grievance status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'grievance_status') THEN
        CREATE TYPE grievance_status AS ENUM (
            'Pending Verification',
            'Verifying',
            'Verified Closed',
            'Reopened'
        );
    END IF;
END
$$;

-- 2. Departments
CREATE TABLE IF NOT EXISTS departments (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,
    total_claimed_resolved INTEGER NOT NULL DEFAULT 0,
    quality_score   FLOAT NOT NULL DEFAULT 0.0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Grievances
CREATE TABLE IF NOT EXISTS grievances (
    id              SERIAL PRIMARY KEY,
    department_id   INTEGER NOT NULL
                        REFERENCES departments(id) ON DELETE CASCADE,
    citizen_name    VARCHAR(150) NOT NULL DEFAULT 'Anonymous',
    citizen_phone   VARCHAR(15) NOT NULL,
    description     TEXT NOT NULL DEFAULT '',
    original_gps_lat  DOUBLE PRECISION NOT NULL,
    original_gps_long DOUBLE PRECISION NOT NULL,
    status          grievance_status NOT NULL DEFAULT 'Pending Verification',
    ivr_call_sid    VARCHAR(50),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Evidence Logs
CREATE TABLE IF NOT EXISTS evidence_logs (
    id                    SERIAL PRIMARY KEY,
    grievance_id          INTEGER NOT NULL
                              REFERENCES grievances(id) ON DELETE CASCADE,
    field_officer_gps_lat  DOUBLE PRECISION,
    field_officer_gps_long DOUBLE PRECISION,
    ivr_keypress          INTEGER CHECK (ivr_keypress IN (1, 2)),
                              -- 1 = satisfied, 2 = not satisfied
    photo_url             TEXT,
    recorded_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_grievances_department
    ON grievances(department_id);

CREATE INDEX IF NOT EXISTS idx_grievances_status
    ON grievances(status);

CREATE INDEX IF NOT EXISTS idx_evidence_grievance
    ON evidence_logs(grievance_id);

CREATE INDEX IF NOT EXISTS idx_evidence_ivr_keypress
    ON evidence_logs(ivr_keypress);

CREATE INDEX IF NOT EXISTS idx_grievances_citizen_phone
    ON grievances(citizen_phone);

-- ============================================================
-- Migration helper: If ENUM already exists without 'Verifying'
-- ============================================================
-- ALTER TYPE grievance_status ADD VALUE IF NOT EXISTS 'Verifying' AFTER 'Pending Verification';
