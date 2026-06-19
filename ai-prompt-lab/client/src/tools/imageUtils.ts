export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/png', quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))), type, quality);
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Bounding box of non-transparent pixels (alpha > threshold). Returns null if image is fully transparent. */
export function findOpaqueBounds(ctx: CanvasRenderingContext2D, width: number, height: number, alphaThreshold = 8) {
  const { data } = ctx.getImageData(0, 0, width, height);
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > alphaThreshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) return null;
  return { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

/**
 * Sets the DPI metadata on a canvas-exported PNG or JPEG blob, in place, without
 * touching pixel data. PNG uses the pHYs chunk; JPEG uses the JFIF APP0 density fields.
 */
export async function setImageDpi(blob: Blob, dpi: number): Promise<Blob> {
  const buf = new Uint8Array(await blob.arrayBuffer());
  if (blob.type === 'image/png') return new Blob([setPngDpi(buf, dpi) as BlobPart], { type: 'image/png' });
  if (blob.type === 'image/jpeg') return new Blob([setJpegDpi(buf, dpi) as BlobPart], { type: 'image/jpeg' });
  return blob;
}

function crc32(bytes: Uint8Array): number {
  let crc = ~0;
  for (const byte of bytes) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return ~crc >>> 0;
}

function setPngDpi(png: Uint8Array, dpi: number): Uint8Array {
  const pixelsPerMeter = Math.round(dpi / 0.0254);
  const chunkData = new Uint8Array(9);
  const view = new DataView(chunkData.buffer);
  view.setUint32(0, pixelsPerMeter);
  view.setUint32(4, pixelsPerMeter);
  chunkData[8] = 1; // unit: meters

  const typeAndData = new Uint8Array(4 + chunkData.length);
  typeAndData.set([0x70, 0x48, 0x59, 0x73]); // "pHYs"
  typeAndData.set(chunkData, 4);

  const lengthBytes = new Uint8Array(4);
  new DataView(lengthBytes.buffer).setUint32(0, chunkData.length);
  const crcBytes = new Uint8Array(4);
  new DataView(crcBytes.buffer).setUint32(0, crc32(typeAndData));

  const newChunk = new Uint8Array([...lengthBytes, ...typeAndData, ...crcBytes]);

  // Insert right after IHDR (8-byte signature + 4-len + 4-type + 13-data + 4-crc = 33 bytes)
  const insertAt = 8 + 4 + 4 + 13 + 4;
  // Strip any existing pHYs chunk first by scanning chunks before IDAT.
  const withoutExisting = stripPngChunk(png, 'pHYs');
  const out = new Uint8Array(withoutExisting.length + newChunk.length);
  out.set(withoutExisting.subarray(0, insertAt), 0);
  out.set(newChunk, insertAt);
  out.set(withoutExisting.subarray(insertAt), insertAt + newChunk.length);
  return out;
}

function stripPngChunk(png: Uint8Array, type: string): Uint8Array {
  const typeBytes = [...type].map((c) => c.charCodeAt(0));
  let offset = 8;
  const chunks: { start: number; end: number }[] = [];
  while (offset < png.length) {
    const len = new DataView(png.buffer, png.byteOffset + offset, 4).getUint32(0);
    const chunkType = png.subarray(offset + 4, offset + 8);
    const total = 4 + 4 + len + 4;
    if (typeBytes.every((b, i) => chunkType[i] === b)) {
      chunks.push({ start: offset, end: offset + total });
    }
    offset += total;
  }
  if (chunks.length === 0) return png;
  const out = new Uint8Array(png.length - chunks.reduce((s, c) => s + (c.end - c.start), 0));
  let writeOffset = 0;
  let readOffset = 0;
  for (const c of chunks) {
    out.set(png.subarray(readOffset, c.start), writeOffset);
    writeOffset += c.start - readOffset;
    readOffset = c.end;
  }
  out.set(png.subarray(readOffset), writeOffset);
  return out;
}

function setJpegDpi(jpeg: Uint8Array, dpi: number): Uint8Array {
  // Look for APP0 (FFE0) "JFIF" marker right after the SOI (FFD8).
  if (jpeg[0] === 0xff && jpeg[1] === 0xd8 && jpeg[2] === 0xff && jpeg[3] === 0xe0) {
    const out = jpeg.slice();
    out[13] = 1; // units: 1 = dots per inch
    out[14] = (dpi >> 8) & 0xff;
    out[15] = dpi & 0xff;
    out[16] = (dpi >> 8) & 0xff;
    out[17] = dpi & 0xff;
    return out;
  }
  return jpeg;
}
