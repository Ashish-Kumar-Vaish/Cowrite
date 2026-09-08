import { useState } from "react";
import { userService } from "../../../user/user.service";
import { documentService } from "../../document.service";
import type { Document } from "../../document.types";
import type { UserSearchResult } from "../../../user/user.types";
import { Avatar } from "../../../../components/ui/Avatar";
import { ErrorMessage } from "../../../../components/ui/ErrorMessage";
import { Search, UserMinus, UserPlus, Users } from "lucide-react";
import { Select } from "../../../../components/ui/Select";
import { getErrorMessage } from "../../../../utils/getErrorMessage";
import { cn } from "../../../../utils/cn";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";

interface ShareTabProps {
  document: Document;
  onRefetch: () => Promise<void>;
}

export function ShareTab({ document, onRefetch }: ShareTabProps) {
  const [email, setEmail] = useState("");
  const [searchResult, setSearchResult] = useState<UserSearchResult | null>(
    null,
  );
  const [selectedRole, setSelectedRole] = useState<"EDITOR" | "VIEWER">(
    "VIEWER",
  );
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!email) {
      return;
    }

    setSearching(true);
    setError(null);
    setSearchResult(null);

    try {
      const user = await userService.searchByEmail(email);

      setSearchResult(user);
    } catch (err) {
      setError(getErrorMessage(err, "User not found"));
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = async () => {
    if (!searchResult) {
      return;
    }

    setAdding(true);
    setError(null);

    try {
      await documentService.addCollaborator(
        document.id,
        searchResult.id,
        selectedRole,
      );

      await onRefetch();
      setSearchResult(null);
      setEmail("");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to add collaborator"));
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (userId: string) => {
    try {
      await documentService.removeCollaborator(document.id, userId);
      await onRefetch();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to remove collaborator"));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* SEARCH */}
      <div className="flex flex-col gap-4">
        <p className="text-xs font-black uppercase tracking-widest text-black/40">
          Add Collaborator
        </p>

        <div className="flex flex-col divide-y-2 divide-black border-2 border-black">
          {/* Email input row */}
          <div className="bg-white px-4 py-3 flex items-center justify-between gap-4">
            <p className="text-xs font-black uppercase tracking-widest text-black/40 shrink-0">
              Email
            </p>

            <Input
              className="border-none shadow-none focus:shadow-none placeholder:text-black/20"
              placeholder="name@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              onClear={() => setEmail("")}
            />
          </div>

          {/* Role row */}
          <div className="bg-white px-4 py-3 flex items-center justify-between gap-4">
            <p className="text-xs font-black uppercase tracking-widest text-black/40">
              Role
            </p>

            <Select
              value={selectedRole}
              onChange={(val) => setSelectedRole(val as "EDITOR" | "VIEWER")}
              options={[
                { value: "VIEWER", label: "Viewer" },
                { value: "EDITOR", label: "Editor" },
              ]}
            />
          </div>
        </div>

        <Button
          className="btn-primary"
          onClick={handleSearch}
          disabled={searching}
        >
          <Search size={16} />

          {searching ? "Searching..." : "Search"}
        </Button>

        {error && <ErrorMessage message={error} />}
      </div>

      {/* SEARCH RESULT */}
      {searchResult && (
        <div className="flex flex-col gap-4">
          <p className="text-xs font-black uppercase tracking-widest text-black/40">
            Result
          </p>

          <div className="border-2 border-black">
            <div className="bg-white px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar
                  name={searchResult.name}
                  avatar={searchResult.avatar}
                  className="w-9 h-9 shadow-[2px_2px_0_#000]"
                />

                <div>
                  <p className="font-black text-sm leading-tight">
                    {searchResult.name}
                  </p>

                  <p className="text-xs font-medium text-black/40">
                    @{searchResult.username}
                  </p>
                </div>
              </div>

              <Button
                className="btn-primary gap-2"
                onClick={handleAdd}
                disabled={adding}
              >
                <UserPlus size={16} />

                {adding ? "Adding..." : "Add"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* COLLABORATORS */}
      <div className="flex flex-col gap-4">
        <p className="text-xs font-black uppercase tracking-widest text-black/40">
          Collaborators
        </p>

        {(document.collaborators ?? []).length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6">
            <Users size={20} className="text-black/20" />

            <p className="text-sm font-medium text-black/30 italic">
              No collaborators yet
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {document.collaborators.map((c) => (
              <div
                key={c.user.id}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    name={c.user.name}
                    avatar={c.user.avatar}
                    className="w-9 h-9 shadow-[2px_2px_0_#000]"
                  />

                  <div>
                    <p className="font-black text-sm leading-tight">
                      {c.user.name}
                    </p>

                    <p className="text-xs font-medium text-black/40">
                      @{c.user.username}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "text-xs font-black uppercase tracking-widest",
                      c.role === "EDITOR"
                        ? "text-yellow-600"
                        : "text-violet-600",
                    )}
                  >
                    {c.role}
                  </span>

                  <Button
                    className="btn-red gap-2"
                    onClick={() => handleRemove(c.user.id)}
                  >
                    <UserMinus size={16} />
                    Remove
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
