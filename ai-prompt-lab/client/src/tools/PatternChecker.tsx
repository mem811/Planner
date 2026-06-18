import { useState } from 'react';
import { Link } from 'react-router-dom';
import FilePicker from '../components/FilePicker';

export default function PatternChecker() {
  const [url, setUrl] = useState('');
  const [tiles, setTiles] = useState(4);

  return (
    <div>
      <Link to="/tools" className="text-sm text-brand hover:underline">
        ← All tools
      </Link>
      <h1 className="mt-2 text-3xl font-semibold text-ink">Pattern Checker</h1>
      <p className="mt-2 text-ink-soft">Tile an image in a grid so you can spot seams before listing a seamless pattern.</p>

      <div className="mt-6">
        <FilePicker onFiles={(f) => f[0] && setUrl(URL.createObjectURL(f[0]))} label="Choose a pattern image" />
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm text-ink-soft">
        Tiles per side
        <input
          type="number"
          min={2}
          max={10}
          value={tiles}
          onChange={(e) => setTiles(Number(e.target.value))}
          className="w-16 rounded-lg border border-line px-2 py-1"
        />
      </label>

      {url && (
        <div
          className="mt-6 grid w-fit overflow-hidden rounded-xl border border-line"
          style={{ gridTemplateColumns: `repeat(${tiles}, 1fr)` }}
        >
          {Array.from({ length: tiles * tiles }).map((_, i) => (
            <img key={i} src={url} alt="" className="block h-24 w-24 object-cover" />
          ))}
        </div>
      )}
    </div>
  );
}
