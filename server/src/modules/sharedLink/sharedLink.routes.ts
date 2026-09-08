import { Router } from "express";
import { sharedLinkController } from "./sharedLink.controller.js";
import { authenticate } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { createSharedLinkSchema } from "./sharedLink.schema.js";

const router = Router();

router.get(
  "/join/:token",
  authenticate,
  sharedLinkController.getSharedLinkByToken,
);
router.post(
  "/join/:token",
  authenticate,
  sharedLinkController.joinViaSharedLink,
);
router.get("/:documentId", authenticate, sharedLinkController.getSharedLinks);
router.post(
  "/:documentId",
  authenticate,
  validate(createSharedLinkSchema),
  sharedLinkController.createSharedLink,
);
router.delete("/:id", authenticate, sharedLinkController.revokeSharedLink);

export default router;
