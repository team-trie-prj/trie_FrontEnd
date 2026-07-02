import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import EditorToolbar from './EditorToolbar';

interface Props {
  initialMarkdown: string;
  onChange: (markdown: string) => void;
}

/** FNC-REP-02 · TipTap 기반 위지윅 인라인 에디터 + 서식 툴바. */
export default function RichTextEditor({ initialMarkdown, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit, Markdown],
    content: initialMarkdown,
    onUpdate: ({ editor: e }) => {
      const md = (e.storage as { markdown: { getMarkdown: () => string } }).markdown.getMarkdown();
      onChange(md);
    },
    editorProps: {
      attributes: {
        'aria-label': '보고서 인라인 편집',
        class: 'outline-none min-h-[360px]',
      },
    },
  });

  return (
    <div>
      <EditorToolbar editor={editor} />
      <EditorContent
        editor={editor}
        className="report-doc cursor-text text-[13px] leading-[1.85] text-[#3C3C38] [&_h1]:mb-4 [&_h1]:border-b-2 [&_h1]:border-[#1A1A18] [&_h1]:pb-3 [&_h1]:text-center [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-[#1A1A18] [&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-[#1A1A18] [&_h3]:mb-1.5 [&_h3]:mt-4 [&_h3]:text-[13px] [&_h3]:font-bold [&_h3]:text-[#1A1A18] [&_p]:mb-2 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5"
      />
    </div>
  );
}
