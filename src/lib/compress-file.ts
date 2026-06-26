import imageCompression from "browser-image-compression";

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/heic",
  "image/heif",
]);

const MAX_OUTPUT_MB = 1;
const MAX_DIMENSION = 1920;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export interface CompressFileResult {
  file: File;
  compressed: boolean;
  originalSize: number;
  finalSize: number;
}

/** Compress images client-side before upload; other file types pass through unchanged. */
export async function compressFileForUpload(file: File): Promise<CompressFileResult> {
  const originalSize = file.size;

  if (!IMAGE_TYPES.has(file.type.toLowerCase())) {
    return { file, compressed: false, originalSize, finalSize: originalSize };
  }

  // Skip tiny images
  if (originalSize <= 200 * 1024) {
    return { file, compressed: false, originalSize, finalSize: originalSize };
  }

  try {
    const compressed = await imageCompression(file, {
      maxSizeMB: MAX_OUTPUT_MB,
      maxWidthOrHeight: MAX_DIMENSION,
      useWebWorker: true,
      initialQuality: 0.82,
      preserveExif: false,
    });

    const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
    const ext = outputType === "image/png" ? ".png" : ".jpg";
    const baseName = file.name.replace(/\.[^.]+$/, "") || "upload";
    const outputName = file.name.includes(".") ? `${baseName}${ext}` : `${baseName}${ext}`;

    const outputFile =
      compressed instanceof File
        ? compressed
        : new File([compressed], outputName, { type: outputType, lastModified: Date.now() });

    const namedFile =
      outputFile.name === file.name
        ? outputFile
        : new File([outputFile], outputName, { type: outputFile.type, lastModified: Date.now() });

    return {
      file: namedFile,
      compressed: namedFile.size < originalSize,
      originalSize,
      finalSize: namedFile.size,
    };
  } catch (err) {
    console.warn("Image compression failed, uploading original:", err);
    return { file, compressed: false, originalSize, finalSize: originalSize };
  }
}

export function compressionSummary(result: {
  compressed: boolean;
  originalSize: number;
  finalSize: number;
}): string | null {
  if (!result.compressed || result.finalSize >= result.originalSize) return null;
  return `Reduced from ${formatBytes(result.originalSize)} to ${formatBytes(result.finalSize)}`;
}
