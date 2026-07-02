import { describe, expect, it } from 'vitest';
import { QUERY_MAX_LENGTH, sanitizeQuery, validateQuery } from '../queryValidators';

describe('validateQuery (XSS 방어)', () => {
  it('정상 질의는 통과한다', () => {
    expect(validateQuery('대전 유성구 포트홀 통계')).toBeNull();
  });

  it('최대 길이를 초과하면 거부한다', () => {
    expect(validateQuery('가'.repeat(QUERY_MAX_LENGTH + 1))).toMatch(/최대/);
  });

  it.each(['<script>alert(1)</script>', 'javascript:void(0)', '<img onerror=x>', '<iframe src=x>'])(
    '스크립트 패턴을 차단한다: %s',
    (input) => {
      expect(validateQuery(input)).not.toBeNull();
    },
  );
});

describe('sanitizeQuery', () => {
  it('앞뒤 공백을 정리한다', () => {
    expect(sanitizeQuery('  포트홀 검색  ')).toBe('포트홀 검색');
  });
});
