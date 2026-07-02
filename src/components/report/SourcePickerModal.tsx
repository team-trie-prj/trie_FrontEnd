import Modal from '@/components/common/Modal';
import SourcePicker from './SourcePicker';

interface Props {
  open: boolean;
  selected: string | null;
  onSelect: (sessionId: string) => void;
  onClose: () => void;
}

/** 근거 데이터 선택 모달 — 목록이 길어져도 페이지 레이아웃에 영향 없음 */
export default function SourcePickerModal({ open, selected, onSelect, onClose }: Props) {
  if (!open) return null;

  return (
    <Modal title="근거 데이터 선택" onClose={onClose}>
      <SourcePicker
        selected={selected}
        onSelect={(id) => {
          onSelect(id);
          onClose();
        }}
      />
      <p className="text-center text-[0.6875rem] text-mut4">
        현재 검색 결과 또는 과거 검색 세션(최대 50개)에서 선택합니다
      </p>
    </Modal>
  );
}
