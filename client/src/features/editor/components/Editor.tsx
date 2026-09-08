import { EditorContent } from "@tiptap/react";
import type { Editor as TiptapEditor } from "@tiptap/core";

interface EditorProps {
  editor: TiptapEditor | null;
  zoom: number;
}

export function Editor({ editor, zoom }: EditorProps) {
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 flex justify-center">
      <div
        style={{ zoom: zoom / 100 }}
        className="max-w-3xl w-full mx-auto bg-white border-2 border-black 
        shadow-[8px_8px_0_#000] min-h-[120vh] p-12"
      >
        <EditorContent
          editor={editor}
          className="prose max-w-none focus:outline-none"
        />
      </div>
    </div>
  );
}
