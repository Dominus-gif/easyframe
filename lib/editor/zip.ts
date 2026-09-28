// Minimal, dependency-free ZIP writer (store / no compression). Enough to bundle
// a handful of exported PNG/JPEG/WebP blobs into one download for batch and
// carousel export. Uses a streamed CRC-32 so large images don't blow the stack.

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

type Entry = { nameBytes: Uint8Array; data: Uint8Array; crc: number; offset: number };

/** Build a .zip Blob from named binary files (stored, uncompressed). */
export async function makeZip(files: { name: string; blob: Blob }[]): Promise<Blob> {
  const enc = new TextEncoder();
  const entries: Entry[] = [];
  const chunks: Uint8Array[] = [];
  let offset = 0;

  const push = (u: Uint8Array) => {
    chunks.push(u);
    offset += u.length;
  };

  // Local file headers + data.
  for (const f of files) {
    const data = new Uint8Array(await f.blob.arrayBuffer());
    const nameBytes = enc.encode(f.name);
    const crc = crc32(data);
    entries.push({ nameBytes, data, crc, offset });

    const h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true); // local file header signature
    h.setUint16(4, 20, true); // version needed
    h.setUint16(6, 0, true); // flags
    h.setUint16(8, 0, true); // method: store
    h.setUint16(10, 0, true); // mod time
    h.setUint16(12, 0, true); // mod date
    h.setUint32(14, crc, true);
    h.setUint32(18, data.length, true); // compressed size
    h.setUint32(22, data.length, true); // uncompressed size
    h.setUint16(26, nameBytes.length, true);
    h.setUint16(28, 0, true); // extra len
    push(new Uint8Array(h.buffer));
    push(nameBytes);
    push(data);
  }

  // Central directory.
  const cdStart = offset;
  for (const e of entries) {
    const h = new DataView(new ArrayBuffer(46));
    h.setUint32(0, 0x02014b50, true); // central dir signature
    h.setUint16(4, 20, true); // version made by
    h.setUint16(6, 20, true); // version needed
    h.setUint16(8, 0, true);
    h.setUint16(10, 0, true); // method: store
    h.setUint16(12, 0, true);
    h.setUint16(14, 0, true);
    h.setUint32(16, e.crc, true);
    h.setUint32(20, e.data.length, true);
    h.setUint32(24, e.data.length, true);
    h.setUint16(28, e.nameBytes.length, true);
    h.setUint16(30, 0, true); // extra len
    h.setUint16(32, 0, true); // comment len
    h.setUint16(34, 0, true); // disk number
    h.setUint16(36, 0, true); // internal attrs
    h.setUint32(38, 0, true); // external attrs
    h.setUint32(42, e.offset, true); // local header offset
    push(new Uint8Array(h.buffer));
    push(e.nameBytes);
  }
  const cdSize = offset - cdStart;

  // End of central directory.
  const eocd = new DataView(new ArrayBuffer(22));
  eocd.setUint32(0, 0x06054b50, true);
  eocd.setUint16(4, 0, true);
  eocd.setUint16(6, 0, true);
  eocd.setUint16(8, entries.length, true);
  eocd.setUint16(10, entries.length, true);
  eocd.setUint32(12, cdSize, true);
  eocd.setUint32(16, cdStart, true);
  eocd.setUint16(20, 0, true);
  push(new Uint8Array(eocd.buffer));

  return new Blob(chunks as BlobPart[], { type: "application/zip" });
}
