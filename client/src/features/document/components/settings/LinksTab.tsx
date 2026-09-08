import { useEffect, useState } from "react";
import { sharedLinkService, type SharedLink } from "../../../sharedLink";
import type { Document } from "../../document.types";
import { ErrorMessage } from "../../../../components/ui/ErrorMessage";
import { Loading } from "../../../../components/ui/Loading";
import { Copy, Check, Trash, Link, Plus } from "lucide-react";
import { Select } from "../../../../components/ui/Select";
import { cn } from "../../../../utils/cn";
import { getErrorMessage } from "../../../../utils/getErrorMessage";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";

interface LinksTabProps {
  document: Document;
}

export function LinksTab({ document }: LinksTabProps) {
  const [links, setLinks] = useState<SharedLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [role, setRole] = useState<"EDITOR" | "VIEWER">("VIEWER");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetchSharedLinks();
  }, [document.id]);

  const fetchSharedLinks = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await sharedLinkService.getSharedLinks(document.id);
      setLinks(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load shared links"));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    setError(null);

    try {
      const link = await sharedLinkService.createSharedLink(
        document.id,
        role,
        expiresAt || undefined,
      );

      setLinks((prev) => [link, ...prev]);
      setExpiresAt("");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create link"));
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await sharedLinkService.revokeSharedLink(id);
      setLinks((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to revoke link"));
    }
  };

  const handleCopy = (token: string) => {
    const url = `${window.location.origin}/join/${token}`;
    navigator.clipboard.writeText(url);

    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col gap-6">
      {error && <ErrorMessage message={error} />}

      {/* GENERATE LINK */}
      <div className="flex flex-col gap-4">
        <p className="text-xs font-black uppercase tracking-widest text-black/40">
          Generate Invite Link
        </p>

        <div className="flex flex-col divide-y-2 divide-black border-2 border-black">
          {/* Role */}
          <div className="bg-white px-4 py-3 flex items-center justify-between gap-4">
            <p className="text-xs font-black uppercase tracking-widest text-black/40">
              Role
            </p>

            <Select
              value={role}
              onChange={(val) => setRole(val as "EDITOR" | "VIEWER")}
              options={[
                { value: "VIEWER", label: "Viewer" },
                { value: "EDITOR", label: "Editor" },
              ]}
            />
          </div>

          {/* Expiry */}
          <div className="bg-white px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <p className="text-xs font-black uppercase tracking-widest text-black/40">
                Expiry
              </p>

              <p className="text-xs font-medium text-black/30">Optional</p>
            </div>

            <Input
              type="datetime-local"
              wrapperClassName="w-fit"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>
        </div>

        <Button
          className="btn-primary"
          onClick={handleCreate}
          disabled={creating}
        >
          <Plus size={15} />

          {creating ? "Generating..." : "Generate Link"}
        </Button>
      </div>

      {/* ACTIVE LINKS */}
      <div className="flex flex-col gap-4">
        <p className="text-xs font-black uppercase tracking-widest text-black/40">
          Active Links
        </p>

        {links.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6">
            <Link size={20} className="text-black/20" />

            <p className="text-sm font-medium text-black/30 italic">
              No active links
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {links.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between py-2"
              >
                <div className="flex flex-col gap-1">
                  <span
                    className={cn(
                      "text-xs font-black uppercase tracking-widest",
                      link.role === "EDITOR"
                        ? "text-yellow-600"
                        : "text-violet-600",
                    )}
                  >
                    {link.role}
                  </span>

                  {link.expiresAt ? (
                    <p className="text-xs font-medium text-black/40">
                      Expires {new Date(link.expiresAt).toLocaleDateString()}
                    </p>
                  ) : (
                    <p className="text-xs font-medium text-black/30 italic">
                      No expiry
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    className="btn-secondary"
                    onClick={() => handleCopy(link.token)}
                  >
                    {copied === link.token ? (
                      <Check size={14} />
                    ) : (
                      <Copy size={14} />
                    )}
                    {copied === link.token ? "Copied!" : "Copy"}
                  </Button>

                  <Button
                    className="btn-red"
                    onClick={() => handleRevoke(link.id)}
                  >
                    <Trash size={14} />
                    Revoke
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
