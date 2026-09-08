import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import type { HocuspocusProvider } from "@hocuspocus/provider";
import type * as Y from "yjs";
import { useAuth } from "../../auth/hooks/useAuth";
import { generateColor } from "../../../utils/generateColor";
import { CommentMark } from "../extensions/CommentMark";
import { PendingCommentHighlight } from "../extensions/PendingCommentHighlight";

interface UseDocumentEditorOptions {
  ydoc: Y.Doc;
  provider: HocuspocusProvider | null;
  editable?: boolean;
  collaborative?: boolean;
  showCursors?: boolean;
}

export function useDocumentEditor({
  ydoc,
  provider,
  editable = true,
  collaborative = true,
  showCursors = false,
}: UseDocumentEditorOptions) {
  const { user } = useAuth();

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          undoRedo: collaborative ? false : undefined,
        }),
        ...(collaborative
          ? [
              Collaboration.configure({ document: ydoc }),
              ...(provider && showCursors
                ? [
                    CollaborationCaret.configure({
                      provider,
                      user: {
                        name: user?.name ?? "Anonymous",
                        color: generateColor(user?.id ?? "Anonymous").hex,
                      },
                    }),
                  ]
                : []),
            ]
          : []),
        ...(CommentMark ? [CommentMark] : []),
        PendingCommentHighlight,
      ],
      editable,
      immediatelyRender: false,
    },
    [provider, editable, collaborative],
  );

  return editor;
}
