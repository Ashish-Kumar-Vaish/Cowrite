import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../../middleware/auth.js";
import { accessRequestService } from "./accessRequest.service.js";
import type {
  ApproveRequestInput,
  RequestAccessInput,
} from "./accessRequest.schema.js";

export const accessRequestController = {
  async requestAccess(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { requestedRole } = req.body as RequestAccessInput;

      const result = await accessRequestService.requestAccess(
        req.params.documentId as string,
        req.userId!,
        requestedRole,
      );

      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getPendingRequests(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await accessRequestService.getPendingRequests(
        req.params.documentId as string,
        req.userId!,
      );

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async approveRequest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { role } = req.body as ApproveRequestInput;

      await accessRequestService.approveRequest(
        req.params.id as string,
        req.userId!,
        role,
      );

      return res.status(200).json({ message: "Request approved" });
    } catch (error) {
      next(error);
    }
  },

  async denyRequest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await accessRequestService.denyRequest(
        req.params.id as string,
        req.userId!,
      );

      return res.status(200).json({ message: "Request denied" });
    } catch (error) {
      next(error);
    }
  },
};
