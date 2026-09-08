import { useParams } from "react-router-dom";
import { usePublicProfile } from "../hooks/usePublicProfile";
import { Loading } from "../../../components/ui/Loading";
import { ErrorPage } from "../../../components/ErrorPage";
import { ProfileHeader } from "../components/ProfileHeader";

export function UserPage() {
  const { username } = useParams<{ username: string }>();

  if (!username) {
    return <ErrorPage message="Username is required" />;
  }

  const { user, loading, error } = usePublicProfile(username);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorPage message={error} />;
  }

  if (!user) {
    return <ErrorPage message="User not found" />;
  }

  const memberSince = user.createdAt
    ? new Date(user.createdAt).getFullYear()
    : null;

  return (
    <div className="min-h-screen bg-amber-50">
      {/* HEADER */}
      <ProfileHeader
        label="Public Profile"
        name={user.name}
        username={user.username}
        avatar={user.avatar}
        bg="bg-violet-300"
        rightContent={
          memberSince && (
            <div className="flex flex-col items-end gap-1">
              <p className="font-black text-5xl leading-none">{memberSince}</p>

              <p className="text-xs font-black uppercase tracking-widest text-black/50">
                Member since
              </p>
            </div>
          )
        }
      />

      {/* BIO */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {user.bio ? (
          <p className="text-lg font-medium text-black leading-relaxed whitespace-pre-wrap">
            {user.bio}
          </p>
        ) : (
          <p className="text-base font-medium text-black/30 italic">
            No bio yet
          </p>
        )}
      </div>
    </div>
  );
}
