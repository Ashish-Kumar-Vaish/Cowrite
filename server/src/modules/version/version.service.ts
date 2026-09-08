import { Prisma } from "../../../generated/prisma/client.js";
import {
  assertEditAccess,
  assertOwnerAccess,
} from "../../access/documentAccess.js";
import { prisma } from "../../config/db.js";
import { logger } from "../../config/logger.js";
import { ForbiddenError, NotFoundError } from "../../error.js";
import { collaborationServer } from "../../websocket/collaboration.js";
import * as Y from "yjs";

export const versionService = {
  async getVersions(documentId: string, userId: string) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundError("Document not found");
    }

    const isOwner = document.ownerId === userId;
    const isCollaborator = await prisma.collaborator.findUnique({
      where: { documentId_userId: { documentId, userId } },
    });

    if (!isOwner && !isCollaborator) {
      throw new ForbiddenError("Access denied");
    }

    return prisma.documentVersion.findMany({
      where: { documentId },
      include: {
        author: {
          select: { id: true, name: true, username: true, avatar: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async restoreVersion(versionId: string, userId: string) {
    const version = await prisma.documentVersion.findUnique({
      where: { id: versionId },
      include: { document: true },
    });

    if (!version) {
      throw new NotFoundError("Version not found");
    }

    const documentId = version.documentId;

    await assertEditAccess(documentId, version.document, userId);

    const dateStr = new Date(version.createdAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const [restoredDocument] = await prisma.$transaction([
      prisma.document.update({
        where: { id: documentId },
        data: {
          content: version.content,
          title: version.title,
        },
      }),
      prisma.documentVersion.create({
        data: {
          documentId,
          authorId: userId,
          title: version.title,
          content: version.content,
          changeSummary: `Restored from version (${dateStr})`,
        },
      }),
    ]);

    const liveDoc = collaborationServer.hocuspocus?.documents.get(documentId);

    if (liveDoc) {
      try {
        const incomingYdoc = new Y.Doc();
        const update = Buffer.from(version.content, "base64");
        Y.applyUpdate(incomingYdoc, update);

        const fragment = liveDoc.getXmlFragment("default");
        const incomingFragment = incomingYdoc.getXmlFragment("default");

        liveDoc.transact(() => {
          fragment.delete(0, fragment.length);
          fragment.insert(
            0,
            incomingFragment.toArray().map((el) => el.clone()) as (
              | Y.XmlElement
              | Y.XmlText
            )[],
          );
        });

        incomingYdoc.destroy();
      } catch (syncError) {
        logger.error(
          { err: syncError, documentId, versionId },
          "Failed to sync restored version into live ydoc",
        );
      }
    }

    return restoredDocument;
  },

  async deleteVersion(versionId: string, userId: string) {
    const version = await prisma.documentVersion.findUnique({
      where: { id: versionId },
      include: { document: true },
    });

    if (!version) {
      throw new NotFoundError("Version not found");
    }

    assertOwnerAccess(version.document, userId);

    try {
      await prisma.documentVersion.delete({ where: { id: versionId } });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        throw new NotFoundError("Version not found");
      }

      throw err;
    }

    return { success: true };
  },
};
