import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import JSZip from 'jszip';
import FilePicker from '../components/FilePicker';
import { downloadBlob } from './imageUtils';

function extOf(filename: string) {
  const i = filename.lastIndexOf('.');
  return i === -1 ? '' : filename.slice(i);
}

export default function BulkRename() {
  const [files, setFiles] = useState<File[]>([]);
  const [prefix, setPrefix] = useState('clipart');
  const [startAt, setStartAt] = useState(1);
  const [padding, setPadding] = useState(2);

  const renamed = useMemo(
    () =>
      files.map((file, i) => {
        const num = String(startAt + i).padStart(padding, '0');
        return `${prefix}-${num}${extOf(file.name)}`;
      }),
    [files, prefix, startAt, padding]
  );

  async function downloadZip() {
    const zip = new JSZip();
    files.forEach((file, i) => zip.file(renamed[i], file));
    downloadBlob(await zip.generateAsync({ type: 'blob' }), `${prefix}-renamed.zip`);
  }

  return (
    <div>
      <Link to="/tools" className="text-sm text-brand hover:underline">
        ← All tools
      </Link>
      <h1 className="mt-2 text-3xl font-semibold text-ink">Bulk Rename</h1>
      <p className="mt-2 text-ink-soft">Rename a batch of files with a consistent pattern and download as a zip.</p>

      <div className="mt-6">
        <FilePicker multiple accept="*" onFiles={(f) => setFiles((prev) => [...prev, ...f])} label={`${files.length} file(s) selected — click or drop more`} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          Prefix
          <input value={prefix} onChange={(e) => setPrefix(e.target.value)} className="w-32 rounded-lg border border-line px-2 py-1" />
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          Start at
          <input
            type="number"
            value={startAt}
            onChange={(e) => setStartAt(Number(e.target.value))}
            className="w-20 rounded-lg border border-line px-2 py-1"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          Digits
          <input
            type="number"
            min={1}
            max={6}
            value={padding}
            onChange={(e) => setPadding(Number(e.target.value))}
            className="w-16 rounded-lg border border-line px-2 py-1"
          />
        </label>
        <button
          onClick={downloadZip}
          disabled={files.length === 0}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
        >
          Download zip
        </button>
      </div>

      {files.length > 0 && (
        <ul className="mt-6 flex flex-col gap-1 rounded-xl border border-line bg-panel p-4 text-sm">
          {files.map((file, i) => (
            <li key={i} className="flex justify-between gap-4 text-ink-soft">
              <span className="truncate">{file.name}</span>
              <span className="font-medium text-ink">{renamed[i]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
