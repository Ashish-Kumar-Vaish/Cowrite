import { useState } from "react";
import { useAuth } from "../../auth";
import { Input } from "../../../components/ui/Input";
import { Wand2, Trash2 } from "lucide-react";
import { Section } from "../../../components/ui/Section";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { useToast } from "../../../hooks/useToast";
import { userService } from "../user.service";
import { Button } from "../../../components/ui/Button";
import { ConfirmModal } from "../../../components/ui/ConfirmModal";

export function AiSettingsTab() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const hasKey = !!user?.geminiKeyHint;

  const handleSave = async () => {
    if (!apiKey.trim()) {
      return;
    }

    setLoading(true);

    try {
      const updated = await userService.updateGeminiApiKey(apiKey.trim());

      updateUser(updated);
      setApiKey("");
      toast("API key saved", "success");
    } catch (err) {
      toast(getErrorMessage(err, "Failed to save API key"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveKey = async () => {
    setLoading(true);

    try {
      const updated = await userService.updateGeminiApiKey(null);

      updateUser(updated);
      toast("API key removed", "success");
    } catch (err) {
      toast(getErrorMessage(err, "Failed to remove API key"), "error");
    } finally {
      setLoading(false);
      setShowRemoveConfirm(false);
    }
  };

  return (
    <>
      <Section title="Gemini API Key">
        <p className="text-sm font-medium">
          Add your own Gemini API key to use AI features with your personal
          quota. Get one free at{" "}
          <a
            href="https://aistudio.google.com/"
            target="_blank"
            rel="noreferrer"
            className="font-black text-blue-500 underline"
          >
            aistudio.google.com
          </a>
        </p>

        {hasKey ? (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest mb-1">
                Current Key
              </p>

              <p className="text-sm font-medium font-mono tracking-widest">
                {user?.geminiKeyHint ?? "•".repeat(32)}
              </p>
            </div>

            <Button
              className="btn-red"
              onClick={() => setShowRemoveConfirm(true)}
              disabled={loading}
            >
              <Trash2 size={14} />
              Remove
            </Button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Input
              placeholder="Enter your API key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onClear={() => setApiKey("")}
              type="text"
            />

            <Button
              className="btn-primary shrink-0"
              onClick={handleSave}
              disabled={loading || !apiKey.trim()}
            >
              <Wand2 size={14} />
              {loading ? "Saving..." : "Save API Key"}
            </Button>
          </div>
        )}
      </Section>

      <Section title="Usage">
        <p className="text-sm font-medium">
          {hasKey
            ? "Using your personal Gemini API key: your own quota applies."
            : "Using the app's shared Gemini API key: subject to rate limits."}
        </p>
      </Section>

      {showRemoveConfirm && (
        <ConfirmModal
          title="Remove API Key?"
          message="You can add a new key anytime. AI features will fall back to the shared app quota."
          confirmLabel="Remove"
          variant="warning"
          loading={loading}
          onConfirm={handleRemoveKey}
          onClose={() => setShowRemoveConfirm(false)}
        />
      )}
    </>
  );
}
