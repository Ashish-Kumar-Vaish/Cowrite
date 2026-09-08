import { useState } from "react";
import { useDocuments } from "../hooks/useDocuments";
import { DocumentsList } from "../components/DocumentsList";
import { CreateDocumentModal } from "../components/CreateDocumentModal";
import { Loading } from "../../../components/ui/Loading";
import { useInfiniteScroll } from "../../../hooks/useInfiniteScroll";
import { ErrorMessage } from "../../../components/ui/ErrorMessage";
import { DocumentsFilter } from "../components/DocumentsFilter";
import { LayoutGrid, List, Plus } from "lucide-react";
import { TripleHoverButton } from "../../../components/ui/TripleHoverButton";
import { cn } from "../../../utils/cn";
import { DocumentsGrid } from "../components/DocumentsGrid";
import { useLocalStorageState } from "../../../hooks/useLocalStorageState";

export function DocumentsPage() {
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<"recent" | "mine" | "shared">("recent");
  const [view, setView] = useLocalStorageState<"list" | "grid">(
    "documents-view",
    "list",
  );
  const title =
    filter === "recent"
      ? "Recently Visited"
      : filter === "mine"
        ? "My Documents"
        : "Shared With Me";

  const { documents, loading, loadingMore, error, hasMore, total, loadMore } =
    useDocuments(filter);

  const observerRef = useInfiniteScroll(loadMore, hasMore, loadingMore);

  return (
    <div className="min-h-screen bg-emerald-50">
      <div className="border-b-4 border-black bg-green-300 px-6 py-10">
        <div className="max-w-6xl mx-auto flex items-end justify-between gap-6 flex-wrap">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-black/40 mb-3">
              All Documents
            </p>

            <h1
              className="serif leading-none text-black"
              style={{ fontSize: "clamp(2.5rem,7vw,5rem)" }}
            >
              Your library.
              <br />
              <span className="italic text-black/25">
                Everything in one place.
              </span>
            </h1>
          </div>

          <div className="flex items-end gap-6 flex-wrap">
            <div className="flex flex-col items-end gap-1">
              <p className="font-black text-5xl leading-none">{total}</p>

              <p className="text-xs font-black uppercase tracking-widest text-black/40">
                Documents
              </p>
            </div>

            <TripleHoverButton
              onClick={() => setShowModal(true)}
              className="font-bold"
            >
              <Plus size={24} strokeWidth={3} />
              New document
            </TripleHoverButton>
          </div>
        </div>
      </div>

      {/* FILTER */}
      <div
        className="border-b-4 border-black bg-white sm:px-6 
        sticky top-(--navbar-height) z-10"
      >
        <div className="max-w-6xl mx-auto">
          <DocumentsFilter filter={filter} onChange={setFilter} />
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {error && <ErrorMessage message={error} />}

        {loading && <Loading />}

        {!loading && (
          <div className="mb-10">
            <div className="flex justify-between mb-4 border-b-2 border-black pb-2">
              <h2 className="font-extrabold text-2xl">{title}</h2>

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
                onCreateClick={
                  filter === "mine" ? () => setShowModal(true) : undefined
                }
                emptyMessage={
                  filter === "recent"
                    ? "No recently visited documents"
                    : filter === "mine"
                      ? undefined
                      : "No shared documents"
                }
              />
            ) : (
              <DocumentsGrid
                documents={documents}
                onCreateClick={
                  filter === "mine" ? () => setShowModal(true) : undefined
                }
                emptyMessage={
                  filter === "recent"
                    ? "No recently visited documents"
                    : filter === "mine"
                      ? undefined
                      : "No shared documents"
                }
              />
            )}
          </div>
        )}

        {/* Infinite scroll sentinel div */}
        <div ref={observerRef} className="h-4" />

        {loadingMore && (
          <div className="flex justify-center py-6">
            <Loading />
          </div>
        )}
      </div>

      {showModal && <CreateDocumentModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
