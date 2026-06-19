import { Link } from 'react-router-dom';

const TILES = [
  {
    to: '/libraries',
    title: 'Prompt Libraries',
    desc: 'Organize prompts into collections you build over time.',
  },
  {
    to: '/bots',
    title: 'Bots',
    desc: 'Brainstorm collection ideas, lettering styles, or general prompts on demand.',
  },
  {
    to: '/keys',
    title: 'Key Prompts',
    desc: 'Your starred, go-to prompts in one place.',
  },
  {
    to: '/board',
    title: 'Idea Board',
    desc: 'Track prompt ideas from spark to finished.',
  },
  {
    to: '/tools',
    title: 'Tools',
    desc: 'Grid builder, bulk rename, DPI converter, trim & resize, and more.',
  },
];

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-semibold text-ink">Welcome back</h1>
      <p className="mt-2 text-ink-soft">Pick a tool below and keep building your prompt library.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {TILES.map((tile) => (
          <Link
            key={tile.to}
            to={tile.to}
            className="rounded-xl border border-line bg-panel p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-ink">{tile.title}</h2>
            <p className="mt-1 text-sm text-ink-soft">{tile.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
