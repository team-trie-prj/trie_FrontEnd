import { useNavigate } from 'react-router-dom';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { ROUTES } from '@/constants/navigation';
import { useSearchPhase, useSearchActions } from '@/stores/searchStore';

/** FNC-SRC-01 예외 · VLM 지연 시 텍스트 단독 검색 전환 확인 */
export default function VlmFallbackModal() {
  const phase = useSearchPhase();
  const { clearImage, resetPhase, submit } = useSearchActions();
  const navigate = useNavigate();

  if (phase !== 'vlm_timeout') return null;

  const onConfirm = async () => {
    clearImage();
    const ok = await submit();
    if (ok) navigate(ROUTES.results);
  };

  return (
    <Modal title="이미지 분석 지연" onClose={resetPhase}>
      <p className="mb-5 text-sm leading-[1.8] text-[#C8C8C8]">
        VLM 이미지 분석 응답이 지연되고 있습니다.
        <br />
        이미지 분석을 제외하고 입력한 <b className="text-ink">텍스트만으로 검색</b>을
        진행할까요?
      </p>
      <div className="flex gap-3">
        <Button variant="ghost" className="flex-1" onClick={resetPhase}>
          취소
        </Button>
        <Button className="flex-1" onClick={() => void onConfirm()}>
          텍스트 단독 검색
        </Button>
      </div>
    </Modal>
  );
}
