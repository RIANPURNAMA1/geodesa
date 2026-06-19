import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';

const btn = 'p-1.5 rounded-md transition-colors text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed';
const btnActive = 'bg-emerald-100 text-emerald-700';

const MenuButton = ({ onClick, active, disabled, children, title }) => (
  <button type="button" onClick={onClick} disabled={disabled}
    className={`${btn} ${active ? btnActive : ''}`} title={title}>
    {children}
  </button>
);

const Divider = () => <span className="w-px h-4 bg-gray-200 mx-0.5" />;

const Icon = ({ children }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const BoldIcon = () => <Icon><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /></Icon>;
const ItalicIcon = () => <Icon><path d="M19 4h-9M14 20H5M15 4L9 20" /></Icon>;
const UnderlineIcon = () => <Icon><path d="M6 3v7a6 6 0 0 0 12 0V3" /><path d="M4 21h16" /></Icon>;
const StrikeIcon = () => <Icon><path d="M6 12h12" /><path d="M9.5 5.5A3.5 3.5 0 0 1 17 6" /><path d="M14.5 18.5A3.5 3.5 0 0 1 7 18" /></Icon>;
const SupIcon = () => <Icon><path d="M4 19l8-14M12 19l-8-14" /><path d="M20 5h-4m4 0v3m-1-3v3" /></Icon>;
const SubIcon = () => <Icon><path d="M4 19l8-14M12 19l-8-14" /><path d="M20 19v-3a2 2 0 0 0-2-2 2 2 0 0 0-2 2v3" /></Icon>;

const H1Icon = () => <Icon fill="currentColor" stroke="none"><text x="3" y="18" fontSize="16" fontWeight="bold" fill="currentColor">H₁</text></Icon>;
const H2Icon = () => <Icon fill="currentColor" stroke="none"><text x="3" y="18" fontSize="16" fontWeight="bold" fill="currentColor">H₂</text></Icon>;
const H3Icon = () => <Icon fill="currentColor" stroke="none"><text x="3" y="18" fontSize="16" fontWeight="bold" fill="currentColor">H₃</text></Icon>;
const H4Icon = () => <Icon fill="currentColor" stroke="none"><text x="3" y="18" fontSize="16" fontWeight="bold" fill="currentColor">H₄</text></Icon>;

const BulletIcon = () => <Icon><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="3" cy="6" r="1" fill="currentColor" stroke="none" /><circle cx="3" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="3" cy="18" r="1" fill="currentColor" stroke="none" /></Icon>;
const OrderedIcon = () => <Icon><path d="M8 6h13M8 12h13M8 18h13" /><text x="1" y="10" fontSize="9" fontWeight="bold" fill="currentColor">1</text><text x="1" y="16" fontSize="9" fontWeight="bold" fill="currentColor">2</text><text x="1" y="22" fontSize="9" fontWeight="bold" fill="currentColor">3</text></Icon>;

const QuoteIcon = () => <Icon fill="currentColor" stroke="none"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" /></Icon>;
const CodeIcon = () => <Icon><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></Icon>;
const HrIcon = () => <Icon><path d="M3 12h18" /></Icon>;

const AlignLeftIcon = () => <Icon><path d="M17 6H3M17 12H3M15 18H3M21 18h-2" /></Icon>;
const AlignCenterIcon = () => <Icon><path d="M17 6H7M19 12H5M15 18H9M21 18h-2" /></Icon>;
const AlignRightIcon = () => <Icon><path d="M21 6H7M21 12H7M21 18H9M21 18h-2" /></Icon>;

const HighlightIcon = () => <Icon><path d="M9 11l3 3L22 4l-3-3-6 6-4 4z" /><path d="M21 21v-7M3 21h18M3 3l18 18" /></Icon>;
const LinkIcon = () => <Icon><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></Icon>;
const UnlinkIcon = () => <Icon><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /><path d="M2 2l20 20" /></Icon>;
const ClearIcon = () => <Icon><path d="M17 2l-8 20M7 7h14" /></Icon>;
const UndoIcon = () => <Icon><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></Icon>;
const RedoIcon = () => <Icon><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></Icon>;

export default function RichTextEditor({ value, onChange, placeholder, className, minH = '200px' }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Underline,
      Superscript,
      Subscript,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight,
      Placeholder.configure({
        placeholder: placeholder || 'Tulis deskripsi...',
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (html !== (value || '')) onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'rte-content',
        style: `min-height: ${minH}`,
      },
    },
  });

  const addLink = () => {
    const url = window.prompt('Masukkan URL link:');
    if (url && editor) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  const clearFormat = () => {
    if (!editor) return;
    editor.chain().focus().clearNodes().unsetAllMarks().run();
  };

  if (!editor) return null;

  return (
    <div className={`rte-wrapper ${className || ''}`}>
      <div className="rte-toolbar">
        {/* ---- Text Formatting ---- */}
        <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (Ctrl+B)">
          <BoldIcon />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (Ctrl+I)">
          <ItalicIcon />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline (Ctrl+U)">
          <UnderlineIcon />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
          <StrikeIcon />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} title="Superscript (X²)">
          <SupIcon />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} title="Subscript (X₂)">
          <SubIcon />
        </MenuButton>

        <Divider />

        {/* ---- Heading ---- */}
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">
          <H1Icon />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
          <H2Icon />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
          <H3Icon />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} active={editor.isActive('heading', { level: 4 })} title="Heading 4">
          <H4Icon />
        </MenuButton>

        <Divider />

        {/* ---- List ---- */}
        <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
          <BulletIcon />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered List">
          <OrderedIcon />
        </MenuButton>

        <Divider />

        {/* ---- Blocks ---- */}
        <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
          <QuoteIcon />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code Block">
          <CodeIcon />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
          <HrIcon />
        </MenuButton>

        <Divider />

        {/* ---- Alignment ---- */}
        <MenuButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left">
          <AlignLeftIcon />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align Center">
          <AlignCenterIcon />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align Right">
          <AlignRightIcon />
        </MenuButton>

        <Divider />

        {/* ---- Highlight + Link ---- */}
        <MenuButton onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Highlight">
          <HighlightIcon />
        </MenuButton>
        <MenuButton onClick={addLink} active={editor.isActive('link')} title="Insert Link">
          <LinkIcon />
        </MenuButton>
        {editor.isActive('link') && (
          <MenuButton onClick={() => editor.chain().focus().unsetLink().run()} title="Remove Link">
            <UnlinkIcon />
          </MenuButton>
        )}

        <div className="ml-auto flex items-center gap-0.5">
          <MenuButton onClick={clearFormat} title="Clear Formatting">
            <ClearIcon />
          </MenuButton>
          <span className="w-px h-4 bg-gray-200 mx-0.5" />
          <MenuButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)">
            <UndoIcon />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Y)">
            <RedoIcon />
          </MenuButton>
        </div>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
