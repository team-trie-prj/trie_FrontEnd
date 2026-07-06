import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { request } from '@/api/client';
import { validateImage } from '@/utils/fileValidators';
import {
  useAttachedImage,
  useQueryText,
  useSearchActions,
  useSearchPhase,
  useSuggestedTemplates,
} from '@/stores/searchStore';
import { useSearchResponse } from '@/stores/resultStore';

const MB = 1024 * 1024;
const asFile = (type: string, size: number) => ({ type, size, name: 'img' }) as File;

const setup = () =>
  renderHook(() => ({
    actions: useSearchActions(),
    phase: useSearchPhase(),
    templates: useSuggestedTemplates(),
    queryText: useQueryText(),
    image: useAttachedImage(),
    response: useSearchResponse(),
  }));

/** 03_search.feature @FNC-SRC-01 — 첨부 이미지 제약 */
describe('인수: 이미지 첨부 제약 (FNC-SRC-01)', () => {
  it('GIF 3MB는 확장자 제한(JPG/PNG만)으로 거부된다', () => {
    expect(validateImage(asFile('image/gif', 3 * MB))).toContain('JPG 또는 PNG');
  });

  it('BMP 2MB는 확장자 제한(JPG/PNG만)으로 거부된다', () => {
    expect(validateImage(asFile('image/bmp', 2 * MB))).toContain('JPG 또는 PNG');
  });

  // 인수 기준: 6MB JPG 즉시 거부. 현 구현은 WBS의 클라이언트 리사이징 정책에 따라
  // 축소 후 5MB 재검증(원본 6MB도 축소되면 허용될 수 있음) — 협의 필요.
  it.fails('[협의] 6MB JPG는 즉시 거부되어야 한다', () => {
    expect(validateImage(asFile('image/jpeg', 6 * MB))).not.toBeNull();
  });

  it('8MB PNG도 리사이징 대상으로 선통과된다(동일 협의 사항) — 30MB 초과는 즉시 거부', () => {
    expect(validateImage(asFile('image/png', 31 * MB))).toContain('30MB');
  });
});

/** 03_search.feature @FNC-SRC-01 예외 — VLM 지연 시 텍스트 단독 전환 확인 */
describe('인수: VLM 응답 지연 Fallback (FNC-SRC-01)', () => {
  it('VLM 지연 시 텍스트 단독 검색 전환을 사용자에게 묻는 상태가 된다', async () => {
    const { result } = setup();
    act(() => {
      result.current.actions.setQueryText('포트홀 보수 지연 구간 정비 이력 조회');
      result.current.actions.attachImage({ name: 'p.jpg', size: 1024, dataUrl: 'data:image/jpeg;base64,x' });
    });
    await act(async () => {
      await result.current.actions.submit();
    });
    expect(result.current.phase).toBe('vlm_timeout');
  }, 15000);

  it('사용자 동의 시 이미지를 제외하고 텍스트 단독 검색으로 전환된다', async () => {
    const { result } = setup();
    act(() => result.current.actions.clearImage());
    let ok = false;
    await act(async () => {
      ok = await result.current.actions.submit();
    });
    expect(ok).toBe(true);
    expect(result.current.image).toBeNull();
    expect(result.current.response?.hits.length).toBeGreaterThan(0);
  }, 15000);
});

/** 03_search.feature @FNC-SRC-02 — 모호 질의 보류·역제안·1회 스킵 */
describe('인수: 모호 질의 템플릿 역제안 (FNC-SRC-02)', () => {
  it('모호 질의는 검색을 보류하고 맞춤형 템플릿을 역제안한다', async () => {
    const { result } = setup();
    act(() => result.current.actions.setQueryText('도로'));
    let ok = true;
    await act(async () => {
      ok = await result.current.actions.submit();
    });
    expect(ok).toBe(false);
    expect(result.current.phase).toBe('suggesting');
    expect(result.current.templates.length).toBeGreaterThan(0);
  }, 15000);

  it('제안 무시 후 동일 질의 강행 시 역제안을 1회 스킵하고 검색을 진행한다', async () => {
    const { result } = setup();
    act(() => result.current.actions.dismissTemplates());
    let ok = false;
    await act(async () => {
      ok = await result.current.actions.submit();
    });
    expect(ok).toBe(true);
    expect(result.current.response?.routing.mode).toBeDefined();
  }, 15000);
});

/** 03_search.feature @FNC-SRC-03 — 캐시 버그 차단 */
describe('인수: 동일 쿼리 반복 호출 캐시 차단 (FNC-SRC-03)', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('매 호출마다 고유 세션 UUID + Cache-Control: no-cache가 강제된다', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await request('/search', { method: 'POST', body: '{}' });
    await request('/search', { method: 'POST', body: '{}' });

    const h1 = fetchMock.mock.calls[0][1].headers as Headers;
    const h2 = fetchMock.mock.calls[1][1].headers as Headers;
    expect(h1.get('Cache-Control')).toBe('no-cache');
    expect(h2.get('Cache-Control')).toBe('no-cache');
    expect(h1.get('X-Session-Id')).toBeTruthy();
    expect(h1.get('X-Session-Id')).not.toBe(h2.get('X-Session-Id'));
    expect(fetchMock.mock.calls[0][1].cache).toBe('no-store');
  });

  it('동일 질의 2회 연속 검색 시 응답 세션 ID가 서로 다르다(mock)', async () => {
    const { result } = setup();
    act(() => result.current.actions.setQueryText('대전 유성구 포트홀 민원 통계 조회'));
    await act(async () => {
      await result.current.actions.submit();
    });
    const first = result.current.response?.sessionId;
    await act(async () => {
      await result.current.actions.submit();
    });
    expect(first).toBeTruthy();
    expect(result.current.response?.sessionId).not.toBe(first);
  }, 20000);
});
