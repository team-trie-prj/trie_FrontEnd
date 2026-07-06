import { beforeAll, describe, expect, it, vi } from 'vitest';

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
beforeAll(() => vi.stubGlobal('ResizeObserver', ResizeObserverStub));
afterEach(cleanup);
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ResultsPage from '@/pages/ResultsPage';
import { setSearchResults } from '@/stores/resultStore';
import { mockSearchResponse } from '@/mocks/searchMocks';
import type { SearchResponse } from '@/types/search';

const renderResults = (response: SearchResponse) => {
  setSearchResults(response);
  return render(
    <MemoryRouter>
      <ResultsPage />
    </MemoryRouter>,
  );
};

/** 04_results.feature @FNC-VIW-01 — 카드 분할·출처 배지·스니펫 팝업 */
describe('인수: 출처 표기 (FNC-VIW-01)', () => {
  it('결과가 사내 지침서·공공 통계·이미지 분석 맥락 영역으로 분리 배치된다', () => {
    renderResults(mockSearchResponse('유성구 포트홀 민원 통계', true));
    expect(screen.getByText('도로 파손 응급복구 매뉴얼')).toBeDefined();
    expect(screen.getAllByText(/VLM 이미지 분석/).length).toBeGreaterThan(0);
    expect(screen.getByText('공공 통계 시각화')).toBeDefined();
    expect(screen.getAllByText('사내 지침서').length).toBeGreaterThan(0);
  });

  it('각 카드에 원본 출처 배지가 부착되고, 클릭 시 근거 스니펫 팝업이 열린다', () => {
    renderResults(mockSearchResponse('유성구 포트홀', false));
    const badge = screen.getAllByText('안전지침 매뉴얼 p.12')[0];
    expect(badge).toBeDefined();
    fireEvent.click(badge);
    expect(screen.getByText(/제3절 응급복구 기준/)).toBeDefined();
  });

  it('출처 메타데이터 유실 시 "출처 미상 (확인 주의)" 경고 배지가 강제 부여된다', () => {
    const res = mockSearchResponse('출처 유실 케이스', false);
    res.hits = [{ ...res.hits[0], provenance: null }];
    renderResults(res);
    expect(screen.getAllByText('출처 미상 (확인 주의)').length).toBeGreaterThan(0);
  });
});

/** 04_results.feature @FNC-VIW-02 — 통계 차트/표 렌더링·비정형 우회 */
describe('인수: 통계 시각화 (FNC-VIW-02)', () => {
  it('정형 수치는 차트/표 토글로 렌더링된다(표 전환 시 행·열 데이터 노출)', () => {
    renderResults(mockSearchResponse('유성구 포트홀 통계', false));
    fireEvent.click(screen.getAllByText('표')[0]);
    expect(screen.getAllByText('5월').length).toBeGreaterThan(0);
    expect(screen.getAllByText('73').length).toBeGreaterThan(0);
  });

  it('비정형 줄글 데이터만 있으면 차트 엔진을 우회하고 원문 텍스트로만 노출한다', () => {
    const res = mockSearchResponse('비정형 케이스', false);
    res.hits = res.hits.map((h) => ({ ...h, stats: undefined }));
    renderResults(res);
    expect(screen.queryByText('공공 통계 시각화')).toBeNull();
    expect(screen.getAllByText(/포트홀 발견 시 심각도/).length).toBeGreaterThan(0);
  });
});
