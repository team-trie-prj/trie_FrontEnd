const MB = 1024 * 1024;

/** FNC-SRC-01 · 첨부 이미지: 최대 5MB, JPG/PNG만 허용 */
export const IMAGE_MAX_SIZE = 5 * MB;
/** 리사이징으로도 감당 불가한 극단적 원본 차단선 */
export const IMAGE_HARD_LIMIT = 30 * MB;
const IMAGE_TYPES = ['image/jpeg', 'image/png'];

/** 확장자·하드리밋만 선검증 — 5MB 검증은 클라이언트 리사이징 후 수행 */
export function validateImage(file: File): string | null {
  if (!IMAGE_TYPES.includes(file.type)) return 'JPG 또는 PNG 이미지만 첨부할 수 있습니다.';
  if (file.size > IMAGE_HARD_LIMIT) return '이미지가 너무 큽니다(30MB 초과).';
  return null;
}

/** FNC-DAT-01 · 문서 업로드: 최대 20MB, PDF/DOCX만 허용 */
export const DOC_MAX_SIZE = 20 * MB;
const DOC_EXTS = ['.pdf', '.docx'];

export function validateDocument(file: File): string | null {
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  if (!DOC_EXTS.includes(ext)) return 'PDF 또는 DOCX 파일만 업로드할 수 있습니다.';
  if (file.size > DOC_MAX_SIZE) return '단일 파일 용량은 최대 20MB 이하로 제한됩니다.';
  return null;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n}B`;
  if (n < MB) return `${(n / 1024).toFixed(1)}KB`;
  return `${(n / MB).toFixed(1)}MB`;
}
