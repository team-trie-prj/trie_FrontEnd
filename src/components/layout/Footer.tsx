import { Link } from 'react-router-dom';
import { NAV_GROUPS } from '@/constants/navigation';

/** 데모 푸터 구조·톤 유지 */
export default function Footer() {
  return (
    <footer className="mt-10 border-t border-[#141414] bg-black">
      <div className="mx-auto grid max-w-wrap grid-cols-[1.6fr_1fr_1fr_1fr] gap-[30px] px-9 pb-[30px] pt-[50px] max-[900px]:grid-cols-2">
        <div>
          <div className="mb-3.5 flex items-center gap-2.5">
            <img src="/logo.svg" alt="TRIE 로고" width={28} height={28} />
            <b className="text-sm font-semibold">TRIE · 지능형 정보 시스템</b>
          </div>
          <p className="max-w-[280px] text-[13px] leading-[1.7] text-mut2">
            VLM 비전 · 하이브리드 RAG · AI 에이전트를 하나로 통합한 생성형 AI 기반 지능형 정보
            시스템. 자연어로 질의하면 도구를 호출해 분석·요약·보고서를 수행합니다.
          </p>
        </div>
        {NAV_GROUPS.map((g) => (
          <div key={g.key}>
            <h4 className="mb-3.5 text-[11px] font-semibold uppercase tracking-[.12em] text-mut3">
              {g.label}
            </h4>
            {g.items.map((i) => (
              <Link
                key={i.to}
                to={i.to}
                className="mb-2.5 block text-[13px] text-[#A8A8A8] transition-colors hover:text-white"
              >
                {i.title}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="mx-auto flex max-w-wrap flex-wrap items-center justify-between gap-2.5 border-t border-[#141414] px-9 pb-[34px] pt-[18px]">
        <span className="text-xs text-mut3">© 2026 GENSOFT · TRIE 지능형 정보 시스템 · 대전 유성구</span>
        <div className="flex flex-wrap gap-2">
          {['VLM', 'Hybrid RAG', 'AI Agent', '공공데이터'].map((b) => (
            <span
              key={b}
              className="rounded-[20px] border border-line2 px-3 py-[5px] text-[11px] text-[#9A9A9A]"
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
