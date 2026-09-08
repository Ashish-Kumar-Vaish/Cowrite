import { useState } from "react";
import {
  X,
  RotateCcw,
  Trash2,
  Clock,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { versionService } from "../version.service";
import { useVersions } from "../hooks/useVersions";
import type { Version } from "../version.types";
import { Avatar } from "../../../components/ui/Avatar";
import { Loading } from "../../../components/ui/Loading";
import { ErrorMessage } from "../../../components/ui/ErrorMessage";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { Button } from "../../../components/ui/Button";
import { cn } from "../../../utils/cn";

interface VersionsSidebarProps {
  documentId: string;
  isOwner: boolean;
  onClose: () => void;
  onRestore: (version: Version) => void;
}

const groupVersionsByDate = (versions: Version[]) => {
  const groups: { [key: string]: Version[] } = {};

  const sortedVersions = [...versions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  sortedVersions.forEach((version) => {
    const date = new Date(version.createdAt);
    const dateKey = date.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }

    groups[dateKey].push(version);
  });

  return groups;
};

export function VersionsSidebar({
  documentId,
  isOwner,
  onClose,
  onRestore,
}: VersionsSidebarProps) {
  const { versions, loading, error, refetch } = useVersions(documentId, true);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleGroup = (date: string) => {
    setExpandedGroups((prev) => ({ ...prev, [date]: !prev[date] }));
  };

  const groupedVersions = groupVersionsByDate(versions);
  const dateKeys = Object.keys(groupedVersions);

  const handleRestore = async (version: Version) => {
    setRestoring(version.id);
    setActionError(null);

    try {
      await versionService.restoreVersion(version.id);
      onRestore(version);
    } catch (err) {
      setActionError(getErrorMessage(err, "Failed to restore"));
    } finally {
      setRestoring(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    setActionError(null);

    try {
      await versionService.deleteVersion(id);
      await refetch();
    } catch (err) {
      setActionError(getErrorMessage(err, "Failed to delete"));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/20" onClick={onClose} />

      <div
        className="fixed top-0 right-0 h-screen w-85 bg-amber-50 border-2 border-black z-50 
        flex flex-col"
      >
        <div
          className="border-b-3 border-black px-6 py-3 bg-black flex items-center 
          justify-between shrink-0"
        >
          <p className="text-xs font-black uppercase tracking-widest text-white">
            Version History
          </p>

          <button className="text-white/50 hover:text-white" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && <Loading />}

          {(error || actionError) && (
            <div className="p-4 flex flex-col gap-2">
              {error && <ErrorMessage message={error} />}
              {actionError && <ErrorMessage message={actionError} />}
            </div>
          )}

          {!loading && versions.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-12">
              <Clock size={20} className="text-black/20" />

              <p className="text-sm font-medium text-black/30 italic">
                No versions yet
              </p>
            </div>
          )}

          {!loading &&
            dateKeys.map((date) => {
              const dayVersions = groupedVersions[date];
              const mainVersion = dayVersions[0];
              const subVersions = dayVersions.slice(1);
              const isExpanded = expandedGroups[date] ?? false;

              return (
                <div key={date} className="flex flex-col">
                  <div
                    className="px-6 py-2 bg-amber-100 border-y border-black/20 sticky 
                    top-0 z-10"
                  >
                    <p className="text-2xs font-black uppercase tracking-widest text-black/50">
                      {date}
                    </p>
                  </div>

                  <div
                    className={cn(
                      "px-6 py-5 flex flex-col gap-3 transition-colors",
                      !isExpanded && "hover:bg-white/40",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          {subVersions.length > 0 && (
                            <button
                              onClick={() => toggleGroup(date)}
                              className="p-2 hover:bg-black/5 rounded transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronDown size={16} />
                              ) : (
                                <ChevronRight size={16} />
                              )}
                            </button>
                          )}

                          <p className="font-black text-sm leading-tight">
                            {mainVersion.title}
                          </p>
                        </div>

                        <p className="text-xs font-medium text-black/40 ml-7">
                          {new Date(mainVersion.createdAt).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </p>

                        {mainVersion.changeSummary && (
                          <p className="text-xs font-black text-violet-600 uppercase tracking-widest ml-7">
                            {mainVersion.changeSummary}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-7">
                      <Avatar
                        name={mainVersion.author.name}
                        avatar={mainVersion.author.avatar}
                        className="w-5 h-5 border border-black"
                      />

                      <p className="text-xs font-medium text-black/40">
                        {mainVersion.author.name}
                      </p>
                    </div>

                    <div className="flex gap-2 ml-7">
                      <Button
                        className="btn-secondary text-xs flex-1"
                        onClick={() => handleRestore(mainVersion)}
                        disabled={restoring === mainVersion.id}
                      >
                        <RotateCcw size={13} />
                        {restoring === mainVersion.id
                          ? "Restoring..."
                          : "Restore"}
                      </Button>

                      {isOwner && (
                        <Button
                          className="btn-red"
                          onClick={() => handleDelete(mainVersion.id)}
                          disabled={deleting === mainVersion.id}
                        >
                          <Trash2 size={13} />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Sub Versions */}
                  {isExpanded &&
                    subVersions.map((sub) => (
                      <div
                        key={sub.id}
                        className="ml-9 last:mb-2 pl-4 pr-6 py-4 flex flex-col gap-3 
                        relative border-l-3 border-yellow-400"
                      >
                        <div className="flex flex-col gap-1 ">
                          <p className="font-black text-sm leading-tight text-black/70">
                            {sub.title}
                          </p>

                          <p className="text-xs font-medium text-black/40">
                            {new Date(sub.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>

                          {sub.changeSummary && (
                            <p className="text-xs font-black text-black/50 uppercase tracking-widest">
                              {sub.changeSummary}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Avatar
                            name={sub.author.name}
                            avatar={sub.author.avatar}
                            className="w-5 h-5 border border-black"
                          />

                          <p className="text-xs font-medium text-black/40">
                            {sub.author.name}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            className="btn-secondary text-xs flex-1"
                            onClick={() => handleRestore(sub)}
                            disabled={restoring === sub.id}
                          >
                            <RotateCcw size={13} />
                            Restore
                          </Button>

                          {isOwner && (
                            <Button
                              className="btn-red"
                              onClick={() => handleDelete(sub.id)}
                              disabled={deleting === sub.id}
                            >
                              <Trash2 size={13} />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
}
