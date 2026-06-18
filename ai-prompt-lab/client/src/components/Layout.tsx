import { NavLink, Outlet } from 'react-router-dom';

const NAV_GROUPS = [
  {
    label: 'Create',
    items: [
      { to: '/', label: 'Dashboard', icon: '◆' },
      { to: '/libraries', label: 'Prompt Libraries', icon: '◇' },
      { to: '/bots', label: 'Bots', icon: '✦' },
      { to: '/keys', label: 'Key Prompts', icon: '★' },
      { to: '/board', label: 'Idea Board', icon: '▤' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { to: '/tools', label: 'All Tools', icon: '▣' },
    ],
  },
];

function linkClasses(isActive: boolean) {
  return [
    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-brand text-white shadow-sm'
      : 'text-ink-soft hover:bg-brand-soft hover:text-brand-dark',
  ].join(' ');
}

export default function Layout() {
  return (
    <div className="flex min-h-screen w-full">
      <aside className="flex w-64 flex-col border-r border-line bg-panel px-4 py-6">
        <div className="mb-8 px-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand">Prompt Forge</p>
          <p className="mt-1 text-sm text-ink-soft">your personal AI prompt studio</p>
        </div>
        <nav className="flex flex-1 flex-col gap-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-ink-soft/70">
                {group.label}
              </p>
              <div className="flex flex-col gap-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) => linkClasses(isActive)}
                  >
                    <span aria-hidden>{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <p className="px-3 text-xs text-ink-soft/60">Made for one person: you.</p>
      </aside>
      <main className="flex-1 overflow-y-auto bg-paper">
        <div className="mx-auto max-w-5xl px-8 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
