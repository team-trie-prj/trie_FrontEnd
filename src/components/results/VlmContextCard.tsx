import Card from '@/components/common/Card';
import Icon from '@/components/common/Icon';
import Label from '@/components/common/Label';

/** FNC-VIW-01 · VLM 이미지 분석 맥락 영역 */
export default function VlmContextCard({ context }: { context: string }) {
  return (
    <Card className="border-line2">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-[1.875rem] w-[1.875rem] items-center justify-center rounded-full bg-white">
          <Icon name="center_focus_strong" size={17} className="text-black" />
        </span>
        <Label>VLM 이미지 분석 맥락</Label>
      </div>
      <p className="text-sm leading-[1.8] text-[#C8C8C8]">{context}</p>
    </Card>
  );
}
