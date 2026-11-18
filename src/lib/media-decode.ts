export interface DecodedImageData {
  buffer: Buffer;
  mimeType: string;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Mengurai dimensi lebar & tinggi (piksel) dari header biner PNG, WebP, GIF, atau JPEG.
 */
function parseImageHeaderDimensions(
  buf: Buffer,
  mimeType: string
): ImageDimensions | null {
  try {
    // PNG: 8-byte signature + IHDR chunk (width @ 16, height @ 20)
    if (
      (mimeType === "image/png" ||
        (buf.length >= 24 && buf[0] === 0x89 && buf[1] === 0x50)) &&
      buf.length >= 24
    ) {
      const width = buf.readUInt32BE(16);
      const height = buf.readUInt32BE(20);
      if (width > 0 && height > 0) return { width, height };
    }

    // GIF: header 6 byte + 16-bit LE width @ 6, height @ 8
    if (
      (mimeType === "image/gif" ||
        (buf.length >= 10 && buf.toString("ascii", 0, 3) === "GIF")) &&
      buf.length >= 10
    ) {
      const width = buf.readUInt16LE(6);
      const height = buf.readUInt16LE(8);
      if (width > 0 && height > 0) return { width, height };
    }

    // WebP: RIFF....WEBP + VP8 / VP8L / VP8X
    if (
      buf.length >= 30 &&
      buf.toString("ascii", 0, 4) === "RIFF" &&
      buf.toString("ascii", 8, 12) === "WEBP"
    ) {
      const chunk = buf.toString("ascii", 12, 16);
      if (chunk === "VP8X") {
        const width = 1 + buf.readUIntLE(24, 3);
        const height = 1 + buf.readUIntLE(27, 3);
        if (width > 0 && height > 0) return { width, height };
      } else if (chunk === "VP8 " && buf.length >= 30) {
        const width = buf.readUInt16LE(26) & 0x3fff;
        const height = buf.readUInt16LE(28) & 0x3fff;
        if (width > 0 && height > 0) return { width, height };
      } else if (chunk === "VP8L" && buf.length >= 25) {
        const b0 = buf[21];
        const b1 = buf[22];
        const b2 = buf[23];
        const b3 = buf[24];
        const width = 1 + (((b1 & 0x3f) << 8) | b0);
        const height = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
        if (width > 0 && height > 0) return { width, height };
      }
    }

    // JPEG: cari SOF marker (0xC0..0xCF kecuali DHT/DAC/RST)
    if (buf.length >= 4 && buf[0] === 0xff && buf[1] === 0xd8) {
      let offset = 2;
      while (offset + 8 < buf.length) {
        if (buf[offset] !== 0xff) break;
        const marker = buf[offset + 1];
        if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
          offset += 2;
          continue;
        }
        if (marker === 0xd9 || marker === 0xda) break;

        const isSof =
          (marker >= 0xc0 && marker <= 0xc3) ||
          (marker >= 0xc5 && marker <= 0xc7) ||
          (marker >= 0xc9 && marker <= 0xcb) ||
          (marker >= 0xcd && marker <= 0xcf);

        if (isSof) {
          const height = buf.readUInt16BE(offset + 5);
          const width = buf.readUInt16BE(offset + 7);
          if (width > 0 && height > 0) return { width, height };
          break;
        }

        const segLen = buf.readUInt16BE(offset + 2);
        if (segLen < 2) break;
        offset += 2 + segLen;
      }
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Mengurai string data URI (data:image/...;base64,...) menjadi Buffer biner dan MIME type.
 */
export function decodeDataImageUri(raw?: string | null): DecodedImageData | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("data:image/")) return null;

  const commaIdx = trimmed.indexOf(",");
  if (commaIdx === -1) return null;

  const meta = trimmed.slice(5, commaIdx);
  const base64Payload = trimmed.slice(commaIdx + 1);
  if (!meta.includes(";base64")) return null;

  const mimeType = meta.split(";")[0]?.trim().toLowerCase();
  if (!mimeType || !mimeType.startsWith("image/")) return null;

  try {
    const buffer = Buffer.from(base64Payload, "base64");
    if (buffer.length === 0) return null;
    return { buffer, mimeType };
  } catch {
    return null;
  }
}

/**
 * Mengekstrak lebar & tinggi piksel langsung dari header awal base64 data URI gambar
 * secara ringan tanpa men-decode keseluruhan payload.
 */
export function extractDataImageDimensions(raw?: string | null): ImageDimensions | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("data:image/")) return null;

  const commaIdx = trimmed.indexOf(",");
  if (commaIdx === -1) return null;

  const meta = trimmed.slice(5, commaIdx);
  if (!meta.includes(";base64")) return null;

  const mimeType = meta.split(";")[0]?.trim().toLowerCase() || "";
  // Ambil maksimal ~12KB biner dari awal base64 untuk membaca header dimensi
  const headerSlice = trimmed.slice(commaIdx + 1, commaIdx + 1 + 16384);
  const alignedLen = headerSlice.length - (headerSlice.length % 4);
  if (alignedLen <= 0) return null;

  try {
    const buf = Buffer.from(headerSlice.slice(0, alignedLen), "base64");
    return parseImageHeaderDimensions(buf, mimeType);
  } catch {
    return null;
  }
}
