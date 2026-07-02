/** WBS · 대용량 이미지 클라이언트 사이드 리사이징. */
const MAX_DIMENSION = 1600;
const RESIZE_THRESHOLD = 2 * 1024 * 1024;
const JPEG_QUALITY = 0.85;

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('이미지를 불러오지 못했습니다.'));
    img.src = dataUrl;
  });
}

export interface ResizedImage {
  dataUrl: string;
  size: number;
}

export async function resizeImage(dataUrl: string, originalSize: number): Promise<ResizedImage> {
  const img = await loadImage(dataUrl);
  const maxSide = Math.max(img.width, img.height);

  if (originalSize <= RESIZE_THRESHOLD && maxSide <= MAX_DIMENSION) {
    return { dataUrl, size: originalSize };
  }

  const scale = Math.min(1, MAX_DIMENSION / maxSide);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) return { dataUrl, size: originalSize };

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const out = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  const size = Math.round((out.length - out.indexOf(',') - 1) * 0.75);
  return { dataUrl: out, size };
}
