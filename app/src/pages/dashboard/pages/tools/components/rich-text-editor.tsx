import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  Link2Off,
  Undo2,
  Redo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

// Tools-only rich text editor for the Blog/Email body field — plain
// Twitter/LinkedIn hooks stay on the regular Textarea, since short-form
// social copy has no use for headings/lists/links. Content is stored and
// sent to the AI endpoints as HTML.
export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          HTMLAttributes: { class: "underline text-brass-ink" },
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: cn(
          "min-h-[220px] px-3 py-2 text-sm leading-relaxed focus-visible:outline-none",
          "[&_h1]:mt-2 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:mt-2 [&_h2]:text-lg [&_h2]:font-bold [&_h3]:mt-2 [&_h3]:text-base [&_h3]:font-semibold",
          "[&_p]:mt-2 first:[&_p]:mt-0 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mt-2 [&_ol]:list-decimal [&_ol]:pl-5",
          "[&_blockquote]:mt-2 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
          "[&_a]:underline",
        ),
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) editor.commands.setContent(value, { emitUpdate: false });
    // Only resync when the value changes from outside this editor (e.g. AI
    // revise/repurpose results) — not on every keystroke, which would
    // otherwise fight the editor's own cursor position.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  const isEmpty = editor.isEmpty;

  function toggleLink() {
    if (editor!.isActive("link")) {
      editor!.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt("Link URL");
    if (url) editor!.chain().focus().setLink({ href: url }).run();
  }

  return (
    <div className={cn("rounded-md border border-input bg-transparent shadow-sm", className)}>
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border p-1">
        <ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} label="Bold">
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} label="Italic">
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} label="Strikethrough">
          <Strikethrough className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          label="Heading"
        >
          <Heading2 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          label="Subheading"
        >
          <Heading3 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} label="Bullet list">
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} label="Numbered list">
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} label="Quote">
          <Quote className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("link")} onClick={toggleLink} label={editor.isActive("link") ? "Remove link" : "Add link"}>
          {editor.isActive("link") ? <Link2Off className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
        </ToolbarButton>
        <div className="mx-1 h-4 w-px bg-border" />
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} label="Undo">
          <Undo2 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} label="Redo">
          <Redo2 className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>

      <div className="relative">
        {isEmpty && placeholder && (
          <span className="pointer-events-none absolute left-3 top-2 text-sm text-muted-foreground">{placeholder}</span>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, active, label, children }: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      size="icon"
      variant={active ? "secondary" : "ghost"}
      className="h-7 w-7"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {children}
    </Button>
  );
}
