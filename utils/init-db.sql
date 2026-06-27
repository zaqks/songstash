-- =====================================================
-- 1. WIPE EVERYTHING
-- =====================================================

DROP TABLE IF EXISTS song_requests CASCADE;


-- =====================================================
-- 2. CREATE TABLE
-- =====================================================

CREATE TABLE song_requests (
    id SERIAL PRIMARY KEY,
    song_title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    queue_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE song_requests ENABLE ROW LEVEL SECURITY;


-- =====================================================
-- 4. ANONYMOUS USERS (INSERT ONLY)
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
-- 5. ADMIN (FULL ACCESS VIA SESSION VARIABLE)
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