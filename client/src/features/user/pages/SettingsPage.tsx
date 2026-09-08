import { useState } from "react";
import { useAuth } from "../../auth";
import { Loading } from "../../../components/ui/Loading";
import {
  LogOut,
  Trash2,
  KeyRound,
  UserRound,
  Settings,
  ArrowLeft,
  Wand2,
} from "lucide-react";
import { AvatarUploader } from "../components/AvatarUploader";
import { DeleteAccountModal } from "../components/DeleteAccountModal";
import { ChangePasswordModal } from "../components/ChangePasswordModal";
import { ProfileForm } from "../components/ProfileForm";
import { Avatar } from "../../../components/ui/Avatar";
import { Section } from "../../../components/ui/Section";
import { ProfileHeader } from "../components/ProfileHeader";
import { TripleHoverButton } from "../../../components/ui/TripleHoverButton";
import { useNavigate } from "react-router-dom";
import { useProfileActions } from "../hooks/useProfileActions";
import { Button } from "../../../components/ui/Button";
import { AiSettingsTab } from "../components/AiSettingsTab";
import { cn } from "../../../utils/cn";
import { ConfirmModal } from "../../../components/ui/ConfirmModal";

const TABS = [
  {
    value: "public",
    label: "Public Profile",
    icon: UserRound,
    activeBg: "bg-violet-300",
    hoverBg: "hover:bg-violet-100",
  },
  {
    value: "account",
    label: "Account",
    icon: Settings,
    activeBg: "bg-yellow-300",
    hoverBg: "hover:bg-yellow-100",
  },
  {
    value: "ai",
    label: "AI",
    icon: Wand2,
    activeBg: "bg-lime-300",
    hoverBg: "hover:bg-lime-100",
  },
] as const;

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [selectedTab, setSelectedTab] = useState<"public" | "account" | "ai">(
    "public",
  );

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const {
    saveName,
    saveUsername,
    saveBio,
    uploadAvatar,
    changePassword,
    handleLogout,
    deleteAccount,
  } = useProfileActions();

  const handleConfirmLogout = async () => {
    setLoggingOut(true);

    try {
      await handleLogout();
      setShowLogoutConfirm(false);
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-amber-50">
      {/* HEADER */}
      <ProfileHeader
        label="Your Profile"
        name={user.name}
        username={user.username}
        avatar={user.avatar}
        bg="bg-black"
        dark
        rightContent={
          <TripleHoverButton
            onClick={() => navigate("/u/" + user.username)}
            className="bg-violet-300 text-black!"
            firstBlockClassName="!bg-violet-400"
            secondBlockClassName="!bg-violet-600"
          >
            <UserRound size={24} />
            View Public Profile
          </TripleHoverButton>
        }
      />

      {/* BODY */}
      <div className="max-w-6xl mx-auto md:px-6 pb-10 md:py-10">
        <div className="flex flex-col md:flex-row gap-6 md:items-start">
          {/* LEFT SIDEBAR */}
          <aside className="w-full md:w-56 shrink-0 md:sticky top-30 z-10">
            <div className="border-y-3 md:border-x-3 border-black md:shadow-[6px_6px_0_#000] overflow-hidden">
              <div className="hidden md:block border-b-3 border-black px-4 py-3 bg-black">
                <p className="text-xs font-black uppercase tracking-widest text-white/50">
                  Settings
                </p>
              </div>

              <div className="flex flex-col divide-y-2 divide-black">
                {TABS.map(({ value, label, icon: Icon, activeBg, hoverBg }) => {
                  const isActive = selectedTab === value;

                  return (
                    <button
                      key={value}
                      onClick={() => setSelectedTab(value)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 text-sm font-black transition-colors text-left w-full text-black",
                        isActive ? activeBg : cn("bg-white", hoverBg),
                      )}
                    >
                      <Icon size={16} strokeWidth={2.5} />
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Logout shortcut in sidebar */}
              <div className="border-t-2 border-black">
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-black w-full bg-white 
                  hover:bg-zinc-100 transition-colors text-black/50 hover:text-black"
                >
                  <LogOut size={16} strokeWidth={2.5} />
                  Logout
                </button>
              </div>
            </div>
          </aside>

          {/* RIGHT CONTENT */}
          <div className="flex-1 flex flex-col px-4 md:px-0 gap-6 min-w-0">
            {/* PUBLIC PROFILE TAB */}
            {selectedTab === "public" && (
              <>
                <Section title="Identity">
                  <div className="flex items-center gap-6">
                    <Avatar
                      name={user.name}
                      avatar={user.avatar}
                      className="w-20 h-20 shadow-[3px_3px_0_#000]"
                    />

                    <div>
                      <p className="font-black text-xl leading-tight">
                        {user.name}
                      </p>

                      <p className="text-sm font-medium text-black/40">
                        @{user.username}
                      </p>
                    </div>
                  </div>
                </Section>

                <Section title="Bio">
                  {user.bio ? (
                    <p className="text-base font-medium text-black leading-relaxed whitespace-pre-wrap">
                      {user.bio}
                    </p>
                  ) : (
                    <p className="text-base font-medium text-black/30 italic">
                      No bio yet. Switch to Account to add one.
                    </p>
                  )}
                </Section>
              </>
            )}

            {/* ACCOUNT TAB */}
            {selectedTab === "account" && (
              <>
                <Section title="Avatar">
                  <div className="flex items-center gap-6">
                    <AvatarUploader
                      avatar={user.avatar}
                      name={user.name}
                      onUpload={uploadAvatar}
                    />

                    <div className="flex items-center gap-1 text-black/40">
                      <ArrowLeft size={16} />

                      <p className="text-sm font-medium">Upload a new avatar</p>
                    </div>
                  </div>
                </Section>

                {/* Profile Info */}
                <div className="brutal-card overflow-hidden">
                  <div className="border-b-3 border-black px-6 py-3 bg-black">
                    <p className="text-xs font-black uppercase tracking-widest text-white/50">
                      Profile Info
                    </p>
                  </div>

                  <ProfileForm
                    onSaveName={saveName}
                    onSaveUsername={saveUsername}
                    onSaveBio={saveBio}
                  />
                </div>

                {/* Security */}
                <div className="brutal-card overflow-hidden">
                  <div className="border-b-3 border-black px-6 py-3 bg-black">
                    <p className="text-xs font-black uppercase tracking-widest text-white/50">
                      Security
                    </p>
                  </div>

                  <div className="flex flex-col divide-y-2 divide-black">
                    <div className="bg-white px-6 py-4">
                      <p className="text-xs font-black uppercase tracking-widest text-black/40 mb-1">
                        Email
                      </p>

                      <p className="text-sm font-medium text-black">
                        {user.email}
                      </p>
                    </div>

                    <div className="bg-white px-6 py-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-black/40 mb-1">
                          Password
                        </p>

                        <p className="text-sm font-medium text-black/30 tracking-widest">
                          {"*".repeat(8)}
                        </p>
                      </div>

                      <Button
                        className="btn-secondary"
                        onClick={() => setShowChangePassword(true)}
                      >
                        <KeyRound size={15} />
                        Change Password
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <Section title="Danger Zone" danger>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-red-500 mb-1">
                        Delete Account
                      </p>

                      <p className="text-sm text-black/50">
                        Permanent and irreversible. Download your data first.
                      </p>
                    </div>

                    <Button
                      className="btn-red"
                      onClick={() => setShowDeleteAccount(true)}
                    >
                      <Trash2 size={16} />
                      Delete
                    </Button>
                  </div>
                </Section>
              </>
            )}

            {/* AI */}
            {selectedTab === "ai" && <AiSettingsTab />}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showChangePassword && (
        <ChangePasswordModal
          onClose={() => setShowChangePassword(false)}
          onSubmit={changePassword}
        />
      )}

      {showLogoutConfirm && (
        <ConfirmModal
          title="Log Out"
          message="You'll need to sign in again to access your documents."
          confirmLabel="Log Out"
          variant="default"
          loading={loggingOut}
          onConfirm={handleConfirmLogout}
          onClose={() => setShowLogoutConfirm(false)}
        />
      )}

      {showDeleteAccount && (
        <DeleteAccountModal
          onClose={() => setShowDeleteAccount(false)}
          onConfirm={deleteAccount}
        />
      )}
    </div>
  );
}
