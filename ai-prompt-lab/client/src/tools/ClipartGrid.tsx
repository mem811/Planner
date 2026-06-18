import { useState } from 'react';
import { Link } from 'react-router-dom';
import FilePicker from '../components/FilePicker';
import { canvasToBlob, downloadBlob, loadImage } from './imageUtils';

const CELL_SIZE = 400;
const GAP = 16;

export default function ClipartGrid() {
  const [files, setFiles] = useState<File[]>([]);
  const [columns, setColumns] = useState(3);
  const [background, setBackground] = useState<'transparent' | 'white'>('white');
  const [previewUrl, setPreviewUrl] = useState('');

  async function build() {
    if (files.length === 0) return;
    const rows = Math.ceil(files.length / columns);
    const canvas = document.createElement('canvas');
    canvas.width = columns * CELL_SIZE + (columns + 1) * GAP;
    canvas.height = rows * CELL_SIZE + (rows + 1) * GAP;
    const ctx = canvas.getContext('2d')!;

    if (background === 'white') {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const images = await Promise.all(files.map(loadImage));
    images.forEach((img, i) => {
      const col = i % columns;
      const row = Math.floor(i / columns);
      const cellX = GAP + col * (CELL_SIZE + GAP);
      const cellY = GAP + row * (CELL_SIZE + GAP);
      const scale = Math.min(CELL_SIZE / img.width, CELL_SIZE / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, cellX + (CELL_SIZE - w) / 2, cellY + (CELL_SIZE - h) / 2, w, h);
    });

    const blob = await canvasToBlob(canvas, 'image/png');
    setPreviewUrl(URL.createObjectURL(blob));
  }

  async function download() {
    const res = await fetch(previewUrl);
    downloadBlob(await res.blob(), 'clipart-grid.png');
  }

  return (
    <div>
      <Link to="/tools" className="text-sm text-brand hover:underline">
        ← All tools
      </Link>
      <h1 className="mt-2 text-3xl font-semibold text-ink">Clipart Grid</h1>
      <p className="mt-2 text-ink-soft">Arrange several images into one grid image, e.g. for a listing preview.</p>

      <div className="mt-6">
        <FilePicker multiple onFiles={(f) => setFiles((prev) => [...prev, ...f])} label={`${files.length} image(s) selected — click or drop more`} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          Columns
          <input
            type="number"
            min={1}
            max={8}
            value={columns}
            onChange={(e) => setColumns(Math.max(1, Number(e.target.value)))}
            className="w-16 rounded-lg border border-line px-2 py-1"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          Background
          <select
            value={background}
            onChange={(e) => setBackground(e.target.value as 'transparent' | 'white')}
            className="rounded-lg border border-line px-2 py-1"
          >
            <option value="white">White</option>
            <option value="transparent">Transparent</option>
          </select>
        </label>
        <button
          onClick={build}
          disabled={files.length === 0}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
        >
          Build grid
        </button>
      </div>

      {previewUrl && (
        <div className="mt-6">
          <img src={previewUrl} alt="Grid preview" className="max-w-full rounded-xl border border-line" />
          <button onClick={download} className="mt-3 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
            Download PNG
          </button>
        </div>
      )}
    </div>
  );
}
