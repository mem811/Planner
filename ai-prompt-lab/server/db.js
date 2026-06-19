import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const db = new Database(path.join(__dirname, 'data.sqlite'));

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS prompts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    collection_id INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    tags TEXT DEFAULT '',
    favorite INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS board_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    prompt_text TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'idea',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const collectionCount = db.prepare('SELECT COUNT(*) AS n FROM collections').get().n;
if (collectionCount === 0) {
  const insertCollection = db.prepare(
    'INSERT INTO collections (name, description) VALUES (?, ?)'
  );
  const insertPrompt = db.prepare(
    'INSERT INTO prompts (collection_id, text, tags, favorite) VALUES (?, ?, ?, ?)'
  );

  const starter = insertCollection.run(
    'Starter Collection',
    'A few sample prompts to get you going.'
  );
  insertPrompt.run(
    starter.lastInsertRowid,
    'A cozy watercolor illustration of a fox reading a book under a lamp, soft pastel palette, transparent background',
    'watercolor, animal, cozy',
    1
  );
  insertPrompt.run(
    starter.lastInsertRowid,
    'Hand-drawn doodle alphabet letter A made of blooming flowers, thin black outline, no fill, clipart style',
    'alphabet, doodle, flowers',
    0
  );
}
