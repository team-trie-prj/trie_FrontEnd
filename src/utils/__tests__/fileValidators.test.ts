import { describe, expect, it } from 'vitest';
import { validateDocument, validateImage, formatBytes } from '../fileValidators';

const fakeFile = (name: string, type: string, size: number): File => {
  const f = new File(['x'], name, { type });
  Object.defineProperty(f, 'size', { value: size });
  return f;
};

describe('validateDocument (FNC-DAT-01)', () => {
  it('PDF 20MB 이하는 통과한다', () => {
    expect(validateDocument(fakeFile('a.pdf', 'application/pdf', 19 * 1024 * 1024))).toBeNull();
  });
  it('20MB 초과는 차단한다', () => {
    expect(validateDocument(fakeFile('a.docx', '', 21 * 1024 * 1024))).toMatch(/20MB/);
  });
  it('허용 외 확장자는 차단한다', () => {
    expect(validateDocument(fakeFile('a.exe', '', 100))).toMatch(/PDF 또는 DOCX/);
  });
});

describe('validateImage (FNC-SRC-01)', () => {
  it('JPG/PNG만 허용한다', () => {
    expect(validateImage(fakeFile('a.gif', 'image/gif', 100))).not.toBeNull();
    expect(validateImage(fakeFile('a.jpg', 'image/jpeg', 100))).toBeNull();
  });
  it('하드리밋(30MB) 초과 원본은 차단한다', () => {
    expect(validateImage(fakeFile('a.png', 'image/png', 31 * 1024 * 1024))).not.toBeNull();
  });
});

describe('formatBytes', () => {
  it('단위를 변환한다', () => {
    expect(formatBytes(512)).toBe('512B');
    expect(formatBytes(2048)).toBe('2.0KB');
    expect(formatBytes(3 * 1024 * 1024)).toBe('3.0MB');
  });
});
