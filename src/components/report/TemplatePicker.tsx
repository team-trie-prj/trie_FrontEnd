import Label from '@/components/common/Label';
import { REPORT_TEMPLATES } from '@/constants/reportTemplates';

interface Props {
  selected: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

/** FNC-REP-01 · 실무 양식 선택 */
export default function TemplatePicker({ selected, onSelect, disabled }: Props) {
  return (
    <div>
      <Label className="mb-3">실무 양식 선택</Label>
      <div className="flex flex-col gap-2.5">
        {REPORT_TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            disabled={disabled}
            className={`rounded-[12px] border px-4 py-3 text-left transition-colors disabled:opacity-50 ${
              selected === t.id
                ? 'border-white bg-[#101010]'
                : 'border-line hover:border-[#333]'
            }`}
          >
            <span className="block text-sm font-semibold">{t.label}</span>
            <span className="mt-0.5 block text-xs text-mut2">{t.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
