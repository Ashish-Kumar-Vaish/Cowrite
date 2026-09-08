import { Extension } from "@tiptap/core";
import type { Editor } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

interface PendingRange {
  from: number;
  to: number;
}

// Only Decorative, not included in Y.Doc like CommentMark
const pendingCommentPluginKey = new PluginKey<{ range: PendingRange | null }>(
  "pendingCommentHighlight",
);

export function setPendingCommentRange(
  editor: Editor,
  from: number,
  to: number,
) {
  editor.view.dispatch(
    editor.state.tr.setMeta(pendingCommentPluginKey, { from, to }),
  );
}

export function clearPendingCommentRange(editor: Editor) {
  editor.view.dispatch(editor.state.tr.setMeta(pendingCommentPluginKey, null));
}

export const PendingCommentHighlight = Extension.create({
  name: "pendingCommentHighlight",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: pendingCommentPluginKey,
        state: {
          init() {
            return { range: null as PendingRange | null };
          },

          apply(tr, value) {
            const meta = tr.getMeta(pendingCommentPluginKey);

            if (meta !== undefined) {
              return { range: meta as PendingRange | null };
            }

            if (value.range && tr.docChanged) {
              const from = tr.mapping.map(value.range.from);
              const to = tr.mapping.map(value.range.to);

              return { range: from < to ? { from, to } : null };
            }

            return value;
          },
        },
        props: {
          decorations(state) {
            const pluginState = pendingCommentPluginKey.getState(state);

            if (!pluginState?.range) {
              return DecorationSet.empty;
            }

            const { from, to } = pluginState.range;

            return DecorationSet.create(state.doc, [
              Decoration.inline(from, to, {
                class: "comment-pending-highlight",
              }),
            ]);
          },
        },
      }),
    ];
  },
});
