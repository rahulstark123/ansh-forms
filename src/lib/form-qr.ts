import QRCode from "qrcode";

const QR_OPTIONS = {
  margin: 2,
  color: {
    dark: "#0f172a",
    light: "#ffffff",
  },
} as const;

export async function generateFormQrDataUrl(url: string, size = 280) {
  return QRCode.toDataURL(url, { ...QR_OPTIONS, width: size });
}

export async function downloadFormQrPng(url: string, filename: string) {
  const dataUrl = await QRCode.toDataURL(url, { ...QR_OPTIONS, width: 512 });
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename.endsWith(".png") ? filename : `${filename}.png`;
  link.click();
}

export async function downloadFormQrSvg(url: string, filename: string) {
  const svg = await QRCode.toString(url, { ...QR_OPTIONS, type: "svg" });
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename.endsWith(".svg") ? filename : `${filename}.svg`;
  link.click();
  URL.revokeObjectURL(objectUrl);
}
