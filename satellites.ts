import { db } from './index.ts';

export interface DbSatelliteInput {
  id: number;
  satelliteId: string;
  collegeName: string;
  studentName?: string;
  principalName?: string;
  location: string;
  weatherCondition?: string;
  aqi?: number;
  temperature?: number;
  humidity?: number;
  pressure?: number;
  windSpeed?: number;
  batteryLevel?: number;
  rssi?: number;
  orbitAltitude?: number;
  lat: number;
  lng: number;
  isLiveStream?: boolean;
  lastPing?: string;
  url?: string;
  childWebsiteUrl?: string;
  googleMapsUrl?: string;
  appsScriptUrl?: string;
  sourceType?: string;
  isCustom?: boolean;
  studentPhoto?: string;
  campusPhoto?: string;
  principalPhoto?: string;
  teacherPhoto?: string;
  creatorUid?: string;
}

const satelliteColumns = `
  id, satellite_id AS satelliteId, college_name AS collegeName,
  student_name AS studentName, principal_name AS principalName,
  location, weather_condition AS weatherCondition, aqi, temperature,
  humidity, pressure, wind_speed AS windSpeed, battery_level AS batteryLevel,
  rssi, orbit_altitude AS orbitAltitude, lat, lng,
  is_live_stream AS isLiveStream, last_ping AS lastPing, url,
  child_website_url AS childWebsiteUrl, google_maps_url AS googleMapsUrl,
  apps_script_url AS appsScriptUrl, source_type AS sourceType,
  is_custom AS isCustom, student_photo AS studentPhoto,
  campus_photo AS campusPhoto, principal_photo AS principalPhoto,
  teacher_photo AS teacherPhoto, creator_uid AS creatorUid
`;

export async function getAllSatellitesFromDb() {
  const [rows] = await db.query(`SELECT ${satelliteColumns} FROM satellites ORDER BY id`);
  return rows as any[];
}

export async function upsertSatelliteInDb(sat: DbSatelliteInput) {
  const columns = [
    'id', 'satellite_id', 'satellite_name', 'college_name', 'student_name',
    'principal_name', 'location', 'weather_condition', 'aqi', 'temperature',
    'humidity', 'pressure', 'wind_speed', 'battery_level', 'rssi',
    'orbit_altitude', 'lat', 'lng', 'is_live_stream', 'last_ping', 'url',
    'child_website_url', 'google_maps_url', 'apps_script_url', 'source_type',
    'is_custom', 'student_photo', 'campus_photo', 'principal_photo',
    'teacher_photo', 'creator_uid', 'is_active',
  ];
  const values = [
    sat.id, sat.satelliteId, sat.satelliteId, sat.collegeName, sat.studentName ?? null,
    sat.principalName ?? null, sat.location, sat.weatherCondition ?? 'Active',
    sat.aqi ?? 35, sat.temperature ?? 26.5, sat.humidity ?? 55,
    sat.pressure ?? 948, sat.windSpeed ?? 10, sat.batteryLevel ?? 95,
    sat.rssi ?? -65, sat.orbitAltitude ?? 500, sat.lat, sat.lng,
    sat.isLiveStream ?? true, sat.lastPing ?? 'Telemetry Link Online',
    sat.url ?? null, sat.childWebsiteUrl ?? null, sat.googleMapsUrl ?? null,
    sat.appsScriptUrl ?? null, sat.sourceType ?? 'standard', sat.isCustom ?? true,
    sat.studentPhoto ?? null, sat.campusPhoto ?? null, sat.principalPhoto ?? null,
    sat.teacherPhoto ?? null, sat.creatorUid ?? null, true,
  ];
  const updates = columns.slice(2).map((column) => `${column} = VALUES(${column})`).join(', ');
  await db.execute(
    `INSERT INTO satellites (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')}) ON DUPLICATE KEY UPDATE ${updates}`,
    values,
  );
  const [rows] = await db.query(`SELECT ${satelliteColumns} FROM satellites WHERE satellite_id = ? LIMIT 1`, [sat.satelliteId]);
  return (rows as any[])[0];
}

export async function deleteSatelliteFromDb(satelliteId: string) {
  const [result] = await db.execute('DELETE FROM satellites WHERE satellite_id = ?', [satelliteId]);
  return result;
}

export async function insertTelemetryPacketInDb(packet: any) {
  try {
    const fields = [
      'packet_id', 'satellite_id', 'timestamp', 'epoch_ms', 'hardware_id',
      'temperature', 'pressure', 'altitude', 'aqi', 'humidity', 'wind_speed',
      'battery_voltage', 'battery_percent', 'rssi', 'accel_x', 'accel_y',
      'accel_z', 'gyro_x', 'gyro_y', 'gyro_z', 'pitch', 'roll', 'heading',
      'lat', 'lng', 'gps_fix', 'gps_status', 'gps_sats', 'hdop', 'saved_to_pen_drive',
    ];
    const values = [
      packet.packetId ?? null, packet.hardwareId || packet.satelliteId || 'CanSat-01',
      packet.timestamp || new Date().toISOString(), packet.epochMs || Date.now(),
      packet.hardwareId || 'CanSat-01', packet.temperature ?? null,
      packet.pressure ?? null, packet.altitude ?? null, packet.aqi ?? null,
      packet.humidity ?? null, packet.windSpeed ?? null, packet.batteryVoltage ?? null,
      packet.batteryPercent ?? null, packet.rssi ?? null, packet.accelX ?? null,
      packet.accelY ?? null, packet.accelZ ?? null, packet.gyroX ?? null,
      packet.gyroY ?? null, packet.gyroZ ?? null, packet.pitch ?? null,
      packet.roll ?? null, packet.heading ?? null, packet.lat ?? null,
      packet.lng ?? null, packet.gpsFix ?? true, packet.gpsStatus ?? null,
      packet.gpsSats ?? null, packet.hdop ?? null, packet.savedToPenDrive ?? true,
    ];
    const [result] = await db.execute(
      `INSERT INTO cansat_telemetry (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`,
      values,
    );
    return result;
  } catch (error) {
    console.error('MySQL telemetry insert failed:', error);
    return null;
  }
}

export async function getRecentTelemetryPacketsFromDb(satelliteId: string, limit = 60) {
  const safeLimit = Math.max(1, Math.min(500, Math.trunc(limit)));
  const [rows] = await db.execute(
    'SELECT * FROM cansat_telemetry WHERE satellite_id = ? ORDER BY id DESC LIMIT ?',
    [satelliteId, safeLimit],
  );
  return rows;
}
