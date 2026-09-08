import { useAuth } from "../../auth";
import { EditableField } from "../../../components/ui/EditableField";

interface ProfileFormProps {
  onSaveName: (val: string) => Promise<void>;
  onSaveUsername: (val: string) => Promise<void>;
  onSaveBio: (val: string) => Promise<void>;
}

export function ProfileForm({
  onSaveName,
  onSaveUsername,
  onSaveBio,
}: ProfileFormProps) {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col divide-y-2 divide-black">
      <div className="bg-white px-6 py-4">
        <EditableField label="Name" value={user.name} onSave={onSaveName} />
      </div>

      <div className="bg-white px-6 py-4">
        <EditableField
          label="Username"
          value={user.username}
          onSave={onSaveUsername}
          validate={(val) => {
            if (!/^[a-zA-Z0-9_]+$/.test(val)) {
              return "Username can only contain letters, numbers, and underscores";
            }
          }}
        />
      </div>

      <div className="bg-white px-6 py-4">
        <EditableField
          label="Bio"
          value={user.bio ?? ""}
          multiline
          onSave={onSaveBio}
        />
      </div>
    </div>
  );
}
