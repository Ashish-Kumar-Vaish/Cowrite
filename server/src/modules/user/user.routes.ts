import { Router } from "express";
import { userController } from "./user.controller.js";
import { authenticate } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
  updateProfileSchema,
  updateEmailSchema,
  updatePasswordSchema,
  updateGeminiApiKeySchema,
} from "./user.schema.js";
import { searchLimiter } from "../../middleware/rateLimiter.js";
import {
  parseAvatarUpload,
  verifyAvatarContent,
} from "../../middleware/upload.js";

const router = Router();

router.get(
  "/search",
  authenticate,
  searchLimiter,
  userController.searchByEmail,
);
router.get("/:username", userController.getPublicProfile);
router.put(
  "/me",
  authenticate,
  validate(updateProfileSchema),
  userController.updateProfile,
);
router.put(
  "/me/avatar",
  authenticate,
  parseAvatarUpload,
  verifyAvatarContent,
  userController.updateAvatar,
);
router.put(
  "/me/email",
  authenticate,
  validate(updateEmailSchema),
  userController.updateEmail,
);
router.put(
  "/me/password",
  authenticate,
  validate(updatePasswordSchema),
  userController.updatePassword,
);
router.put(
  "/gemini-key",
  authenticate,
  validate(updateGeminiApiKeySchema),
  userController.updateGeminiApiKey,
);
router.delete("/me", authenticate, userController.deleteAccount);

export default router;
