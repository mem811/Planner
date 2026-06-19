import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Collection } from '../api/client';

export default function Libraries() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  function refresh() {
    api.listCollections().then(setCollections).catch((e) => setError(e.message));
  }

  useEffect(refresh, []);

  async function createCollection(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await api.createCollection(name, description);
      setName('');
      setDescription('');
      refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function removeCollection(id: number) {
    if (!confirm('Delete this collection and all its prompts?')) return;
    await api.deleteCollection(id);
    refresh();
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold text-ink">Prompt Libraries</h1>
      <p className="mt-2 text-ink-soft">Group your prompts into collections by theme or style.</p>

      <form onSubmit={createCollection} className="mt-6 flex flex-wrap gap-3 rounded-xl border border-line bg-panel p-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Collection name"
          className="flex-1 min-w-[160px] rounded-lg border border-line px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="flex-1 min-w-[200px] rounded-lg border border-line px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
        <button className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
          Add collection
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {collections.map((c) => (
          <div key={c.id} className="rounded-xl border border-line bg-panel p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <Link to={`/libraries/${c.id}`} className="text-lg font-semibold text-ink hover:text-brand">
                {c.name}
              </Link>
              <button
                onClick={() => removeCollection(c.id)}
                className="text-xs text-ink-soft hover:text-red-600"
                aria-label={`Delete ${c.name}`}
              >
                Delete
              </button>
            </div>
            {c.description && <p className="mt-1 text-sm text-ink-soft">{c.description}</p>}
            <p className="mt-3 text-xs font-medium text-brand">{c.prompt_count} prompt{c.prompt_count === 1 ? '' : 's'}</p>
          </div>
        ))}
        {collections.length === 0 && <p className="text-sm text-ink-soft">No collections yet — add one above.</p>}
      </div>
    </div>
  );
}
