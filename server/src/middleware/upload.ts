import multer from "multer";
import { fileTypeFromBuffer } from "file-type";
import type { Request, Response, NextFunction } from "express";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_AVATAR_SIZE },
  fileFilter: (_req, file, cb) => {
    // Filter on the client-reported type, not trusted
    // alone but rejects obviously wrong uploads
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only jpg, png, webp allowed"));
    }
  },
});

export const parseAvatarUpload = avatarUpload.single("avatar");

export async function verifyAvatarContent(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.file) {
    return next();
  }

  const detected = await fileTypeFromBuffer(req.file.buffer);

  if (!detected || !ALLOWED_MIME_TYPES.includes(detected.mime)) {
    return res
      .status(400)
      .json({ message: "Invalid or unsupported file content" });
  }

  next();
}
