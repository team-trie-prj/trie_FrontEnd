import { useRef } from 'react';
import Icon from '@/components/common/Icon';
import { validateImage, formatBytes, IMAGE_MAX_SIZE } from '@/utils/fileValidators';
import { readAsDataUrl } from '@/utils/readFile';
import { resizeImage } from '@/utils/imageResize';
import { useAttachedImage, useSearchActions } from '@/stores/searchStore';
import { toast } from '@/stores/uiStore';

/** FNC-SRC-01 · 현장 이미지 첨부 (JPG/PNG) — 대용량은 클라이언트에서 리사이징 후 5MB 검증 */
export default function ImageAttach() {
  const fileRef = useRef<HTMLInputElement>(null);
  const image = useAttachedImage();
  const { attachImage, clearImage } = useSearchActions();

  const onSelect = async (file: File | undefined) => {
    if (!file) return;
    const error = validateImage(file);
    if (error) {
      toast(error);
      return;
    }
    const raw = await readAsDataUrl(file);
    const resized = await resizeImage(raw, file.size);
    if (resized.size > IMAGE_MAX_SIZE) {
      toast('리사이징 후에도 5MB를 초과합니다. 더 작은 이미지를 사용하세요.');
      return;
    }
    if (resized.size < file.size) toast(`이미지 최적화: ${formatBytes(file.size)} → ${formatBytes(resized.size)}`);
    attachImage({ name: file.name, size: resized.size, dataUrl: resized.dataUrl });
  };

  if (image) {
    return (
      <span className="inline-flex items-center gap-2 rounded-[20px] border border-line2 py-1 pl-1.5 pr-2.5 text-xs text-[#C8C8C8]">
        <img src={image.dataUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
        <span className="max-w-[120px] truncate">{image.name}</span>
        <span className="text-mut4">{formatBytes(image.size)}</span>
        <button onClick={clearImage} className="text-mut hover:text-ink" aria-label="이미지 제거">
          <Icon name="close" size={14} />
        </button>
      </span>
    );
  }

  return (
    <>
      <button
        onClick={() => fileRef.current?.click()}
        className="inline-flex h-10 items-center gap-1.5 rounded-[21px] border border-white/30 px-4 text-[13px] font-semibold transition-colors hover:bg-white/[.06]"
      >
        <Icon name="add_photo_alternate" size={17} />
        <span className="max-[768px]:hidden">이미지</span>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={(e) => void onSelect(e.target.files?.[0])}
      />
    </>
  );
}
