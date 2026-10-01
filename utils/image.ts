/**
 * Downscales a photo in the browser and returns a JPEG data URL.
 * The Visual System asks for ≤ 300 KB uploads; in demo mode we keep a smaller
 * version (default 960 px) so several reports fit in localStorage.
 */
export async function compressImage(file: File, maxSide = 960, quality = 0.72): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", quality);
}
