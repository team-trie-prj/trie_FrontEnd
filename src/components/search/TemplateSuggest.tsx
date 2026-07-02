import { useNavigate } from 'react-router-dom';
import Card from '@/components/common/Card';
import Icon from '@/components/common/Icon';
import Label from '@/components/common/Label';
import { ROUTES } from '@/constants/navigation';
import { useSuggestedTemplates, useSearchActions } from '@/stores/searchStore';

/** FNC-SRC-02 · 모호 질의 시 맞춤형 질의 템플릿 역제안 패널. */
export default function TemplateSuggest() {
  const templates = useSuggestedTemplates();
  const { applyTemplate, dismissTemplates, submit } = useSearchActions();
  const navigate = useNavigate();

  if (templates.length === 0) return null;

  const onForce = async () => {
    dismissTemplates(); // skipOnce = true
    const ok = await submit();
    if (ok) navigate(ROUTES.results);
  };

  return (
    <Card className="mx-auto mt-6 max-w-[680px] screen-fade">
      <div className="mb-4 flex items-center gap-2.5">
        <Icon name="smart_toy" size={20} />
        <Label>질의가 모호해요 · 이런 검색은 어떠세요?</Label>
      </div>
      <div className="flex flex-col gap-2.5">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => applyTemplate(t)}
            className="flex items-center gap-3 rounded-[12px] border border-line px-4 py-3 text-left transition-colors hover:border-[#333] hover:bg-[#101010]"
          >
            <span className="rounded-md border border-line2 px-2 py-0.5 text-[11px] text-mut">
              {t.domain}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{t.label}</span>
            <Icon name="north_east" size={15} className="text-mut3" />
          </button>
        ))}
      </div>
      <button
        onClick={() => void onForce()}
        className="mt-4 w-full text-center text-xs text-mut3 underline underline-offset-4 hover:text-mut"
      >
        제안 무시하고 입력한 그대로 검색 강행
      </button>
    </Card>
  );
}
