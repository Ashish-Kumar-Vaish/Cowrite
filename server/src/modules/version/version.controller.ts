import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../../middleware/auth.js";
import { versionService } from "./version.service.js";

export const versionController = {
  async getVersions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const versions = await versionService.getVersions(
        req.params.documentId as string,
        req.userId!,
      );

      return res.status(200).json(versions);
    } catch (error) {
      next(error);
    }
  },

  async restoreVersion(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const document = await versionService.restoreVersion(
        req.params.id as string,
        req.userId!,
      );

      return res.status(200).json(document);
    } catch (error) {
      next(error);
    }
  },

  async deleteVersion(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await versionService.deleteVersion(req.params.id as string, req.userId!);

      return res.status(200).json({ message: "Version deleted" });
    } catch (error) {
      next(error);
    }
  },
};
