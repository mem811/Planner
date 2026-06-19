import { Router } from 'express';
import { db } from '../db.js';

export const collectionsRouter = Router();

collectionsRouter.get('/collections', (req, res) => {
  const rows = db
    .prepare(
      `SELECT c.*, COUNT(p.id) AS prompt_count
       FROM collections c
       LEFT JOIN prompts p ON p.collection_id = c.id
       GROUP BY c.id
       ORDER BY c.created_at DESC`
    )
    .all();
  res.json(rows);
});

collectionsRouter.post('/collections', (req, res) => {
  const { name, description = '' } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'name is required' });
  }
  const result = db
    .prepare('INSERT INTO collections (name, description) VALUES (?, ?)')
    .run(name.trim(), description);
  const collection = db
    .prepare('SELECT * FROM collections WHERE id = ?')
    .get(result.lastInsertRowid);
  res.status(201).json(collection);
});

collectionsRouter.delete('/collections/:id', (req, res) => {
  db.prepare('DELETE FROM collections WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

collectionsRouter.get('/collections/:id/prompts', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM prompts WHERE collection_id = ? ORDER BY created_at DESC')
    .all(req.params.id);
  res.json(rows);
});

collectionsRouter.post('/collections/:id/prompts', (req, res) => {
  const { text, tags = '' } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'text is required' });
  }
  const result = db
    .prepare('INSERT INTO prompts (collection_id, text, tags) VALUES (?, ?, ?)')
    .run(req.params.id, text.trim(), tags);
  const prompt = db.prepare('SELECT * FROM prompts WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(prompt);
});

collectionsRouter.get('/prompts/favorites', (req, res) => {
  const rows = db
    .prepare(
      `SELECT p.*, c.name AS collection_name
       FROM prompts p
       JOIN collections c ON c.id = p.collection_id
       WHERE p.favorite = 1
       ORDER BY p.created_at DESC`
    )
    .all();
  res.json(rows);
});

collectionsRouter.patch('/prompts/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM prompts WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'not found' });

  const text = req.body.text ?? existing.text;
  const tags = req.body.tags ?? existing.tags;
  const favorite = req.body.favorite === undefined ? existing.favorite : req.body.favorite ? 1 : 0;

  db.prepare('UPDATE prompts SET text = ?, tags = ?, favorite = ? WHERE id = ?').run(
    text,
    tags,
    favorite,
    req.params.id
  );
  res.json(db.prepare('SELECT * FROM prompts WHERE id = ?').get(req.params.id));
});

collectionsRouter.delete('/prompts/:id', (req, res) => {
  db.prepare('DELETE FROM prompts WHERE id = ?').run(req.params.id);
  res.status(204).end();
});
