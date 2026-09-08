import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Quote,
  Undo,
  Redo,
  Minus,
  Plus,
  RotateCcw,
} from "lucide-react";
import type { Editor } from "@tiptap/react";
import { ToolbarButton } from "./ui/ToolbarButton";
import { useEditorState } from "@tiptap/react";
import { ImproveWritingButton } from "../../ai";

interface EditorToolbarProps {
  editor: Editor | null;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

export function EditorToolbar({
  editor,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}: EditorToolbarProps) {
  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      const e = ctx.editor;
      const ready = e && !e.isDestroyed;

      return {
        canUndo: ready ? e.can().undo() : false,
        canRedo: ready ? e.can().redo() : false,
        isBold: ready ? e.isActive("bold") : false,
        isItalic: ready ? e.isActive("italic") : false,
        isStrike: ready ? e.isActive("strike") : false,
        isH1: ready ? e.isActive("heading", { level: 1 }) : false,
        isH2: ready ? e.isActive("heading", { level: 2 }) : false,
        isH3: ready ? e.isActive("heading", { level: 3 }) : false,
        isBulletList: ready ? e.isActive("bulletList") : false,
        isOrderedList: ready ? e.isActive("orderedList") : false,
        isCodeBlock: ready ? e.isActive("codeBlock") : false,
        isBlockquote: ready ? e.isActive("blockquote") : false,
      };
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div
      className="flex gap-1 p-2 border-b-2 border-black bg-white z-10 overflow-x-auto
      sticky top-[calc(var(--navbar-height)+var(--document-header-height))]"
    >
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editorState?.isBold}
        icon={<Bold size={16} />}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editorState?.isItalic}
        icon={<Italic size={16} />}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editorState?.isStrike}
        icon={<Strikethrough size={16} />}
      />

      <div className="w-px bg-black mx-1" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editorState?.isH1}
        icon={<Heading1 size={16} />}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editorState?.isH2}
        icon={<Heading2 size={16} />}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editorState?.isH3}
        icon={<Heading3 size={16} />}
      />

      <div className="w-px bg-black mx-1" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editorState?.isBulletList}
        icon={<List size={16} />}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editorState?.isOrderedList}
        icon={<ListOrdered size={16} />}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editorState?.isCodeBlock}
        icon={<Code size={16} />}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editorState?.isBlockquote}
        icon={<Quote size={16} />}
      />

      <div className="w-px bg-black mx-1" />

      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editorState?.canUndo}
        icon={<Undo size={16} />}
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editorState?.canRedo}
        icon={<Redo size={16} />}
      />

      <div className="ml-auto flex items-center gap-1">
        <div className="w-px bg-black mx-1 h-full" />

        <ImproveWritingButton editor={editor} />

        <div className="w-px bg-black mx-1 h-full" />

        <ToolbarButton
          onClick={onZoomOut}
          icon={<Minus size={16} />}
          disabled={zoom <= 50}
        />

        <span className="font-bold text-sm w-12 text-center">{zoom}%</span>

        <ToolbarButton
          onClick={onZoomIn}
          icon={<Plus size={16} />}
          disabled={zoom >= 200}
        />
        <ToolbarButton
          onClick={onZoomReset}
          icon={<RotateCcw size={16} />}
          disabled={zoom === 100}
        />
      </div>
    </div>
  );
}
