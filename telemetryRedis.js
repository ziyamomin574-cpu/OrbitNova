const { createClient } = require("redis");

require("dotenv").config();

let telemetryRedis;

try {
    telemetryRedis = createClient({
        url: process.env.TELEMETRY_REDIS_URL || "redis://localhost:6379",
        socket: {
            connectTimeout: 2000,
            reconnectStrategy: (retries) => {
                if (retries > 2) return false; // don't block indefinitely if offline
                return 1000;
            },
        },
    });

    telemetryRedis.on("error", (error) => {
        // Suppress repeated connection timeout logs in dev/offline mode
    });
} catch (err) {
    console.warn("Telemetry Redis init warning:", err.message);
}

module.exports = telemetryRedis;
