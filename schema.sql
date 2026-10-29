CREATE DATABASE IF NOT EXISTS login_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE login_system;

-- =========================================================
-- SCHOOLS
-- =========================================================

CREATE TABLE IF NOT EXISTS admins (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_admins_username (username)
);

CREATE TABLE IF NOT EXISTS schools (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    school_name VARCHAR(150) NOT NULL,

    email VARCHAR(255) NOT NULL,

    phone VARCHAR(20) NOT NULL,

    password_hash VARCHAR(255) NOT NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_schools_email (email)
);

CREATE TABLE IF NOT EXISTS app_users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    uid VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NULL,
    photo_url TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_app_users_uid (uid),
    KEY idx_app_users_email (email)
);


-- =========================================================
-- STUDENTS
-- =========================================================

CREATE TABLE IF NOT EXISTS students (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    school_id BIGINT UNSIGNED NOT NULL,

    student_name VARCHAR(150) NOT NULL,

    username VARCHAR(100) NOT NULL,

    password_hash VARCHAR(255) NOT NULL,

    satellite_id VARCHAR(100) NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_students_username (username),

    KEY idx_students_school_id (school_id),
    KEY idx_students_satellite_id (satellite_id),

    CONSTRAINT fk_students_school
        FOREIGN KEY (school_id)
        REFERENCES schools(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- =========================================================
-- SCHOOL MFA / TOTP
-- =========================================================

CREATE TABLE IF NOT EXISTS school_mfa (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    school_id BIGINT UNSIGNED NOT NULL,

    secret_encrypted TEXT NOT NULL,

    is_enabled BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_school_mfa_school (school_id),

    CONSTRAINT fk_school_mfa_school
        FOREIGN KEY (school_id)
        REFERENCES schools(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- =========================================================
-- LOGIN SESSIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS sessions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    user_type ENUM('admin', 'school', 'student') NOT NULL,

    user_id BIGINT UNSIGNED NOT NULL,

    session_token_hash CHAR(64) NOT NULL,

    expires_at DATETIME NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_sessions_token (session_token_hash),

    KEY idx_sessions_user (user_type, user_id),

    KEY idx_sessions_expires (expires_at)
);


-- =========================================================
-- PASSWORD RESET TOKENS
-- =========================================================

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

    user_type ENUM('admin', 'school', 'student') NOT NULL,

    user_id BIGINT UNSIGNED NOT NULL,

    token_hash CHAR(64) NOT NULL,

    expires_at DATETIME NOT NULL,

    used_at DATETIME NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_password_reset_token (token_hash),

    KEY idx_password_reset_user (user_type, user_id),

    KEY idx_password_reset_expires (expires_at)
);

CREATE TABLE IF NOT EXISTS satellites (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    satellite_id VARCHAR(100) NOT NULL,
    node_id VARCHAR(50) NULL,
    satellite_name VARCHAR(150) NULL,
    student_id BIGINT UNSIGNED NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_seen_at DATETIME NULL,
    college_name VARCHAR(255) NULL,
    student_name VARCHAR(255) NULL,
    principal_name VARCHAR(255) NULL,
    location VARCHAR(255) NULL,
    weather_condition VARCHAR(100) NULL,
    aqi INT NULL,
    temperature DOUBLE NULL,
    humidity DOUBLE NULL,
    pressure DOUBLE NULL,
    wind_speed DOUBLE NULL,
    battery_level INT NULL,
    rssi INT NULL,
    orbit_altitude INT NULL,
    lat DOUBLE NULL,
    lng DOUBLE NULL,
    is_live_stream BOOLEAN NOT NULL DEFAULT TRUE,
    last_ping VARCHAR(255) NULL,
    url TEXT NULL,
    child_website_url TEXT NULL,
    google_maps_url TEXT NULL,
    apps_script_url TEXT NULL,
    source_type VARCHAR(50) NULL,
    is_custom BOOLEAN NOT NULL DEFAULT TRUE,
    student_photo TEXT NULL,
    campus_photo TEXT NULL,
    principal_photo TEXT NULL,
    teacher_photo TEXT NULL,
    creator_uid VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_satellite_id (satellite_id),
    UNIQUE KEY uq_node_id (node_id),
    KEY idx_satellite_active (is_active),

    CONSTRAINT fk_satellite_student
        FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS cansat_telemetry (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    packet_id BIGINT NULL,
    satellite_id VARCHAR(100) NOT NULL,
    timestamp VARCHAR(64) NOT NULL,
    epoch_ms BIGINT NULL,
    hardware_id VARCHAR(100) NULL,
    temperature DOUBLE NULL,
    pressure DOUBLE NULL,
    altitude DOUBLE NULL,
    aqi INT NULL,
    humidity DOUBLE NULL,
    wind_speed DOUBLE NULL,
    battery_voltage DOUBLE NULL,
    battery_percent INT NULL,
    rssi INT NULL,
    accel_x DOUBLE NULL,
    accel_y DOUBLE NULL,
    accel_z DOUBLE NULL,
    gyro_x DOUBLE NULL,
    gyro_y DOUBLE NULL,
    gyro_z DOUBLE NULL,
    pitch DOUBLE NULL,
    roll DOUBLE NULL,
    heading DOUBLE NULL,
    lat DOUBLE NULL,
    lng DOUBLE NULL,
    gps_fix BOOLEAN NULL,
    gps_status VARCHAR(50) NULL,
    gps_sats INT NULL,
    hdop DOUBLE NULL,
    saved_to_pen_drive BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_cansat_satellite_time (satellite_id, id)
);

CREATE TABLE IF NOT EXISTS telemetry_packets (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    satellite_id VARCHAR(100) NOT NULL,
    packet_hash CHAR(64) NOT NULL,
    schema_version INT NOT NULL,
    event_time DATETIME NOT NULL,
    received_at DATETIME NOT NULL,
    altitude_msl DOUBLE NULL,
    altitude_agl DOUBLE NULL,
    temperature DOUBLE NULL,
    humidity DOUBLE NULL,
    pitch DOUBLE NULL,
    roll DOUBLE NULL,
    acceleration DOUBLE NULL,
    wifi_rssi DOUBLE NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_telemetry_packet (satellite_id, packet_hash),
    INDEX idx_telemetry_satellite_time (satellite_id, event_time)
);
