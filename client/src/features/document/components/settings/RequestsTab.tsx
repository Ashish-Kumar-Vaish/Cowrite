import { useEffect, useState } from "react";
import {
  accessRequestService,
  type AccessRequest,
} from "../../../accessRequest";
import type { Document } from "../../document.types";
import { ErrorMessage } from "../../../../components/ui/ErrorMessage";
import { Avatar } from "../../../../components/ui/Avatar";
import { Loading } from "../../../../components/ui/Loading";
import { Check, X, Inbox } from "lucide-react";
import { Select } from "../../../../components/ui/Select";
import { getErrorMessage } from "../../../../utils/getErrorMessage";
import { Button } from "../../../../components/ui/Button";

interface RequestsTabProps {
  document: Document;
  onRefetch: () => Promise<void>;
}

export function RequestsTab({ document, onRefetch }: RequestsTabProps) {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<
    Record<string, "EDITOR" | "VIEWER">
  >({});

  useEffect(() => {
    fetchPendingRequests();
  }, [document.id]);

  const fetchPendingRequests = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await accessRequestService.getPendingRequests(document.id);
      setRequests(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load requests"));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    setError(null);

    const request = requests.find((r) => r.id === requestId);
    const role = selectedRoles[requestId] ?? request?.requestedRole ?? "VIEWER";

    try {
      await accessRequestService.approveRequest(requestId, role);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));

      await onRefetch();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to approve"));
    }
  };

  const handleDeny = async (requestId: string) => {
    setError(null);

    try {
      await accessRequestService.denyRequest(requestId);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to deny"));
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col gap-6">
      {error && <ErrorMessage message={error} />}

      <p className="text-xs font-black uppercase tracking-widest text-black/40">
        Pending Requests
      </p>

      {requests.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6">
          <Inbox size={20} className="text-black/20" />

          <p className="text-sm font-medium text-black/30 italic">
            No pending requests
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {requests.map((request) => (
            <div
              key={request.id}
              className="flex items-start justify-between py-2 gap-4"
            >
              <div className="flex gap-3">
                <Avatar
                  name={request.user.name}
                  avatar={request.user.avatar}
                  className="w-9 h-9 shadow-[2px_2px_0_#000]"
                />

                <div className="flex flex-col gap-1">
                  <p className="font-black text-sm leading-tight">
                    {request.user.name}
                  </p>

                  <p className="text-xs font-medium text-black/40">
                    @{request.user.username}
                  </p>

                  <p className="text-xs font-black uppercase tracking-widest mt-1">
                    <span className="text-black/30">Requested: </span>

                    <span
                      className={
                        request.requestedRole === "EDITOR"
                          ? "text-yellow-600"
                          : "text-violet-600"
                      }
                    >
                      {request.requestedRole}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Select
                  value={selectedRoles[request.id] ?? request.requestedRole}
                  onChange={(val) =>
                    setSelectedRoles((prev) => ({
                      ...prev,
                      [request.id]: val as "EDITOR" | "VIEWER",
                    }))
                  }
                  options={[
                    { value: "VIEWER", label: "Viewer" },
                    { value: "EDITOR", label: "Editor" },
                  ]}
                />

                <Button
                  className="btn-secondary"
                  onClick={() => handleApprove(request.id)}
                >
                  <Check size={14} />
                </Button>

                <Button
                  className="btn-red"
                  onClick={() => handleDeny(request.id)}
                >
                  <X size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
