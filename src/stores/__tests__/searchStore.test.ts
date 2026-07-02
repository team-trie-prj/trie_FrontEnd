import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import {
  useQueryText,
  useSearchActions,
  useSearchPhase,
  useSuggestedTemplates,
} from '../searchStore';
import { useSearchResponse } from '../resultStore';

/** 스토어 훅을 리액트 밖에서 검증하기 위한 renderHook 래퍼 */
const setup = () =>
  renderHook(() => ({
    actions: useSearchActions(),
    phase: useSearchPhase(),
    templates: useSuggestedTemplates(),
    queryText: useQueryText(),
    response: useSearchResponse(),
  }));

describe('searchStore (FNC-SRC-01/02, mock 모드)', () => {
  it('빈 질의는 제출을 거부한다', async () => {
    const { result } = setup();
    let ok = true;
    await act(async () => {
      ok = await result.current.actions.submit();
    });
    expect(ok).toBe(false);
  });

  it('모호한 질의(6자 미만)는 검색을 보류하고 템플릿을 역제안한다', async () => {
    const { result } = setup();
    act(() => result.current.actions.setQueryText('도로'));
    await act(async () => {
      await result.current.actions.submit();
    });
    expect(result.current.phase).toBe('suggesting');
    expect(result.current.templates.length).toBeGreaterThan(0);
  });

  it('템플릿 적용 시 질의가 교체되고 제안이 닫힌다', () => {
    const { result } = setup();
    const t = result.current.templates[0];
    act(() => result.current.actions.applyTemplate(t));
    expect(result.current.queryText).toBe(t.queryText);
    expect(result.current.templates).toHaveLength(0);
  });

  it('정상 질의는 검색 성공 후 결과 스토어에 반영된다', async () => {
    const { result } = setup();
    act(() => result.current.actions.setQueryText('대전 유성구 포트홀 민원 통계'));
    let ok = false;
    await act(async () => {
      ok = await result.current.actions.submit();
    });
    expect(ok).toBe(true);
    expect(result.current.response?.hits.length).toBeGreaterThan(0);
    expect(result.current.response?.hits.length).toBeLessThanOrEqual(10); // FNC-SRC-03 청크 제한
  }, 10000);

  it('XSS 패턴 질의는 차단된다', async () => {
    const { result } = setup();
    act(() => result.current.actions.setQueryText('<script>alert(1)</script> 포트홀'));
    let ok = true;
    await act(async () => {
      ok = await result.current.actions.submit();
    });
    expect(ok).toBe(false);
  });
});
