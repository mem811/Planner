import { useState } from 'react';
import { Link } from 'react-router-dom';
import JSZip from 'jszip';
import FilePicker from '../components/FilePicker';
import { canvasToBlob, downloadBlob, findOpaqueBounds, loadImage } from './imageUtils';

export default function TrimResize() {
  const [files, setFiles] = useState<File[]>([]);
  const [canvasSize, setCanvasSize] = useState(2000);
  const [paddingPct, setPaddingPct] = useState(5);
  const [working, setWorking] = useState(false);

  async function processOne(file: File): Promise<Blob> {
    const img = await loadImage(file);
    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = img.width;
    srcCanvas.height = img.height;
    const srcCtx = srcCanvas.getContext('2d', { willReadFrequently: true })!;
    srcCtx.drawImage(img, 0, 0);

    const bounds = findOpaqueBounds(srcCtx, img.width, img.height);
    const cropX = bounds?.minX ?? 0;
    const cropY = bounds?.minY ?? 0;
    const cropW = bounds?.width ?? img.width;
    const cropH = bounds?.height ?? img.height;

    const padding = (canvasSize * paddingPct) / 100;
    const available = canvasSize - padding * 2;
    const scale = Math.min(available / cropW, available / cropH);
    const drawW = cropW * scale;
    const drawH = cropH * scale;

    const outCanvas = document.createElement('canvas');
    outCanvas.width = canvasSize;
    outCanvas.height = canvasSize;
    const outCtx = outCanvas.getContext('2d')!;
    outCtx.drawImage(
      srcCanvas,
      cropX,
      cropY,
      cropW,
      cropH,
      (canvasSize - drawW) / 2,
      (canvasSize - drawH) / 2,
      drawW,
      drawH
    );

    return canvasToBlob(outCanvas, 'image/png');
  }

  async function processAndDownload() {
    setWorking(true);
    try {
      if (files.length === 1) {
        downloadBlob(await processOne(files[0]), files[0].name.replace(/\.\w+$/, '') + '-trimmed.png');
      } else {
        const zip = new JSZip();
        for (const file of files) {
          zip.file(file.name.replace(/\.\w+$/, '') + '-trimmed.png', await processOne(file));
        }
        downloadBlob(await zip.generateAsync({ type: 'blob' }), 'trimmed-clipart.zip');
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
      <h1 className="mt-2 text-3xl font-semibold text-ink">Bulk Trim &amp; Resize</h1>
      <p className="mt-2 text-ink-soft">
        Trims empty transparent space, adds safe padding, and exports each image on a clean, consistent square canvas.
      </p>

      <div className="mt-6">
        <FilePicker
          multiple
          accept="image/png"
          onFiles={(f) => setFiles((prev) => [...prev, ...f])}
          label={`${files.length} image(s) selected — click or drop more`}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          Canvas size (px)
          <input
            type="number"
            min={200}
            value={canvasSize}
            onChange={(e) => setCanvasSize(Number(e.target.value))}
            className="w-24 rounded-lg border border-line px-2 py-1"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          Padding %
          <input
            type="number"
            min={0}
            max={40}
            value={paddingPct}
            onChange={(e) => setPaddingPct(Number(e.target.value))}
            className="w-20 rounded-lg border border-line px-2 py-1"
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

      <p className="mt-4 text-xs text-ink-soft">Works best with PNGs that have a transparent background.</p>
    </div>
  );
}
