USE login_system;

-- Idempotent upgrade for installations created from earlier schema versions.
DELIMITER $$
CREATE PROCEDURE align_antikshra_mysql_schema()
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'students'
          AND COLUMN_NAME = 'satellite_id'
    ) THEN
        ALTER TABLE students ADD COLUMN satellite_id VARCHAR(100) NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'students'
          AND INDEX_NAME = 'idx_students_satellite_id'
    ) THEN
        CREATE INDEX idx_students_satellite_id ON students (satellite_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'sessions'
          AND COLUMN_NAME = 'user_type'
          AND COLUMN_TYPE LIKE '%admin%'
    ) THEN
        ALTER TABLE sessions
            MODIFY COLUMN user_type ENUM('admin', 'school', 'student') NOT NULL;
    END IF;
END$$
DELIMITER ;

CALL align_antikshra_mysql_schema();
DROP PROCEDURE align_antikshra_mysql_schema;

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
