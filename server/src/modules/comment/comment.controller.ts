import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../../middleware/auth.js";
import { commentService } from "./comment.service.js";
import type {
  CreateCommentInput,
  UpdateCommentInput,
} from "./comment.schema.js";

export const commentController = {
  async getComments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const comments = await commentService.getComments(
        req.params.documentId as string,
        req.userId!,
      );

      return res.status(200).json(comments);
    } catch (error) {
      next(error);
    }
  },

  async createComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateCommentInput;

      const comment = await commentService.createComment(
        req.params.documentId as string,
        req.userId!,
        data,
      );

      return res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  },

  async updateComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = req.body as UpdateCommentInput;

      const comment = await commentService.updateComment(
        req.params.id as string,
        req.userId!,
        data,
      );

      return res.status(200).json(comment);
    } catch (error) {
      next(error);
    }
  },

  async deleteComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await commentService.deleteComment(req.params.id as string, req.userId!);

      return res.status(200).json({ message: "Comment deleted" });
    } catch (error) {
      next(error);
    }
  },

  async resolveComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const comment = await commentService.resolveComment(
        req.params.id as string,
        req.userId!,
      );

      return res.status(200).json(comment);
    } catch (error) {
      next(error);
    }
  },
};
