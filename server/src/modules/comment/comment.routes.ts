import { Router } from "express";
import { commentController } from "./comment.controller.js";
import { authenticate } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { createCommentSchema, updateCommentSchema } from "./comment.schema.js";

const router = Router();

router.get("/:documentId", authenticate, commentController.getComments);
router.post(
  "/:documentId",
  authenticate,
  validate(createCommentSchema),
  commentController.createComment,
);
router.put(
  "/:id",
  authenticate,
  validate(updateCommentSchema),
  commentController.updateComment,
);
router.delete("/:id", authenticate, commentController.deleteComment);
router.put("/:id/resolve", authenticate, commentController.resolveComment);

export default router;
