import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';

export const botsRouter = Router();

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

const client = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const SYSTEM_PROMPTS = {
  brainstorm:
    'You are a creative partner who brainstorms themes and collection ideas for AI-generated image art ' +
    '(clipart, illustrations, patterns). Given a topic, return a numbered list of 6 distinct collection ' +
    'concepts. Each item: a short title, then a one-sentence description of the visual style and subject matter. ' +
    'No preamble, no closing remarks, just the numbered list.',
  lettering:
    'You are a specialist in decorative lettering and typography prompts for AI image generators. Given a theme, ' +
    'return a numbered list of 6 ready-to-use image-generation prompts for decorative alphabet letters or ' +
    'lettering sets in that theme. Each prompt should describe style, materials/texture, and composition so it ' +
    'can be pasted directly into an image model. No preamble, no closing remarks, just the numbered list.',
  generic:
    'You are an expert prompt engineer for AI image generation. Given a topic, return a numbered list of 6 ' +
    'varied, ready-to-use image-generation prompts exploring that topic from different angles (style, medium, ' +
    'composition, mood). Each prompt should be a single self-contained sentence or two. No preamble, no closing ' +
    'remarks, just the numbered list.',
};

function parseNumberedList(text) {
  return text
    .split('\n')
    .map((line) => line.replace(/^\s*\d+[.)]\s*/, '').trim())
    .filter(Boolean);
}

botsRouter.post('/bots/generate', async (req, res) => {
  if (!client) {
    return res.status(503).json({
      error: 'ANTHROPIC_API_KEY is not configured on the server. Add it to server/.env to enable bots.',
    });
  }

  const { bot, input } = req.body;
  const systemPrompt = SYSTEM_PROMPTS[bot];
  if (!systemPrompt) {
    return res.status(400).json({ error: `unknown bot "${bot}"` });
  }
  if (!input || !input.trim()) {
    return res.status(400).json({ error: 'input is required' });
  }

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: input.trim() }],
    });
    const text = message.content.map((block) => (block.type === 'text' ? block.text : '')).join('');
    res.json({ results: parseNumberedList(text) });
  } catch (err) {
    console.error('Anthropic request failed:', err.message);
    res.status(502).json({ error: 'AI generation failed. Check the server logs and your API key.' });
  }
});
