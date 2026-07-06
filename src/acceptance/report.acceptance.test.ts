import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

vi.mock('@/api/reportApi', () => ({ generateReport: vi.fn() }));

import * as reportApi from '@/api/reportApi';
import { useReportDraft, useReportStatus, useReportActions } from '@/stores/reportStore';
import { exportDocx } from '@/utils/docxExport';

const setup = () =>
  renderHook(() => ({
    draft: useReportDraft(),
    status: useReportStatus(),
    actions: useReportActions(),
  }));

/** 05_report.feature @FNC-REP-01 — 초안 스트리밍 생성/실패 처리 */
describe('인수: 보고서 초안 생성 (FNC-REP-01)', () => {
  it('생성 텍스트가 스트리밍 청크 단위로 누적 렌더링되고 완료 상태가 된다', async () => {
    vi.mocked(reportApi.generateReport).mockImplementationOnce(async (_s, _t, onChunk) => {
      onChunk('# 안전 점검 일지\n');
      onChunk('## 1. 개요\n');
      onChunk('포트홀 **긴급** 보수 대상 3건.');
    });
    const { result } = setup();
    await act(async () => {
      await result.current.actions.generate('session-1', 'safety-check');
    });
    expect(result.current.status).toBe('done');
    expect(result.current.draft?.markdown).toBe(
      '# 안전 점검 일지\n## 1. 개요\n포트홀 **긴급** 보수 대상 3건.',
    );
    expect(result.current.draft?.templateId).toBe('safety-check');
  });

  it('LLM API 오류 시 생성이 중단되고 실패 상태가 된다', async () => {
    vi.mocked(reportApi.generateReport).mockRejectedValueOnce(new Error('LLM 응답 지연'));
    const { result } = setup();
    await act(async () => {
      await result.current.actions.generate('session-1', 'safety-check');
    });
    expect(result.current.status).toBe('error');
  });
});

/** 05_report.feature @FNC-REP-02 — 인라인 편집·DOCX 빌드 */
describe('인수: 인라인 편집 및 내보내기 (FNC-REP-02)', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('WYSIWYG 편집 결과가 초안 상태에 반영된다', () => {
    const { result } = setup();
    act(() => result.current.actions.setMarkdown('# 수정된 보고서\n현장 특이사항 추가.'));
    expect(result.current.draft?.markdown).toContain('현장 특이사항 추가.');
  });

  it('DOCX 내보내기 시 정식 OOXML 문서 Blob이 빌드되어 다운로드가 트리거된다', async () => {
    let captured: Blob | null = null;
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn((b: Blob) => {
        captured = b;
        return 'blob:mock';
      }),
      revokeObjectURL: vi.fn(),
    });
    await exportDocx('# 보고서\n## 개요\n**긴급** 점검 3건\n- 항목 A\n- 항목 B');
    expect(captured).not.toBeNull();
    expect((captured as unknown as Blob).size).toBeGreaterThan(1000);
  }, 15000);
});
