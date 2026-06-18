import { useEffect, useState } from 'react';
import { api, type Collection } from '../api/client';

const BOTS = [
  {
    key: 'brainstorm' as const,
    title: 'Muse',
    blurb: 'Brainstorm new collection themes from a topic.',
    placeholder: 'e.g. cozy autumn cottages',
  },
  {
    key: 'lettering' as const,
    title: 'Lettering',
    blurb: 'Decorative alphabet & lettering prompt ideas.',
    placeholder: 'e.g. botanical line art',
  },
  {
    key: 'generic' as const,
    title: 'Prompt Generator',
    blurb: 'General-purpose prompt variations on any topic.',
    placeholder: 'e.g. underwater fantasy creatures',
  },
];

function BotPanel({ bot, collections, onSaved }: { bot: typeof BOTS[number]; collections: Collection[]; onSaved: () => void }) {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [targetCollection, setTargetCollection] = useState<number | ''>('');

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { results } = await api.generateFromBot(bot.key, input);
      setResults(results);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function saveResult(text: string) {
    if (!targetCollection) {
      setError('Pick a collection to save into first.');
      return;
    }
    await api.addPrompt(targetCollection, text);
    onSaved();
  }

  return (
    <div className="rounded-xl border border-line bg-panel p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-ink">{bot.title}</h2>
      <p className="mt-1 text-sm text-ink-soft">{bot.blurb}</p>

      <form onSubmit={generate} className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={bot.placeholder}
          className="flex-1 rounded-lg border border-line px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
        <button
          disabled={loading}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
        >
          {loading ? 'Thinking…' : 'Generate'}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {results.length > 0 && (
        <div className="mt-4">
          <select
            value={targetCollection}
            onChange={(e) => setTargetCollection(e.target.value ? Number(e.target.value) : '')}
            className="mb-3 rounded-lg border border-line px-2 py-1.5 text-sm"
          >
            <option value="">Save to collection…</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <ul className="flex flex-col gap-2">
            {results.map((r, i) => (
              <li key={i} className="flex items-start justify-between gap-3 rounded-lg bg-brand-soft p-3 text-sm text-ink">
                <span>{r}</span>
                <button onClick={() => saveResult(r)} className="shrink-0 text-xs font-medium text-brand hover:text-brand-dark">
                  save
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function Bots() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [aiConfigured, setAiConfigured] = useState(true);

  function refresh() {
    api.listCollections().then(setCollections);
  }

  useEffect(() => {
    refresh();
    api.health().then((h) => setAiConfigured(h.aiConfigured));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-semibold text-ink">Bots</h1>
      <p className="mt-2 text-ink-soft">Generate fresh prompt ideas, then save the ones you like to a library.</p>

      {!aiConfigured && (
        <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          No ANTHROPIC_API_KEY is configured on the server, so bots will fail to generate. Add one to
          <code className="mx-1 rounded bg-amber-100 px-1">server/.env</code> and restart the server.
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4">
        {BOTS.map((bot) => (
          <BotPanel key={bot.key} bot={bot} collections={collections} onSaved={refresh} />
        ))}
      </div>
    </div>
  );
}
