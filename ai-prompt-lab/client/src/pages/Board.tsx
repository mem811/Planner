import { useEffect, useState } from 'react';
import { api, type BoardItem } from '../api/client';

const COLUMNS: { status: BoardItem['status']; label: string }[] = [
  { status: 'idea', label: 'Idea' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'done', label: 'Done' },
];

export default function Board() {
  const [items, setItems] = useState<BoardItem[]>([]);
  const [title, setTitle] = useState('');
  const [promptText, setPromptText] = useState('');

  function refresh() {
    api.listBoard().then(setItems);
  }

  useEffect(refresh, []);

  async function addCard(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await api.createBoardItem({ title, prompt_text: promptText, status: 'idea' });
    setTitle('');
    setPromptText('');
    refresh();
  }

  async function moveCard(item: BoardItem, status: BoardItem['status']) {
    await api.updateBoardItem(item.id, { status });
    refresh();
  }

  async function removeCard(item: BoardItem) {
    await api.deleteBoardItem(item.id);
    refresh();
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold text-ink">Idea Board</h1>
      <p className="mt-2 text-ink-soft">Track prompt ideas from spark to finished.</p>

      <form onSubmit={addCard} className="mt-6 flex flex-wrap gap-3 rounded-xl border border-line bg-panel p-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Card title"
          className="flex-1 min-w-[160px] rounded-lg border border-line px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
        <input
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="Prompt text (optional)"
          className="flex-1 min-w-[200px] rounded-lg border border-line px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
        <button className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
          Add card
        </button>
      </form>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => (
          <div key={col.status} className="rounded-xl border border-line bg-panel/60 p-3">
            <h2 className="mb-3 px-1 text-sm font-semibold uppercase tracking-wide text-ink-soft">{col.label}</h2>
            <div className="flex flex-col gap-3">
              {items
                .filter((i) => i.status === col.status)
                .map((item) => (
                  <div key={item.id} className="rounded-lg border border-line bg-panel p-3 shadow-sm">
                    <p className="text-sm font-medium text-ink">{item.title}</p>
                    {item.prompt_text && <p className="mt-1 text-xs text-ink-soft">{item.prompt_text}</p>}
                    <div className="mt-2 flex items-center justify-between">
                      <select
                        value={item.status}
                        onChange={(e) => moveCard(item, e.target.value as BoardItem['status'])}
                        className="rounded border border-line px-1.5 py-1 text-xs"
                      >
                        {COLUMNS.map((c) => (
                          <option key={c.status} value={c.status}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <button onClick={() => removeCard(item)} className="text-xs text-ink-soft hover:text-red-600">
                        delete
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
