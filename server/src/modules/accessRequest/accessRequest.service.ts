import { Prisma } from "../../../generated/prisma/client.js";
import { assertOwnerAccess } from "../../access/documentAccess.js";
import { prisma } from "../../config/db.js";
import { logger } from "../../config/logger.js";
import { ConflictError, ForbiddenError, NotFoundError } from "../../error.js";
import { collaborationServer } from "../../websocket/collaboration.js";

export const accessRequestService = {
  async requestAccess(
    documentId: string,
    userId: string,
    requestedRole: "VIEWER" | "EDITOR" = "VIEWER",
  ) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundError("Document not found");
    }

    if (document.ownerId === userId) {
      throw new ForbiddenError("You are the owner");
    }

    const collaborator = await prisma.collaborator.findUnique({
      where: { documentId_userId: { documentId, userId } },
    });

    // Skip if the user is already a collaborator with the requested role
    if (collaborator && collaborator.role === requestedRole) {
      throw new ConflictError("You already have access");
    }

    const existing = await prisma.accessRequest.findUnique({
      where: { documentId_userId: { documentId, userId } },
    });

    if (existing) {
      if (existing.requestedRole === requestedRole) {
        if (existing.status === "PENDING") {
          throw new ConflictError("Access request already sent");
        }

        if (existing.status === "APPROVED") {
          throw new ConflictError("Access request already approved");
        }
      }

      // Irrespective of the requested role, if the existing request is DENIED
      // update it to PENDING with the new requested role
      if (existing.status === "DENIED") {
        return prisma.accessRequest.update({
          where: { id: existing.id },
          data: { status: "PENDING", requestedRole },
        });
      }
    }

    // Update or create only if no existing request is found
    return prisma.accessRequest.upsert({
      where: { documentId_userId: { documentId, userId } },
      update: { status: "PENDING", requestedRole },
      create: { documentId, userId, requestedRole },
    });
  },

  async getPendingRequests(documentId: string, ownerId: string) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundError("Document not found");
    }

    // Only the owner can view pending requests
    assertOwnerAccess(document, ownerId);

    return prisma.accessRequest.findMany({
      where: { documentId, status: "PENDING" },
      include: {
        user: {
          select: { id: true, name: true, username: true, avatar: true },
        },
      },
    });
  },

  async approveRequest(
    requestId: string,
    ownerId: string,
    role: "VIEWER" | "EDITOR",
  ) {
    const request = await prisma.accessRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundError("Request not found");
    }

    if (request.status !== "PENDING") {
      throw new ConflictError("Invalid request state");
    }

    const document = await prisma.document.findUnique({
      where: { id: request.documentId },
    });

    if (!document) {
      throw new NotFoundError("Document not found");
    }

    assertOwnerAccess(document, ownerId);

    const existingCollaborator = await prisma.collaborator.findUnique({
      where: {
        documentId_userId: {
          documentId: request.documentId,
          userId: request.userId,
        },
      },
    });

    if (existingCollaborator && existingCollaborator.role === role) {
      throw new ConflictError(`User is already a ${role}`);
    }

    try {
      // create collaborator and update request in one transaction
      await prisma.$transaction([
        prisma.collaborator.upsert({
          where: {
            documentId_userId: {
              documentId: request.documentId,
              userId: request.userId,
            },
          },
          update: { role },
          create: {
            documentId: request.documentId,
            userId: request.userId,
            role,
          },
        }),
        prisma.accessRequest.update({
          where: { id: requestId },
          data: { status: "APPROVED", requestedRole: role },
        }),
      ]);
    } catch (err) {
      // Only convert to a 409 if this is actually a unique-constraint
      // violation (P2002), anything else is a real failure and should
      // propagate as a 500
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new ConflictError("User already has access");
      }

      throw err;
    }

    try {
      if (collaborationServer.hocuspocus) {
        const liveDoc = collaborationServer.hocuspocus.documents.get(
          request.documentId,
        );

        if (liveDoc) {
          liveDoc.broadcastStateless(
            JSON.stringify({
              type: "ACCESS_UPDATED",
              userId: request.userId,
              role: role,
            }),
          );
        }
      }
    } catch (broadcastError) {
      logger.error(
        { err: broadcastError, documentId: request.documentId },
        "Failed to broadcast ACCESS_UPDATED",
      );
    }

    return { success: true };
  },

  async denyRequest(requestId: string, ownerId: string) {
    const request = await prisma.accessRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundError("Request not found");
    }

    if (request.status !== "PENDING") {
      throw new ConflictError("Invalid request state");
    }

    const document = await prisma.document.findUnique({
      where: { id: request.documentId },
    });

    if (!document) {
      throw new NotFoundError("Document not found");
    }

    assertOwnerAccess(document, ownerId);

    await prisma.accessRequest.update({
      where: { id: requestId },
      data: { status: "DENIED" },
    });

    return { success: true };
  },
};
