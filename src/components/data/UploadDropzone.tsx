import { useRef, useState } from 'react';
import Icon from '@/components/common/Icon';
import { useUploadActions } from '@/stores/uploadStore';

/** FNC-DAT-01 · PDF/DOCX 드래그 앤 드롭 업로드 (최대 20MB) — 데모 점선 박스 톤 유지 */
export default function UploadDropzone() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const { enqueue } = useUploadActions();

  return (
    <>
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          enqueue([...e.dataTransfer.files]);
        }}
        className={`flex h-[11.25rem] cursor-pointer flex-col items-center justify-center gap-2.5 rounded-[0.875rem] border-[0.09375rem] border-dashed bg-panel2 text-mut3 transition-colors ${
          dragOver ? 'border-[#555]' : 'border-[#2A2A2A]'
        }`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileRef.current?.click();
          }
        }}
        aria-label="문서 업로드"
      >
        <Icon name="upload_file" size={34} className="text-ink" />
        <span className="text-[0.8125rem]">PDF / DOCX 끌어다 놓기 또는 클릭하여 업로드</span>
        <span className="text-[0.6875rem] text-mut4">단일 파일 최대 20MB · 지침서·매뉴얼 등 사내 문서</span>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.docx"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) enqueue([...e.target.files]);
          e.target.value = '';
        }}
      />
    </>
  );
}
