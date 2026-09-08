import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import type { Editor } from "@tiptap/react";
import { aiService } from "../ai.service";
import { Button } from "../../../components/ui/Button";
import { useToast } from "../../../hooks/useToast";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { cn } from "../../../utils/cn";
import type { Transaction } from "@tiptap/pm/state";

const GeminiIcon = ({ size = 15 }: { size?: number | string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0"
  >
    <path
      d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z"
      fill="currentColor"
    />
  </svg>
);

export function ImproveWritingButton({ editor }: { editor: Editor | null }) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const handleImprove = async () => {
    if (!editor || editor.isDestroyed) {
      return;
    }

    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, " ");

    if (!selectedText.trim()) {
      return;
    }

    setLoading(true);
    // Setting the editor to read-only to prevent user from making changes
    // while AI service is processing, to avoid conflicts
    editor.setEditable(false);

    const pos = { from, to, insertPos: from };
    let hasDeletedOriginal = false;

    const handleTransaction = ({
      transaction,
    }: {
      transaction: Transaction;
    }) => {
      if (!transaction.docChanged || editor.isDestroyed) {
        return;
      }

      pos.from = transaction.mapping.map(pos.from);
      pos.to = transaction.mapping.map(pos.to);
      pos.insertPos = transaction.mapping.map(pos.insertPos);
    };

    editor.on("transaction", handleTransaction);

    const controller = new AbortController();
    abortRef.current = controller;

    const cleanup = () => {
      editor.off("transaction", handleTransaction);

      if (!editor.isDestroyed) {
        editor.setEditable(true);
      }

      abortRef.current = null;
    };

    try {
      await aiService.improveWriting(
        selectedText,
        (chunk) => {
          if (controller.signal.aborted || editor.isDestroyed) {
            return;
          }

          if (!hasDeletedOriginal) {
            editor
              .chain()
              .focus()
              .deleteRange({ from: pos.from, to: pos.to })
              .run();

            hasDeletedOriginal = true;
          }

          editor.chain().insertContentAt(pos.insertPos, chunk).run();
          pos.insertPos += chunk.length;
        },
        () => {
          if (!controller.signal.aborted) {
            toast("Improved writing successfully", "success");
          }

          cleanup();
          setLoading(false);
        },
        (err) => {
          if (!controller.signal.aborted) {
            toast(getErrorMessage(err, "Failed to improve writing"), "error");

            // On error restore the original text if it was deleted
            if (hasDeletedOriginal && !editor.isDestroyed) {
              editor
                .chain()
                .focus()
                .deleteRange({ from: pos.from, to: pos.insertPos })
                .insertContentAt(pos.from, selectedText)
                .run();
            }
          }

          cleanup();
          setLoading(false);
        },
        controller.signal,
      );
    } catch (err) {
      cleanup();
      setLoading(false);

      if (!controller.signal.aborted) {
        toast(getErrorMessage(err, "Failed to improve writing"), "error");
      }
    }
  };

  return (
    <Button
      className={cn(
        "btn-violet",
        loading || editor?.state.selection.empty ? "cursor-not-allowed" : "",
      )}
      onClick={handleImprove}
      disabled={loading || editor?.state.selection.empty}
      title="Improve selected text with AI"
    >
      {loading ? (
        <>
          <Loader2 size={15} className="animate-spin" />
          Improving...
        </>
      ) : (
        <>
          <GeminiIcon size={15} />
          Improve
        </>
      )}
    </Button>
  );
}
