import { Router } from "express";
import { versionController } from "./version.controller.js";
import { authenticate } from "../../middleware/auth.js";

const router = Router();

router.get("/:documentId", authenticate, versionController.getVersions);
router.put("/:id/restore", authenticate, versionController.restoreVersion);
router.delete("/:id", authenticate, versionController.deleteVersion);

export default router;
