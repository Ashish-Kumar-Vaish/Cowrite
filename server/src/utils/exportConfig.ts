import { Mark, mergeAttributes } from "@tiptap/core";
import { getSchema } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";

// Mirrors client/src/features/editor/extensions/CommentMark.ts only needed
// here so the export schema recognizes "comment" marks stored in Y.Doc
const CommentMark = Mark.create({
  name: "comment",

  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-comment-id"),
        renderHTML: (attrs) => ({ "data-comment-id": attrs.commentId }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-comment-id]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        class: "comment-highlight",
      }),
      0,
    ];
  },
});

export const EXPORT_EXTENSIONS = [StarterKit, CommentMark];
export const exportSchema = getSchema(EXPORT_EXTENSIONS);

export const EXPORT_CSS = `
  * { 
    box-sizing: border-box; 
  }

  body {
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    color: #37352f;
    line-height: 1.6;
    overflow-wrap: break-word;
    word-break: break-word;
  }

  p, li, blockquote { 
    overflow-wrap: break-word; 
    word-break: break-word; 
  }

  h1 { 
    font-size: 2.2em; 
    border-bottom: 1px solid #eaeaea; 
    padding-bottom: .3em; 
  }

  h2 { 
    font-size: 1.8em; 
  }

  h3 { 
    font-size: 1.4em; 
  }

  blockquote {
    border-left: 3px solid #37352f;
    background: #faf9f7;
    padding: 8px 16px;
    margin: 1em 0;
    color: #505050;
    font-style: italic;
  }

  blockquote p { 
    margin: 0.3em 0; 
  }

  code {
    background: #f4f4f5;
    padding: 2px 5px;
    border-radius: 3px;
    font-family: ui-monospace, "SFMono-Regular", Consolas, monospace;
    font-size: 0.9em;
    overflow-wrap: break-word;
    word-break: break-word;
  }

  pre {
    background: #f7f6f3;
    border: 1px solid #e8e6e1;
    padding: 16px;
    border-radius: 6px;
    font-family: ui-monospace, "SFMono-Regular", Consolas, monospace;
    font-size: 0.9em;
    white-space: pre-wrap;
    overflow-wrap: break-word;
    word-break: break-word;
  }

  pre code {
    background: transparent;
    padding: 0;
    border-radius: 0;
  }
`;
