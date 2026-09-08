import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../../middleware/auth.js";
import { sharedLinkService } from "./sharedLink.service.js";
import type { CreateSharedLinkInput } from "./sharedLink.schema.js";

export const sharedLinkController = {
  async createSharedLink(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateSharedLinkInput;

      const link = await sharedLinkService.createSharedLink(
        req.params.documentId as string,
        req.userId!,
        data,
      );

      return res.status(201).json(link);
    } catch (error) {
      next(error);
    }
  },

  async getSharedLinks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const links = await sharedLinkService.getSharedLinks(
        req.params.documentId as string,
        req.userId!,
      );

      return res.status(200).json(links);
    } catch (error) {
      next(error);
    }
  },

  async joinViaSharedLink(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await sharedLinkService.joinViaSharedLink(
        req.params.token as string,
        req.userId!,
      );

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getSharedLinkByToken(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const link = await sharedLinkService.getSharedLinkByToken(
        req.params.token as string,
      );

      return res.status(200).json(link);
    } catch (error) {
      next(error);
    }
  },

  async revokeSharedLink(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await sharedLinkService.revokeSharedLink(
        req.params.id as string,
        req.userId!,
      );

      return res.status(200).json({ message: "Link revoked" });
    } catch (error) {
      next(error);
    }
  },
};
