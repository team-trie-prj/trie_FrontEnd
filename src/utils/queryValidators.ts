/** WBS - 자연어 질의 입력 유효성 검사 (XSS 방어) */
export const QUERY_MAX_LENGTH = 300;

const XSS_PATTERNS = [/<\s*script/i, /javascript\s*:/i, /on\w+\s*=/i, /<\s*iframe/i];

export function validateQuery(text: string): string | null {
  if (text.length > QUERY_MAX_LENGTH)
    return `질의는 최대 ${QUERY_MAX_LENGTH}자까지 입력할 수 있습니다.`;
  if (XSS_PATTERNS.some((p) => p.test(text)))
    return '허용되지 않는 문자열(스크립트 패턴)이 포함되어 있습니다.';
  return null;
}

/** 제어문자 제거 + 앞뒤 공백 정리 */
export function sanitizeQuery(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/[\u0000-\u001F\u007F]/g, '').trim();
}
