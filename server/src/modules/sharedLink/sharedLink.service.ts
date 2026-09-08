import { Prisma } from "../../../generated/prisma/client.js";
import { assertOwnerAccess } from "../../access/documentAccess.js";
import { prisma } from "../../config/db.js";
import { ConflictError, NotFoundError } from "../../error.js";
import type { CreateSharedLinkInput } from "./sharedLink.schema.js";

export const sharedLinkService = {
  async createSharedLink(
    documentId: string,
    userId: string,
    data: CreateSharedLinkInput,
  ) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundError("Document not found");
    }

    assertOwnerAccess(document, userId);

    return prisma.sharedLink.create({
      data: {
        documentId,
        createdById: userId,
        role: data.role,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
  },

  async getSharedLinks(documentId: string, userId: string) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundError("Document not found");
    }

    assertOwnerAccess(document, userId);

    return prisma.sharedLink.findMany({
      where: { documentId },
      orderBy: { createdAt: "desc" },
    });
  },

  async getSharedLinkByToken(token: string) {
    const link = await prisma.sharedLink.findUnique({
      where: { token },
      include: {
        document: {
          select: { id: true, title: true },
        },
      },
    });

    if (!link) {
      throw new NotFoundError("Invalid link");
    }

    if (link.expiresAt && link.expiresAt < new Date()) {
      throw new NotFoundError("Invalid link");
    }

    return link;
  },

  async joinViaSharedLink(token: string, userId: string) {
    const link = await prisma.sharedLink.findUnique({
      where: { token },
      include: {
        document: {
          select: { id: true, title: true, ownerId: true },
        },
      },
    });

    if (!link) {
      throw new NotFoundError("Invalid link");
    }

    if (link.expiresAt && link.expiresAt < new Date()) {
      throw new NotFoundError("Invalid link");
    }

    // Owner doesn't need to join their own doc
    if (link.document.ownerId === userId) {
      return { documentId: link.document.id };
    }

    // Already a collaborator so just redirect to the document
    const existing = await prisma.collaborator.findUnique({
      where: {
        documentId_userId: { documentId: link.documentId, userId },
      },
    });

    if (existing) {
      // Upgrade role if link has higher access
      if (existing.role !== link.role && link.role === "EDITOR") {
        await prisma.collaborator.update({
          where: { documentId_userId: { documentId: link.documentId, userId } },
          data: { role: link.role },
        });
      }

      return { documentId: link.document.id };
    }

    try {
      await prisma.collaborator.create({
        data: {
          documentId: link.documentId,
          userId,
          role: link.role,
        },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new ConflictError("Already a collaborator");
      }

      throw err;
    }

    return { documentId: link.document.id };
  },

  async revokeSharedLink(linkId: string, userId: string) {
    const link = await prisma.sharedLink.findUnique({
      where: { id: linkId },
      include: { document: true },
    });

    if (!link) {
      throw new NotFoundError("Link not found");
    }

    assertOwnerAccess(link.document, userId);

    await prisma.sharedLink.delete({ where: { id: linkId } });

    return { success: true };
  },
};
