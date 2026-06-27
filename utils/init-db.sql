-- =====================================================
-- 1. WIPE EVERYTHING
-- =====================================================

DROP TABLE IF EXISTS song_requests CASCADE;
DROP TYPE IF EXISTS song_request_status;


-- =====================================================
-- 2. CREATE STATUS ENUM
-- =====================================================

CREATE TYPE song_request_status AS ENUM (
    'pending',
    'practicing',
    'released'
);


-- =====================================================
-- 3. CREATE TABLE
-- =====================================================

CREATE TABLE song_requests (
    id SERIAL PRIMARY KEY,
    song_title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    status song_request_status NOT NULL DEFAULT 'pending',
    queue_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE song_requests ENABLE ROW LEVEL SECURITY;


-- =====================================================
-- 5. TRIGGER: AUTO UPDATE last_modified_at ON UPDATE
-- =====================================================

CREATE OR REPLACE FUNCTION update_last_modified_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_last_modified_at
BEFORE UPDATE ON song_requests
FOR EACH ROW
EXECUTE FUNCTION update_last_modified_at();


-- =====================================================
-- 6. ANONYMOUS USERS (INSERT ONLY)
-- =====================================================

CREATE POLICY anon_insert_only
ON song_requests
FOR INSERT
TO PUBLIC
WITH CHECK (
    status = 'pending'
    AND queue_order = 0
);


-- =====================================================
-- 7. ADMIN (FULL ACCESS VIA SESSION VARIABLE)
-- =====================================================

CREATE POLICY admin_full_access
ON song_requests
FOR ALL
TO PUBLIC
USING (
    current_setting('app.role', true) = 'admin'
)
WITH CHECK (
    current_setting('app.role', true) = 'admin'
);