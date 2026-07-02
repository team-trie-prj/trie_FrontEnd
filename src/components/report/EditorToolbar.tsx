import type { Editor } from '@tiptap/react';
import Icon from '@/components/common/Icon';

interface Props {
  editor: Editor | null;
}

const btnCls = (active: boolean) =>
  `flex h-8 min-w-8 items-center justify-center rounded-md px-1.5 text-[0.8125rem] font-semibold transition-colors ${
    active ? 'bg-[#1A1A18] text-white' : 'text-[#1A1A18] hover:bg-[#E4E4DE]'
  }`;

/** FNC-REP-02 · 서식 편집 툴바 (제목/굵게/기울임/목록/실행취소) */
export default function EditorToolbar({ editor }: Props) {
  if (!editor) return null;
  const c = () => editor.chain().focus();

  return (
    <div className="mb-4 flex flex-wrap items-center gap-1 border-b border-[#D8D8D0] pb-2.5">
      {([1, 2, 3] as const).map((level) => (
        <button
          key={level}
          onClick={() => c().toggleHeading({ level }).run()}
          className={btnCls(editor.isActive('heading', { level }))}
          title={`제목 ${level}`}
        >
          H{level}
        </button>
      ))}
      <span className="mx-1 h-5 w-px bg-[#D8D8D0]" />
      <button onClick={() => c().toggleBold().run()} className={btnCls(editor.isActive('bold'))} title="굵게">
        <Icon name="format_bold" size={17} />
      </button>
      <button onClick={() => c().toggleItalic().run()} className={btnCls(editor.isActive('italic'))} title="기울임">
        <Icon name="format_italic" size={17} />
      </button>
      <span className="mx-1 h-5 w-px bg-[#D8D8D0]" />
      <button onClick={() => c().toggleBulletList().run()} className={btnCls(editor.isActive('bulletList'))} title="글머리 기호">
        <Icon name="format_list_bulleted" size={17} />
      </button>
      <button onClick={() => c().toggleOrderedList().run()} className={btnCls(editor.isActive('orderedList'))} title="번호 목록">
        <Icon name="format_list_numbered" size={17} />
      </button>
      <span className="mx-1 h-5 w-px bg-[#D8D8D0]" />
      <button onClick={() => c().undo().run()} disabled={!editor.can().undo()} className={`${btnCls(false)} disabled:opacity-30`} title="실행 취소">
        <Icon name="undo" size={17} />
      </button>
      <button onClick={() => c().redo().run()} disabled={!editor.can().redo()} className={`${btnCls(false)} disabled:opacity-30`} title="다시 실행">
        <Icon name="redo" size={17} />
      </button>
    </div>
  );
}
