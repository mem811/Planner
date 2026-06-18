export interface Collection {
  id: number;
  name: string;
  description: string;
  created_at: string;
  prompt_count: number;
}

export interface Prompt {
  id: number;
  collection_id: number;
  text: string;
  tags: string;
  favorite: 0 | 1;
  created_at: string;
  collection_name?: string;
}

export interface BoardItem {
  id: number;
  title: string;
  prompt_text: string;
  status: 'idea' | 'in_progress' | 'done';
  created_at: string;
  updated_at: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  health: () => request<{ ok: boolean; aiConfigured: boolean }>('/health'),

  listCollections: () => request<Collection[]>('/collections'),
  createCollection: (name: string, description = '') =>
    request<Collection>('/collections', { method: 'POST', body: JSON.stringify({ name, description }) }),
  deleteCollection: (id: number) => request<void>(`/collections/${id}`, { method: 'DELETE' }),

  listPrompts: (collectionId: number) => request<Prompt[]>(`/collections/${collectionId}/prompts`),
  addPrompt: (collectionId: number, text: string, tags = '') =>
    request<Prompt>(`/collections/${collectionId}/prompts`, {
      method: 'POST',
      body: JSON.stringify({ text, tags }),
    }),
  updatePrompt: (id: number, data: Partial<Pick<Prompt, 'text' | 'tags' | 'favorite'>>) =>
    request<Prompt>(`/prompts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePrompt: (id: number) => request<void>(`/prompts/${id}`, { method: 'DELETE' }),
  listFavorites: () => request<Prompt[]>('/prompts/favorites'),

  listBoard: () => request<BoardItem[]>('/board'),
  createBoardItem: (data: Pick<BoardItem, 'title' | 'prompt_text' | 'status'>) =>
    request<BoardItem>('/board', { method: 'POST', body: JSON.stringify(data) }),
  updateBoardItem: (id: number, data: Partial<Pick<BoardItem, 'title' | 'prompt_text' | 'status'>>) =>
    request<BoardItem>(`/board/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteBoardItem: (id: number) => request<void>(`/board/${id}`, { method: 'DELETE' }),

  generateFromBot: (bot: 'brainstorm' | 'lettering' | 'generic', input: string) =>
    request<{ results: string[] }>('/bots/generate', {
      method: 'POST',
      body: JSON.stringify({ bot, input }),
    }),
};
