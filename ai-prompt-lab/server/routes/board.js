import { Router } from 'express';
import { db } from '../db.js';

export const boardRouter = Router();

const STATUSES = new Set(['idea', 'in_progress', 'done']);

boardRouter.get('/board', (req, res) => {
  res.json(db.prepare('SELECT * FROM board_items ORDER BY updated_at DESC').all());
});

boardRouter.post('/board', (req, res) => {
  const { title, prompt_text = '', status = 'idea' } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }
  const result = db
    .prepare('INSERT INTO board_items (title, prompt_text, status) VALUES (?, ?, ?)')
    .run(title.trim(), prompt_text, STATUSES.has(status) ? status : 'idea');
  res.status(201).json(db.prepare('SELECT * FROM board_items WHERE id = ?').get(result.lastInsertRowid));
});

boardRouter.patch('/board/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM board_items WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'not found' });

  const title = req.body.title ?? existing.title;
  const prompt_text = req.body.prompt_text ?? existing.prompt_text;
  const status = STATUSES.has(req.body.status) ? req.body.status : existing.status;

  db.prepare(
    `UPDATE board_items SET title = ?, prompt_text = ?, status = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(title, prompt_text, status, req.params.id);
  res.json(db.prepare('SELECT * FROM board_items WHERE id = ?').get(req.params.id));
});

boardRouter.delete('/board/:id', (req, res) => {
  db.prepare('DELETE FROM board_items WHERE id = ?').run(req.params.id);
  res.status(204).end();
});
