import { Router } from "express";
import { accessRequestController } from "./accessRequest.controller.js";
import { authenticate } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
  approveRequestSchema,
  requestAccessSchema,
} from "./accessRequest.schema.js";

const router = Router();

router.post(
  "/:documentId",
  authenticate,
  validate(requestAccessSchema),
  accessRequestController.requestAccess,
);
router.get(
  "/:documentId",
  authenticate,
  accessRequestController.getPendingRequests,
);
router.put(
  "/:id/approve",
  authenticate,
  validate(approveRequestSchema),
  accessRequestController.approveRequest,
);
router.put("/:id/deny", authenticate, accessRequestController.denyRequest);

export default router;
