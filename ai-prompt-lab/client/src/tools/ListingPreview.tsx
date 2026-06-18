import { useState } from 'react';
import { Link } from 'react-router-dom';
import FilePicker from '../components/FilePicker';

const SIZES = [
  { label: 'Full listing', px: 750 },
  { label: 'Grid thumbnail', px: 300 },
  { label: 'Search result', px: 170 },
  { label: 'Mobile thumbnail', px: 100 },
];

export default function ListingPreview() {
  const [url, setUrl] = useState('');

  return (
    <div>
      <Link to="/tools" className="text-sm text-brand hover:underline">
        ← All tools
      </Link>
      <h1 className="mt-2 text-3xl font-semibold text-ink">Listing Image Preview</h1>
      <p className="mt-2 text-ink-soft">Check how an image reads at common thumbnail sizes before you list it.</p>

      <div className="mt-6">
        <FilePicker onFiles={(f) => f[0] && setUrl(URL.createObjectURL(f[0]))} label="Choose an image" />
      </div>

      {url && (
        <div className="mt-6 flex flex-wrap items-end gap-6">
          {SIZES.map((s) => (
            <div key={s.label} className="text-center">
              <img
                src={url}
                alt={s.label}
                style={{ width: s.px, height: s.px }}
                className="rounded-lg border border-line bg-white object-contain"
              />
              <p className="mt-2 text-xs text-ink-soft">
                {s.label} · {s.px}px
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
