import Modal from '@/components/common/Modal';
import { useSnippetHit, useResultActions } from '@/stores/resultStore';

/** FNC-VIW-01 · 출처 배지 클릭 시 근거 전후 맥락(Snippet)을 가벼운 모달로 대조 */
export default function SnippetModal() {
  const hit = useSnippetHit();
  const { closeSnippet } = useResultActions();

  if (!hit) return null;

  return (
    <Modal title={hit.provenance?.label ?? '근거 스니펫'} onClose={closeSnippet}>
      <p className="mb-4 text-sm font-semibold text-ink">{hit.title}</p>
      <div className="rounded-[12px] border border-line bg-panel2 p-4 text-[13px] leading-[1.8] text-[#C8C8C8]">
        {hit.provenance?.snippet ?? hit.text}
      </div>
      {hit.provenance?.url && (
        <a
          href={hit.provenance.url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block text-xs text-mut underline underline-offset-4 hover:text-ink"
        >
          원본 출처 열기 ↗
        </a>
      )}
    </Modal>
  );
}
