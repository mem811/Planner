import { useState } from 'react';
import { Link } from 'react-router-dom';
import JSZip from 'jszip';
import FilePicker from '../components/FilePicker';
import { downloadBlob, setImageDpi } from './imageUtils';

export default function DpiConverter() {
  const [files, setFiles] = useState<File[]>([]);
  const [dpi, setDpi] = useState(300);
  const [working, setWorking] = useState(false);

  async function processAndDownload() {
    setWorking(true);
    try {
      if (files.length === 1) {
        const file = files[0];
        const out = await setImageDpi(file, dpi);
        downloadBlob(out, file.name);
      } else {
        const zip = new JSZip();
        for (const file of files) {
          zip.file(file.name, await setImageDpi(file, dpi));
        }
        downloadBlob(await zip.generateAsync({ type: 'blob' }), `${dpi}dpi-images.zip`);
      }
    } finally {
      setWorking(false);
    }
  }

  return (
    <div>
      <Link to="/tools" className="text-sm text-brand hover:underline">
        ← All tools
      </Link>
      <h1 className="mt-2 text-3xl font-semibold text-ink">300 DPI Converter</h1>
      <p className="mt-2 text-ink-soft">
        Stamps DPI metadata onto JPEG/PNG files so they're print-ready, without re-encoding or changing the artwork.
      </p>

      <div className="mt-6">
        <FilePicker
          multiple
          accept="image/png,image/jpeg"
          onFiles={(f) => setFiles((prev) => [...prev, ...f])}
          label={`${files.length} image(s) selected — click or drop more`}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          Target DPI
          <input
            type="number"
            min={72}
            max={1200}
            value={dpi}
            onChange={(e) => setDpi(Number(e.target.value))}
            className="w-24 rounded-lg border border-line px-2 py-1"
          />
        </label>
        <button
          onClick={processAndDownload}
          disabled={files.length === 0 || working}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
        >
          {working ? 'Processing…' : files.length > 1 ? 'Download zip' : 'Download'}
        </button>
      </div>

      <p className="mt-4 text-xs text-ink-soft">Only PNG and JPEG files are supported (PNG uses the pHYs chunk, JPEG uses the JFIF density fields).</p>
    </div>
  );
}
