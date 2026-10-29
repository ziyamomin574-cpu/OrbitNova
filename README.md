# Antikshra / CanSat

The application uses one integrated Express and Vite server. MySQL stores accounts, dashboard satellites, and telemetry. Redis is used by the authenticated high-throughput telemetry ingestion queue. Supabase synchronization is optional and disabled unless configured.

## Setup

1. Install Node.js 20 or newer and MySQL 8 or newer. Start MySQL.
2. Copy `.env.example` to `.env` and set `DB_USER` and `DB_PASSWORD` for a MySQL account allowed to create/use `login_system` and its tables. Set a private `TELEMETRY_FLEET_API_KEY`. Redis is required for `/api/v1/telemetry` ingestion; set `TELEMETRY_REDIS_URL` to a reachable Redis instance.
3. Install packages with `npm install`.
4. Apply or upgrade the MySQL schema with `npm run db:setup`.
5. Start the full application with `npm run dev` and open `http://localhost:3000`.

`npm run lint` runs the TypeScript check. `npm run build` creates the production frontend and server bundle; `npm start` serves that bundle with `NODE_ENV=production`.

The legacy `backend/server.js` is not a separate startup target. Do not run it alongside `server.ts`.
