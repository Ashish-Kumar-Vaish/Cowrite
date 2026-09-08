import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import documentRoutes from "./modules/document/document.routes.js";
import accessRequestRoutes from "./modules/accessRequest/accessRequest.routes.js";
import commentRoutes from "./modules/comment/comment.routes.js";
import versionRoutes from "./modules/version/version.routes.js";
import sharedLinkRoutes from "./modules/sharedLink/sharedLink.routes.js";
import aiRoutes from "./modules/ai/ai.routes.js";
import { aiLimiter } from "./middleware/rateLimiter.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/ai", aiLimiter, aiRoutes);
router.use("/user", userRoutes);
router.use("/document", documentRoutes);
router.use("/access-request", accessRequestRoutes);
router.use("/comment", commentRoutes);
router.use("/version", versionRoutes);
router.use("/shared-link", sharedLinkRoutes);

export default router;
