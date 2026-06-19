import { Link } from 'react-router-dom';

const TOOLS = [
  { to: '/tools/clipart-grid', title: 'Clipart Grid', desc: 'Arrange several images into one grid image.' },
  { to: '/tools/bulk-rename', title: 'Bulk Rename', desc: 'Rename a batch of files and download as a zip.' },
  { to: '/tools/dpi-converter', title: '300 DPI Converter', desc: 'Stamp print-ready DPI metadata without touching pixels.' },
  { to: '/tools/trim-resize', title: 'Bulk Trim & Resize', desc: 'Trim transparent padding and export on a clean canvas.' },
  { to: '/tools/listing-preview', title: 'Listing Image Preview', desc: 'See how an image looks at common thumbnail sizes.' },
  { to: '/tools/pattern-checker', title: 'Pattern Checker', desc: 'Tile an image in a grid to check seamless patterns.' },
];

export default function ToolsIndex() {
  return (
    <div>
      <h1 className="text-3xl font-semibold text-ink">Tools</h1>
      <p className="mt-2 text-ink-soft">Small image utilities that run entirely in your browser.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {TOOLS.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="rounded-xl border border-line bg-panel p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-ink">{t.title}</h2>
            <p className="mt-1 text-sm text-ink-soft">{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
