import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import './db.js';
import { collectionsRouter } from './routes/collections.js';
import { boardRouter } from './routes/board.js';
import { botsRouter } from './routes/bots.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api', collectionsRouter);
app.use('/api', boardRouter);
app.use('/api', botsRouter);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, aiConfigured: Boolean(process.env.ANTHROPIC_API_KEY) });
});

app.listen(PORT, () => {
  console.log(`AI Prompt Lab server listening on http://localhost:${PORT}`);
});
