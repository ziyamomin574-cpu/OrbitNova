import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import mysql from 'mysql2/promise';

const schema = await readFile(new URL('../database/schema.sql', import.meta.url), 'utf8');
let connection;
try {
  connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });
  await connection.query(schema);

  const [studentColumn] = await connection.query("SHOW COLUMNS FROM students LIKE 'satellite_id'");
  if (studentColumn.length === 0) {
    await connection.query('ALTER TABLE students ADD COLUMN satellite_id VARCHAR(100) NULL');
  }

  const [studentIndex] = await connection.query("SHOW INDEX FROM students WHERE Key_name = 'idx_students_satellite_id'");
  if (studentIndex.length === 0) {
    await connection.query('CREATE INDEX idx_students_satellite_id ON students (satellite_id)');
  }

  const [sessionColumns] = await connection.query("SHOW COLUMNS FROM sessions LIKE 'user_type'");
  if (sessionColumns.length && !String(sessionColumns[0].Type).includes('admin')) {
    await connection.query("ALTER TABLE sessions MODIFY COLUMN user_type ENUM('admin', 'school', 'student') NOT NULL");
  }

  const satelliteColumnDefinitions = {
    is_active: 'BOOLEAN NOT NULL DEFAULT TRUE',
    last_seen_at: 'DATETIME NULL',
    college_name: 'VARCHAR(255) NULL',
    student_name: 'VARCHAR(255) NULL',
    principal_name: 'VARCHAR(255) NULL',
    location: 'VARCHAR(255) NULL',
    weather_condition: 'VARCHAR(100) NULL',
    aqi: 'INT NULL',
    temperature: 'DOUBLE NULL',
    humidity: 'DOUBLE NULL',
    pressure: 'DOUBLE NULL',
    wind_speed: 'DOUBLE NULL',
    battery_level: 'INT NULL',
    rssi: 'INT NULL',
    orbit_altitude: 'INT NULL',
    lat: 'DOUBLE NULL',
    lng: 'DOUBLE NULL',
    is_live_stream: 'BOOLEAN NOT NULL DEFAULT TRUE',
    last_ping: 'VARCHAR(255) NULL',
    url: 'TEXT NULL',
    child_website_url: 'TEXT NULL',
    google_maps_url: 'TEXT NULL',
    apps_script_url: 'TEXT NULL',
    source_type: 'VARCHAR(50) NULL',
    is_custom: 'BOOLEAN NOT NULL DEFAULT TRUE',
    student_photo: 'TEXT NULL',
    campus_photo: 'TEXT NULL',
    principal_photo: 'TEXT NULL',
    teacher_photo: 'TEXT NULL',
    creator_uid: 'VARCHAR(255) NULL',
  };
  for (const [column, definition] of Object.entries(satelliteColumnDefinitions)) {
    const [existing] = await connection.query(
      'SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
      ['satellites', column],
    );
    if (existing.length === 0) {
      await connection.query(`ALTER TABLE satellites ADD COLUMN ${column} ${definition}`);
    }
  }
  await connection.query('ALTER TABLE satellites MODIFY COLUMN student_id BIGINT UNSIGNED NULL');
  await connection.query('ALTER TABLE satellites MODIFY COLUMN node_id VARCHAR(50) NULL');

  console.log('MySQL schema applied and verified (admin, user, school, student, satellite, session and telemetry tables).');
} catch (error) {
  console.error(`MySQL schema setup failed: ${error.message}`);
  if (error.code === 'ER_ACCESS_DENIED_ERROR') {
    console.error('Set DB_USER and DB_PASSWORD in .env to a MySQL account allowed to create and alter login_system.');
  }
  process.exitCode = 1;
} finally {
  await connection?.end();
}
