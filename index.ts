// Share the same MySQL pool with the authentication and telemetry services.
import pool from '../../backend/database.js';

export const db = pool;
