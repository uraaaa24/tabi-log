export const schema = `
CREATE TABLE IF NOT EXISTS places (id TEXT PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS place_states (place_id TEXT PRIMARY KEY REFERENCES places(id), visited INTEGER NOT NULL CHECK(visited IN (0,1)));
CREATE TABLE IF NOT EXISTS visits (
 id TEXT PRIMARY KEY, place_id TEXT NOT NULL REFERENCES places(id),
 start_date TEXT NOT NULL, end_date TEXT NOT NULL CHECK(end_date >= start_date),
 diary TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, other_transport TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS visits_by_place ON visits(place_id, start_date DESC, created_at DESC, id DESC);
CREATE TABLE IF NOT EXISTS photos (
 id TEXT PRIMARY KEY, visit_id TEXT NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
 path TEXT NOT NULL UNIQUE, thumbnail TEXT NOT NULL UNIQUE, width REAL NOT NULL CHECK(width > 0), height REAL NOT NULL CHECK(height > 0),
 sort_order INTEGER NOT NULL, rotation REAL NOT NULL, size REAL NOT NULL, layout_version INTEGER NOT NULL DEFAULT 1,
 UNIQUE(visit_id, sort_order)
);
CREATE TABLE IF NOT EXISTS visit_transports (visit_id TEXT NOT NULL REFERENCES visits(id) ON DELETE CASCADE, code TEXT NOT NULL, PRIMARY KEY(visit_id,code));
CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
PRAGMA user_version = 1;
`
