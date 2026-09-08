import { Router } from "express";
import { aiController } from "./ai.controller.js";
import { authenticate } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { improveWritingSchema } from "./ai.schema.js";

const router = Router();

router.post(
  "/improve",
  authenticate,
  validate(improveWritingSchema),
  aiController.improveWriting,
);

export default router;
