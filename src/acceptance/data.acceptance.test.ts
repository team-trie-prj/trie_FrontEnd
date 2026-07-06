import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { validateDocument, DOC_MAX_SIZE } from '@/utils/fileValidators';

vi.mock('@/api/catalogApi', () => ({
  listCatalog: vi.fn(async () => []),
  registerCatalog: vi.fn(),
}));

import * as catalogApi from '@/api/catalogApi';
import { useCatalogEntries, useCatalogActions } from '@/stores/catalogStore';

const asFile = (name: string, size: number) => ({ name, size }) as File;

/** 02_data_ingestion.feature @FNC-DAT-01 — 업로드 용량 한도 경계(MAX_UPLOAD=20MB) */
describe('인수: 문서 업로드 경계 검증 (FNC-DAT-01)', () => {
  it('한도와 정확히 같은 크기(20MB)는 허용된다', () => {
    expect(validateDocument(asFile('지침서.pdf', DOC_MAX_SIZE))).toBeNull();
  });

  it('한도 + 1바이트는 차단되고 용량 초과 안내가 반환된다', () => {
    expect(validateDocument(asFile('지침서.pdf', DOC_MAX_SIZE + 1))).toContain('20MB');
  });

  it('한도의 2배 크기는 차단된다', () => {
    expect(validateDocument(asFile('지침서.pdf', DOC_MAX_SIZE * 2))).toContain('20MB');
  });

  it('[FE 1차 필터] 허용 외 확장자는 업로드 전 차단된다 (변조 정밀 검증은 BE 가드 서버 대상)', () => {
    expect(validateDocument(asFile('malware.exe', 1024))).toContain('PDF 또는 DOCX');
    expect(validateDocument(asFile('doc.hwp', 1024))).toContain('PDF 또는 DOCX');
  });
});

/** 02_data_ingestion.feature @FNC-PUB-01 — 공공 API 카탈로그 등록/연동 실패 차단 */
describe('인수: 공공 API 카탈로그 등록 (FNC-PUB-01)', () => {
  const setup = () =>
    renderHook(() => ({ entries: useCatalogEntries(), actions: useCatalogActions() }));

  it('연동 테스트 200 정상 응답 시 카탈로그에 등록된다', async () => {
    vi.mocked(catalogApi.registerCatalog).mockResolvedValueOnce({
      id: 'c9',
      name: '기상청 단기예보',
      endpointUrl: 'https://apis.data.go.kr/weather',
      params: [],
      apiKeyMasked: 'abcd********',
      status: 'active',
      registeredAt: new Date().toISOString(),
    });
    const { result } = setup();
    let ok = false;
    await act(async () => {
      ok = await result.current.actions.register({
        name: '기상청 단기예보',
        endpointUrl: 'https://apis.data.go.kr/weather',
        params: [],
        apiKey: 'abcd1234',
      });
    });
    expect(ok).toBe(true);
    expect(result.current.entries[0]?.name).toBe('기상청 단기예보');
  });

  it.each(['잘못된 인증키 오류', '서버 장애(5xx)', '비정상 응답 코드'])(
    '연동 실패(%s) 시 경고를 노출하고 카탈로그 저장을 차단한다',
    async (reason) => {
      vi.mocked(catalogApi.registerCatalog).mockRejectedValueOnce(
        new Error(`API 연동 실패: ${reason}`),
      );
      const { result } = setup();
      const before = result.current.entries.length;
      let ok = true;
      await act(async () => {
        ok = await result.current.actions.register({
          name: '실패 API',
          endpointUrl: 'https://x.invalid',
          params: [],
          apiKey: 'bad',
        });
      });
      expect(ok).toBe(false);
      expect(result.current.entries.length).toBe(before);
    },
  );
});
