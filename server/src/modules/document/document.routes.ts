import { Router } from "express";
import { documentController } from "./document.controller.js";
import { authenticate, optionalAuthenticate } from "../../middleware/auth.js";
import { validate, validateQuery } from "../../middleware/validate.js";

import {
  createDocumentSchema,
  UpdateDocumentTitleSchema,
  updateVisibilitySchema,
  addCollaboratorSchema,
  getAllDocumentsQuerySchema,
  paginationQuerySchema,
  exportQuerySchema,
} from "./document.schema.js";
import { exportLimiter } from "../../middleware/rateLimiter.js";

const router = Router();

router.get(
  "/",
  authenticate,
  validateQuery(getAllDocumentsQuerySchema),
  documentController.getAllDocuments,
);
router.get(
  "/recent",
  authenticate,
  validateQuery(paginationQuerySchema),
  documentController.getRecentDocuments,
);
router.post(
  "/",
  authenticate,
  validate(createDocumentSchema),
  documentController.createDocument,
);
router.get("/:id", optionalAuthenticate, documentController.getDocument);
router.put(
  "/:id",
  authenticate,
  validate(UpdateDocumentTitleSchema),
  documentController.UpdateDocumentTitle,
);
router.delete("/:id", authenticate, documentController.deleteDocument);
router.put(
  "/:id/visibility",
  authenticate,
  validate(updateVisibilitySchema),
  documentController.updateVisibility,
);
router.post(
  "/:id/collaborator",
  authenticate,
  validate(addCollaboratorSchema),
  documentController.addCollaborator,
);
router.delete(
  "/:id/collaborator/:userId",
  authenticate,
  documentController.removeCollaborator,
);
router.post("/export", authenticate, documentController.exportDocument);
router.get(
  "/:id/export",
  optionalAuthenticate,
  exportLimiter,
  validateQuery(exportQuerySchema),
  documentController.exportDocument,
);

export default router;
