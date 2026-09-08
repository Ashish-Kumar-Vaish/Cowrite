import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { accessRequestService } from "../accessRequest.service";
import {
  FileText,
  ArrowLeft,
  Send,
  CheckCircle,
  UserRound,
} from "lucide-react";
import { ErrorMessage } from "../../../components/ui/ErrorMessage";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { Select } from "../../../components/ui/Select";
import { BrutalButton } from "../../../components/ui/BrutalButton";
import { cn } from "../../../utils/cn";
import { ErrorPage } from "../../../components/ErrorPage";

export function AccessRequestPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<"VIEWER" | "EDITOR">("VIEWER");

  if (!id) {
    return <ErrorPage message="Document ID is required" />;
  }

  const handleRequest = async () => {
    setRequesting(true);
    setError(null);

    try {
      await accessRequestService.requestAccess(id, role);
      setRequested(true);
    } catch (err) {
      setError(
        getErrorMessage(err, "Failed to request access. Please try again."),
      );
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Header */}
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-black/40 mb-3">
            Private Document
          </p>

          <h1 className="serif leading-none text-black text-[clamp(2rem,6vw,3rem)]">
            {requested ? "Request sent" : "Request"}
            <br />
            <span className="italic text-black/30">
              {requested ? "We'll let you know" : "access"}
            </span>
          </h1>
        </div>

        {error && <ErrorMessage message={error} />}

        {/* Info rows */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3 py-3 border-b border-black/10">
            <FileText size={18} className="text-black/40 shrink-0" />

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-black/40 mb-0.5">
                Document
              </p>

              <p className="font-black text-sm leading-tight">
                Private Document
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-black/10">
            <div className="flex items-center gap-3">
              <UserRound size={18} className="text-black/40 shrink-0" />

              <div>
                <p className="text-xs font-black uppercase tracking-widest text-black/40 mb-0.5">
                  Requesting as
                </p>

                <p className="font-black text-sm leading-tight">
                  {requested ? (role === "EDITOR" ? "Editor" : "Viewer") : null}
                </p>
              </div>
            </div>

            {!requested && (
              <Select
                value={role}
                onChange={(val) => setRole(val as "EDITOR" | "VIEWER")}
                options={[
                  { value: "VIEWER", label: "Viewer" },
                  { value: "EDITOR", label: "Editor" },
                ]}
              />
            )}
          </div>

          <div className="flex items-center gap-3 py-3 border-b border-black/10">
            <CheckCircle
              size={18}
              className={cn(
                "shrink-0",
                requested ? "text-lime-500" : "text-black/40",
              )}
            />

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-black/40 mb-0.5">
                Status
              </p>

              <p className="font-black text-sm leading-tight">
                {requested ? "Request pending approval" : "No access"}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        {!requested ? (
          <div className="flex gap-3">
            <BrutalButton
              className="bg-white flex-1 text-sm"
              onClick={() => navigate(-1)}
              disabled={requesting}
            >
              <ArrowLeft size={16} />
              Go Back
            </BrutalButton>

            <BrutalButton
              className="bg-yellow-300 flex-1 text-sm"
              onClick={handleRequest}
              disabled={requesting}
            >
              <Send size={16} />
              {requesting ? "Sending..." : "Request Access"}
            </BrutalButton>
          </div>
        ) : (
          <BrutalButton
            className="bg-white text-sm"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </BrutalButton>
        )}
      </div>
    </div>
  );
}
