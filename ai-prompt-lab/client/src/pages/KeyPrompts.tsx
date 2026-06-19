import { useEffect, useState } from 'react';
import { api, type Prompt } from '../api/client';

export default function KeyPrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  function refresh() {
    api.listFavorites().then(setPrompts);
  }

  useEffect(refresh, []);

  async function unstar(p: Prompt) {
    await api.updatePrompt(p.id, { favorite: 0 });
    refresh();
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold text-ink">Key Prompts</h1>
      <p className="mt-2 text-ink-soft">Your starred prompts from every collection, in one place.</p>

      <ul className="mt-6 flex flex-col gap-3">
        {prompts.map((p) => (
          <li key={p.id} className="rounded-xl border border-line bg-panel p-4 shadow-sm">
            <p className="text-sm text-ink">{p.text}</p>
            <div className="mt-2 flex items-center justify-between text-xs text-ink-soft">
              <span>{p.collection_name}</span>
              <button onClick={() => unstar(p)} className="text-amber-500 hover:text-ink-soft">
                ★ unsave
              </button>
            </div>
          </li>
        ))}
        {prompts.length === 0 && <p className="text-sm text-ink-soft">Star a prompt in any library to see it here.</p>}
      </ul>
    </div>
  );
}
