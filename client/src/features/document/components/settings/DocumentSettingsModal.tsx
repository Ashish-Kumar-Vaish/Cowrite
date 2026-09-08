import { useState } from "react";
import { ShareTab } from "./ShareTab";
import { LinksTab } from "./LinksTab";
import { RequestsTab } from "./RequestsTab";
import { SettingsTab } from "./SettingsTab";
import type { Document } from "../../document.types";
import { X } from "lucide-react";
import { cn } from "../../../../utils/cn";
import { Button } from "../../../../components/ui/Button";

type Tab = "share" | "links" | "requests" | "settings";

interface DocumentSettingsModalProps {
  document: Document;
  onClose: () => void;
  onUpdate: (doc: Document) => void;
  onRefetch: () => Promise<void>;
}

export function DocumentSettingsModal({
  document,
  onClose,
  onUpdate,
  onRefetch,
}: DocumentSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("share");

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-lg p-0 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black">
          <h2 className="font-extrabold text-xl">Document Settings</h2>

          <Button className="btn-secondary" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b-2 border-black">
          {(["share", "links", "requests", "settings"] as Tab[]).map((tab) => (
            <button
              key={tab}
              className={cn(
                "flex-1 py-3 font-bold text-sm capitalize border-r-2 border-black last:border-r-0",
                activeTab === tab
                  ? "bg-green-400"
                  : "bg-white hover:bg-gray-50",
              )}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === "share" && (
            <ShareTab document={document} onRefetch={onRefetch} />
          )}

          {activeTab === "links" && <LinksTab document={document} />}

          {activeTab === "requests" && (
            <RequestsTab document={document} onRefetch={onRefetch} />
          )}

          {activeTab === "settings" && (
            <SettingsTab document={document} onUpdate={onUpdate} />
          )}
        </div>
      </div>
    </div>
  );
}
