import { compressFileForUpload } from "@/lib/compress-file";

export interface UploadFileResult {
  url: string;
  compressed: boolean;
  originalSize: number;
  finalSize: number;
}

/** Compress (when image) then upload to storage API. */
export async function uploadFileWithCompression(file: File): Promise<UploadFileResult> {
  const { file: prepared, compressed, originalSize, finalSize } = await compressFileForUpload(file);

  const formData = new FormData();
  formData.append("file", prepared);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to upload file.");
  }

  const data = await res.json();
  return {
    url: data.url,
    compressed,
    originalSize,
    finalSize,
  };
}
