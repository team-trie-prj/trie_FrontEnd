import { describe, expect, it } from 'vitest';
import { markdownToHtml } from '../markdown';

describe('markdownToHtml', () => {
  it('헤딩을 변환한다', () => {
    expect(markdownToHtml('# 제목')).toContain('<h1>제목</h1>');
    expect(markdownToHtml('## 소제목')).toContain('<h2>소제목</h2>');
  });

  it('굵게와 목록을 변환한다', () => {
    expect(markdownToHtml('**중요**')).toContain('<strong>중요</strong>');
    const list = markdownToHtml('- 하나\n- 둘');
    expect(list).toContain('<ul>');
    expect(list).toContain('<li>하나</li>');
  });

  it('HTML을 이스케이프한다 (XSS 방어)', () => {
    const out = markdownToHtml('<script>alert(1)</script>');
    expect(out).not.toContain('<script>');
    expect(out).toContain('&lt;script&gt;');
  });
});
