import Icon from '@/components/common/Icon';
import Label from '@/components/common/Label';
import TemplatePicker from './TemplatePicker';

interface Props {
  sourceLabel: string;
  sourceSelected: boolean;
  templateId: string;
  busy: boolean;
  onOpenPicker: () => void;
  onSelectTemplate: (id: string) => void;
}

/** 근거 데이터 요약 버튼 + 양식 선택 (좌측 제어 패널) */
export default function ReportControls({
  sourceLabel,
  sourceSelected,
  templateId,
  busy,
  onOpenPicker,
  onSelectTemplate,
}: Props) {
  return (
    <>
      <Label className="mb-3">근거 데이터</Label>
      <button
        onClick={onOpenPicker}
        disabled={busy}
        className={`mb-5 flex w-full items-center gap-2.5 rounded-[12px] border px-3.5 py-3 text-left transition-colors disabled:opacity-50 ${
          sourceSelected ? 'border-line hover:border-[#333]' : 'border-danger/40'
        }`}
      >
        <Icon
          name={sourceSelected ? 'auto_awesome' : 'warning'}
          size={16}
          className={sourceSelected ? 'shrink-0 text-mut' : 'shrink-0 text-danger'}
        />
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{sourceLabel}</span>
        <span className="shrink-0 text-[11px] text-mut3">변경</span>
      </button>
      <TemplatePicker selected={templateId} onSelect={onSelectTemplate} disabled={busy} />
    </>
  );
}
