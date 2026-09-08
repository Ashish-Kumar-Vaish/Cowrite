import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth";
import {
  DocumentsList,
  DocumentsGrid,
  CreateDocumentModal,
  useDocuments,
} from "../../document";
import { Loading } from "../../../components/ui/Loading";
import { ErrorMessage } from "../../../components/ui/ErrorMessage";
import {
  ArrowRight,
  Plus,
  FileText,
  Clock,
  Users,
  LayoutGrid,
  List,
} from "lucide-react";
import { TripleHoverButton } from "../../../components/ui/TripleHoverButton";
import { cn } from "../../../utils/cn";
import { useLocalStorageState } from "../../../hooks/useLocalStorageState";

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useLocalStorageState<"list" | "grid">(
    "documents-view",
    "list",
  );

  const {
    documents,
    loading,
    error,
    total: recentTotal,
  } = useDocuments("recent");
  // TODO: make a separate endpoint for documents count
  const { total: sharedTotal } = useDocuments("shared");
  const { total: myTotal } = useDocuments("all");

  if (!user) {
    return null;
  }

  const firstName = user.name.split(" ")[0];

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="border-b-4 border-black bg-black px-6 py-10">
        <div className="max-w-6xl mx-auto flex items-end justify-between gap-6 flex-wrap">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-3">
              Dashboard
            </p>

            <h1
              className="serif text-white leading-none"
              style={{ fontSize: "clamp(2.5rem,7vw,5rem)" }}
            >
              Hey, {firstName} :)
              <br />
              <span className="italic text-white/25">Let's get to work.</span>
            </h1>
          </div>

          <TripleHoverButton
            onClick={() => setShowModal(true)}
            className="border-white font-bold"
            firstBlockClassName="!bg-gray-300"
            secondBlockClassName="!bg-gray-600"
          >
            <Plus size={24} strokeWidth={3} />
            New document
          </TripleHoverButton>
        </div>
      </div>

      {/* STAT STRIP */}
      <div className="border-b-4 border-black bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-3 divide-x-4 divide-black">
          {[
            {
              icon: Clock,
              label: "Recently visited",
              value: documents.length,
              bg: "hover:bg-pink-300",
            },
            {
              icon: FileText,
              label: "Total documents",
              value: myTotal,
              bg: "hover:bg-yellow-300",
            },
            {
              icon: Users,
              label: "Collaborations",
              value: sharedTotal,
              bg: "hover:bg-lime-200",
            },
          ].map(({ icon: Icon, label, value, bg }, i) => (
            <div
              key={i}
              className={cn(
                "px-6 py-6 flex items-center gap-4 transition-colors duration-100 cursor-default",
                bg,
              )}
            >
              <Icon
                size={20}
                strokeWidth={2.5}
                className="shrink-0 text-black/40"
              />

              <div>
                <p className="font-black text-3xl leading-none">{value}</p>

                <p
                  className="hidden sm:block text-xs font-black uppercase tracking-widest
                  text-black/40 mt-1"
                >
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {error && <ErrorMessage message={error} />}

        {loading && <Loading />}

        {!loading && (
          <div className="mb-10">
            <div className="flex justify-between mb-4 border-b-2 border-black pb-2">
              <h2 className="font-extrabold text-2xl">Recently Visited</h2>

              {documents.length > 0 && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setView("list")}
                    className={cn(
                      "p-1.5 rounded transition-colors",
                      view === "list"
                        ? "bg-zinc-800 text-gray-200"
                        : "text-gray-400 hover:text-zinc-800 hover:bg-black/5",
                    )}
                  >
                    <List size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setView("grid")}
                    className={cn(
                      "p-1.5 rounded transition-colors",
                      view === "grid"
                        ? "bg-zinc-800 text-gray-200"
                        : "text-gray-400 hover:text-zinc-800 hover:bg-black/5",
                    )}
                  >
                    <LayoutGrid size={16} />
                  </button>
                </div>
              )}
            </div>

            {view === "list" ? (
              <DocumentsList
                documents={documents}
                onCreateClick={() => setShowModal(true)}
                emptyMessage="No recently visited documents"
              />
            ) : (
              <DocumentsGrid
                documents={documents}
                onCreateClick={() => setShowModal(true)}
                emptyMessage="No recently visited documents"
              />
            )}
          </div>
        )}

        <div className="mt-8 flex items-start justify-end sm:justify-between">
          <p
            className="hidden sm:block text-xs font-black uppercase tracking-widest 
            text-black/30"
          >
            Showing {documents.length} of {recentTotal} documents
          </p>

          <TripleHoverButton
            onClick={() => navigate("/documents")}
            firstBlockClassName="!bg-red-200"
          >
            <span>View All Documents ({recentTotal})</span>

            <ArrowRight size={24} />
          </TripleHoverButton>
        </div>
      </div>

      {showModal && <CreateDocumentModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
