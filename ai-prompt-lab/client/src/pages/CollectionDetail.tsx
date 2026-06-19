import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, type Collection, type Prompt } from '../api/client';

export default function CollectionDetail() {
  const { id } = useParams();
  const collectionId = Number(id);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [text, setText] = useState('');
  const [tags, setTags] = useState('');

  function refresh() {
    api.listCollections().then((all) => setCollection(all.find((c) => c.id === collectionId) ?? null));
    api.listPrompts(collectionId).then(setPrompts);
  }

  useEffect(refresh, [collectionId]);

  async function addPrompt(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    await api.addPrompt(collectionId, text, tags);
    setText('');
    setTags('');
    refresh();
  }

  async function toggleFavorite(p: Prompt) {
    await api.updatePrompt(p.id, { favorite: p.favorite ? 0 : 1 });
    refresh();
  }

  async function removePrompt(p: Prompt) {
    await api.deletePrompt(p.id);
    refresh();
  }

  return (
    <div>
      <Link to="/libraries" className="text-sm text-brand hover:underline">
        ← All libraries
      </Link>
      <h1 className="mt-2 text-3xl font-semibold text-ink">{collection?.name ?? 'Loading…'}</h1>
      {collection?.description && <p className="mt-2 text-ink-soft">{collection.description}</p>}

      <form onSubmit={addPrompt} className="mt-6 flex flex-col gap-3 rounded-xl border border-line bg-panel p-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a prompt…"
          rows={3}
          className="rounded-lg border border-line px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
        <div className="flex gap-3">
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tags, comma, separated"
            className="flex-1 rounded-lg border border-line px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
          <button className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
            Add prompt
          </button>
        </div>
      </form>

      <ul className="mt-6 flex flex-col gap-3">
        {prompts.map((p) => (
          <li key={p.id} className="rounded-xl border border-line bg-panel p-4 shadow-sm">
            <p className="text-sm text-ink">{p.text}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-ink-soft">{p.tags}</span>
              <div className="flex gap-3 text-xs">
                <button
                  onClick={() => toggleFavorite(p)}
                  className={p.favorite ? 'text-amber-500' : 'text-ink-soft hover:text-amber-500'}
                >
                  {p.favorite ? '★ saved' : '☆ save'}
                </button>
                <button onClick={() => removePrompt(p)} className="text-ink-soft hover:text-red-600">
                  delete
                </button>
              </div>
            </div>
          </li>
        ))}
        {prompts.length === 0 && <p className="text-sm text-ink-soft">No prompts in this collection yet.</p>}
      </ul>
    </div>
  );
}
