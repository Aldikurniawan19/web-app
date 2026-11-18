export interface DecodedImageData {
  buffer: Buffer;
  mimeType: string;
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
