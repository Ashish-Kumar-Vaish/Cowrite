import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../../middleware/auth.js";
import { documentService } from "./document.service.js";
import type {
  CreateDocumentInput,
  UpdateDocumentTitleInput,
  UpdateVisibilityInput,
  AddCollaboratorInput,
} from "./document.schema.js";

export const documentController = {
  async getAllDocuments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, filter } = req.validatedQuery as {
        page: number;
        limit: number;
        filter: "all" | "mine" | "shared";
      };

      const result = await documentService.getAllDocuments(
        req.userId!,
        page,
        limit,
        filter,
      );

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getRecentDocuments(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { page, limit } = req.validatedQuery as {
        page: number;
        limit: number;
      };

      const documents = await documentService.getRecentDocuments(
        req.userId!,
        page,
        limit,
      );

      return res.status(200).json(documents);
    } catch (error) {
      next(error);
    }
  },

  async getDocument(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const document = await documentService.getDocument(
        req.params.id as string,
        req.userId,
      );

      return res.status(200).json(document);
    } catch (error) {
      next(error);
    }
  },

  async createDocument(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateDocumentInput;

      const document = await documentService.createDocument(req.userId!, data);

      return res.status(201).json(document);
    } catch (error) {
      next(error);
    }
  },

  async UpdateDocumentTitle(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const data = req.body as UpdateDocumentTitleInput;

      const document = await documentService.UpdateDocumentTitle(
        req.params.id as string,
        req.userId!,
        data,
      );

      return res.status(200).json(document);
    } catch (error) {
      next(error);
    }
  },

  async deleteDocument(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await documentService.deleteDocument(
        req.params.id as string,
        req.userId!,
      );

      return res.status(200).json({ message: "Document deleted" });
    } catch (error) {
      next(error);
    }
  },

  async updateVisibility(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = req.body as UpdateVisibilityInput;

      const document = await documentService.updateVisibility(
        req.params.id as string,
        req.userId!,
        data,
      );

      return res.status(200).json(document);
    } catch (error) {
      next(error);
    }
  },

  async addCollaborator(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = req.body as AddCollaboratorInput;

      const collaborator = await documentService.addCollaborator(
        req.params.id as string,
        req.userId!,
        data,
      );

      return res.status(201).json(collaborator);
    } catch (error) {
      next(error);
    }
  },

  async removeCollaborator(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      await documentService.removeCollaborator(
        req.params.id as string,
        req.userId!,
        req.params.userId as string,
      );

      return res.status(200).json({ message: "Collaborator removed" });
    } catch (error) {
      next(error);
    }
  },

  async exportDocument(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const documentId = req.params.id as string;
      const { format } = req.validatedQuery as { format: "pdf" | "docx" };

      const buffer =
        format === "pdf"
          ? await documentService.exportAsPdf(documentId, req.userId)
          : await documentService.exportAsDocx(documentId, req.userId);

      const contentType =
        format === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

      res.setHeader("Content-Type", contentType);

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="document.${format}"`, // filename is changed at frontend
      );

      res.send(buffer);
    } catch (error) {
      next(error);
    }
  },
};
