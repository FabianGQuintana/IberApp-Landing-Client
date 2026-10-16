// Phone cameras take 4–12 MB photos. We shrink them on the phone (≈200–500 KB) before saving:
// they take less space while offline and upload much faster with weak signal.

const MAX_SIDE = 1600;
const QUALITY = 0.75;

export async function compressPhoto(file: File): Promise<Blob> {
  // "from-image" applies the EXIF rotation, so portrait photos do not end up sideways
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", QUALITY));
    // If the browser could not encode it, keep the original (the backend accepts up to 8 MB)
    return blob && blob.size < file.size ? blob : file;
  } finally {
    bitmap.close();
  }
}
