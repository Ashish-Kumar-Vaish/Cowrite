import { useEffect, useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Avatar } from "../../../components/ui/Avatar";
import { useToast } from "../../../hooks/useToast";
import { getErrorMessage } from "../../../utils/getErrorMessage";

interface AvatarUploaderProps {
  avatar?: string | null;
  name: string;
  onUpload: (file: File) => Promise<void>;
}

export function AvatarUploader({
  avatar,
  name,
  onUpload,
}: AvatarUploaderProps) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast("Please upload an image", "error");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    try {
      setUploading(true);
      await onUpload(file);
    } catch (err) {
      setPreview(null);
      toast(getErrorMessage(err, "Failed to upload image"), "error");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (avatar && preview) {
      setPreview(null);
    }
  }, [avatar]);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const src = preview ?? avatar;

  return (
    <div
      className="relative w-fit cursor-pointer group"
      onClick={() => fileInputRef.current?.click()}
    >
      <Avatar
        name={name}
        avatar={src}
        className="w-20 h-20 shadow-[3px_3px_0_#000]"
      />

      <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Camera size={20} className="text-white" />
      </div>

      {uploading && (
        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
          <Loader2 size={18} className="animate-spin text-white" />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
