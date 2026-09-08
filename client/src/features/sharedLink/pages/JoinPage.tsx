import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { sharedLinkService } from "../sharedLink.service";
import { Loading } from "../../../components/ui/Loading";
import { ErrorPage } from "../../../components/ErrorPage";
import { useAuth } from "../../auth";
import { FileText, UserRound, X, ArrowRight } from "lucide-react";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import { BrutalButton } from "../../../components/ui/BrutalButton";
import { cn } from "../../../utils/cn";

interface LinkInfo {
  documentId: string;
  documentTitle: string;
  role: "EDITOR" | "VIEWER";
  token: string;
}

export function JoinPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [linkInfo, setLinkInfo] = useState<LinkInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(`/join/${token}`)}`);
      return;
    }

    fetchLink();
  }, [token, user, authLoading]);

  const fetchLink = async () => {
    if (!token) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await sharedLinkService.getSharedLinkByToken(token);

      setLinkInfo({
        documentId: data.document.id,
        documentTitle: data.document.title,
        role: data.role,
        token: data.token,
      });
    } catch (err) {
      setError(getErrorMessage(err, "Invalid or expired link"));
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!token) {
      return;
    }

    setJoining(true);
    setError(null);

    try {
      await sharedLinkService.joinViaSharedLink(token);

      navigate(`/document/${linkInfo?.documentId}`, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Failed to join document"));
    } finally {
      setJoining(false);
    }
  };

  if (!token) {
    return <ErrorPage message="Requires invite token" />;
  }

  if (authLoading || loading) {
    return <Loading fullScreen />;
  }

  if (error) {
    return <ErrorPage message={error} />;
  }

  if (!linkInfo) {
    return <ErrorPage message="Link not found" />;
  }

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Header */}
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-black/40 mb-3">
            You've been invited
          </p>

          <h1 className="serif text-black text-[clamp(2rem,6vw,3rem)] leading-none">
            Join as a
            <br />
            <span
              className={cn(
                "italic",
                linkInfo.role === "EDITOR"
                  ? "text-yellow-500"
                  : "text-violet-400",
              )}
            >
              {linkInfo.role === "EDITOR" ? "Editor" : "Viewer"}
            </span>
          </h1>
        </div>

        {/* Document info */}
        <div className="flex items-center justify-between py-3 border-b border-black/10">
          <div className="flex items-center gap-3">
            <FileText size={18} className="text-black/40 shrink-0" />

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-black/40 mb-0.5">
                Document
              </p>

              <p className="font-black text-sm leading-tight">
                {linkInfo.documentTitle}
              </p>
            </div>
          </div>
        </div>

        {/* Joining as */}
        <div className="flex items-center justify-between py-3 border-b border-black/10">
          <div className="flex items-center gap-3">
            <UserRound size={18} className="text-black/40 shrink-0" />

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-black/40 mb-0.5">
                Joining as
              </p>

              <p className="font-black text-sm leading-tight">{user?.name}</p>

              <p className="text-xs font-medium text-black/40">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <BrutalButton
            className="bg-white flex-1 text-sm"
            onClick={() => navigate("/dashboard")}
            disabled={joining}
          >
            <X size={16} />
            Decline
          </BrutalButton>

          <BrutalButton
            className="bg-yellow-300 flex-1 text-sm"
            onClick={handleJoin}
            disabled={joining}
          >
            {joining ? (
              "Joining..."
            ) : (
              <>
                <ArrowRight size={15} />
                Join Document
              </>
            )}
          </BrutalButton>
        </div>
      </div>
    </div>
  );
}
