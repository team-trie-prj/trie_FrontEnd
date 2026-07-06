import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

vi.mock('@/api/historyApi', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/api/historyApi')>();
  return { ...real, listHistory: vi.fn(real.listHistory) };
});

import * as historyApi from '@/api/historyApi';
import { MOCK_HISTORY } from '@/mocks/commonMocks';
import { addHistoryEntry, useHistoryEntries, useHistoryActions } from '@/stores/historyStore';
import { useSearchResponse, setSearchResults } from '@/stores/resultStore';
import { useQueryText } from '@/stores/searchStore';
import { mockSearchResponse } from '@/mocks/searchMocks';

const setup = () =>
  renderHook(() => ({
    entries: useHistoryEntries(),
    actions: useHistoryActions(),
    response: useSearchResponse(),
    queryText: useQueryText(),
  }));

/** 06_history.feature @FNC-HIS-01 */
describe('인수: 히스토리 로깅·복원 (FNC-HIS-01)', () => {
  it('이력이 없는 상태에서는 복원 대상이 표시되지 않는다(빈 목록)', async () => {
    vi.mocked(historyApi.listHistory).mockResolvedValueOnce([]);
    const { result } = setup();
    await act(async () => {
      await result.current.actions.load();
    });
    expect(result.current.entries).toHaveLength(0);
  });

  it('이력 클릭 시 기존 결과가 무효화되고 스냅샷으로 온전히 복원된다', async () => {
    const stale = mockSearchResponse('오염된 이전 결과', false);
    setSearchResults(stale);
    const { result } = setup();
    let ok = false;
    await act(async () => {
      ok = await result.current.actions.restore(MOCK_HISTORY[0].sessionId);
    });
    expect(ok).toBe(true);
    expect(result.current.response?.sessionId).not.toBe(stale.sessionId);
    expect(result.current.response?.hits.length).toBeGreaterThan(0);
    expect(result.current.queryText).toBe(MOCK_HISTORY[0].queryText);
  }, 15000);

  it('검색 성공 세션이 이력 목록 최상단에 로깅된다', () => {
    const { result } = setup();
    act(() =>
      addHistoryEntry({
        sessionId: 'new-session',
        queryText: '새 검색',
        hasImage: false,
        createdAt: new Date().toISOString(),
      }),
    );
    expect(result.current.entries[0].sessionId).toBe('new-session');
  });

  it('보존 상한(50) 초과 시 가장 오래된 이력부터 FIFO로 삭제된다', () => {
    const { result } = setup();
    act(() => {
      for (let i = 1; i <= 55; i += 1) {
        addHistoryEntry({
          sessionId: `s-${i}`,
          queryText: `질의 ${i}`,
          hasImage: false,
          createdAt: new Date(2026, 0, i).toISOString(),
        });
      }
    });
    expect(result.current.entries).toHaveLength(50);
    expect(result.current.entries[0].sessionId).toBe('s-55');
    expect(result.current.entries.some((e) => e.sessionId === 's-1')).toBe(false);
    expect(result.current.entries.some((e) => e.sessionId === 's-5')).toBe(false);
  });
});
