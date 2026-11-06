// Saved recordings live in one SQLite file. PNGs are stored in it too, so a
// session stays whole if the file is copied or backed up.
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = path.join(__dirname, 'data');
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new DatabaseSync(path.join(DATA_DIR, 'eye-tracker.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    site_url TEXT NOT NULL DEFAULT '',
    started_at TEXT NOT NULL,
    saved_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    duration_ms INTEGER NOT NULL,
    tracked_ms INTEGER NOT NULL,
    accuracy_px INTEGER,
    heatmap_on INTEGER NOT NULL,
    regions_json TEXT NOT NULL,
    samples_json TEXT NOT NULL,
    page_scans_json TEXT NOT NULL DEFAULT '[]'
  );
  CREATE TABLE IF NOT EXISTS session_images (
    id INTEGER PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('overview', 'screen')),
    position INTEGER NOT NULL,
    gaze_ms INTEGER NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    png BLOB NOT NULL
  );
  CREATE INDEX IF NOT EXISTS session_images_session ON session_images(session_id);
`);

// Databases made before page scores existed.
if (!db.prepare('PRAGMA table_info(sessions)').all().some(({ name }) => name === 'page_scans_json')) {
  db.exec("ALTER TABLE sessions ADD COLUMN page_scans_json TEXT NOT NULL DEFAULT '[]'");
}

// Databases made before mouse, clicks and scrolling were recorded.
if (!db.prepare('PRAGMA table_info(sessions)').all().some(({ name }) => name === 'interactions_json')) {
  db.exec("ALTER TABLE sessions ADD COLUMN interactions_json TEXT NOT NULL DEFAULT '{}'");
}

class ValidationError extends Error {}

function requireCount(value, label) {
  if (!Number.isFinite(value) || value < 0) throw new ValidationError(`${label} is not valid.`);
  return Math.round(value);
}

function decodePng(base64) {
  const png = Buffer.from(String(base64), 'base64');
  if (!png.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
    throw new ValidationError('A heat map image is not a PNG.');
  }
  return png;
}

function saveSession(input) {
  const name = String(input.name || '').trim().slice(0, 200);
  if (!name) throw new ValidationError('A session needs a name.');
  if (!Array.isArray(input.images) || !Array.isArray(input.samples) || !Array.isArray(input.regions)) {
    throw new ValidationError('The session is missing its data.');
  }
  if (Number.isNaN(Date.parse(input.startedAt))) throw new ValidationError('The start time is not valid.');

  const session = [
    name,
    String(input.notes || ''),
    String(input.siteUrl || ''),
    input.startedAt,
    requireCount(input.durationMs, 'The duration'),
    requireCount(input.trackedMs, 'The tracked time'),
    input.accuracyPx === null ? null : requireCount(input.accuracyPx, 'The accuracy'),
    input.heatmapOn ? 1 : 0,
    JSON.stringify(input.regions),
    JSON.stringify(input.samples),
    JSON.stringify(Array.isArray(input.pageScans) ? input.pageScans : []),
    JSON.stringify(input.interactions && typeof input.interactions === 'object' ? input.interactions : {}),
  ];
  const images = input.images.map((image) => {
    if (image.kind !== 'overview' && image.kind !== 'screen') throw new ValidationError('Unknown image type.');
    return [
      image.kind,
      requireCount(image.position, 'The image position'),
      requireCount(image.gazeMs, 'The image gaze time'),
      requireCount(image.width, 'The image width'),
      requireCount(image.height, 'The image height'),
      decodePng(image.png),
    ];
  });

  db.exec('BEGIN');
  try {
    const { lastInsertRowid: id } = db.prepare(`
      INSERT INTO sessions (name, notes, site_url, started_at, duration_ms, tracked_ms, accuracy_px, heatmap_on, regions_json, samples_json, page_scans_json, interactions_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(...session);
    const insertImage = db.prepare(`
      INSERT INTO session_images (session_id, kind, position, gaze_ms, width, height, png)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const image of images) insertImage.run(id, ...image);
    db.exec('COMMIT');
    return Number(id);
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function listSessions() {
  const images = db.prepare(`
    SELECT id, session_id, kind, position, gaze_ms, width, height
    FROM session_images ORDER BY kind, position
  `).all();
  return db.prepare(`
    SELECT id, name, notes, site_url, started_at, saved_at, duration_ms, tracked_ms, accuracy_px, heatmap_on, regions_json, page_scans_json, interactions_json
    FROM sessions ORDER BY started_at DESC
  `).all().map(({ regions_json: regions, page_scans_json: pageScans, interactions_json: interactions, ...session }) => ({
    ...session,
    regions: JSON.parse(regions),
    page_scans: JSON.parse(pageScans),
    interactions: JSON.parse(interactions),
    images: images.filter((image) => image.session_id === session.id),
  }));
}

function deleteSession(id) {
  return db.prepare('DELETE FROM sessions WHERE id = ?').run(id).changes > 0;
}

function getImagePng(id) {
  const row = db.prepare('SELECT png FROM session_images WHERE id = ?').get(id);
  return row ? row.png : null;
}

module.exports = { ValidationError, saveSession, listSessions, deleteSession, getImagePng };
