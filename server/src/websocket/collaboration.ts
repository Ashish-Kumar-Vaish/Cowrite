import { Server } from "@hocuspocus/server";
import * as Y from "yjs";
import { prisma } from "../config/db.js";
import { verifyToken } from "../config/jwt.js";
import type {
  onAuthenticatePayload,
  onLoadDocumentPayload,
  onStoreDocumentPayload,
} from "@hocuspocus/server";
import { Redis } from "@hocuspocus/extension-redis";
import { env } from "../config/env.js";
import { getChangeSummary } from "../utils/document.js";
import { logger } from "../config/logger.js";

const TWO_MINUTES = 2 * 60 * 1000;

export const collaborationServer = new Server({
  port: env.WS_PORT,
  debounce: 2000, // 2 seconds
  maxDebounce: 10000, // 10 seconds
  extensions: [
    new Redis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      options: {
        ...(env.REDIS_PASSWORD && { password: env.REDIS_PASSWORD }),
        ...(env.REDIS_PASSWORD && { tls: {} }),
        // Retry at most 3 seconds, then give up
        retryStrategy: (times) => {
          return Math.min(times * 500, 3000);
        },
        maxRetriesPerRequest: null, // Retry indefinitely per request
      },
    }),
  ],

  async onAuthenticate({
    token,
    documentName,
    connectionConfig,
  }: onAuthenticatePayload) {
    const document = await prisma.document.findUnique({
      where: { id: documentName },
      include: { collaborators: true },
    });

    if (!document) {
      logger.warn(
        { documentName },
        "Hocuspocus auth failed: document not found",
      );

      throw new Error("Document not found");
    }

    if (!token) {
      if (!document.isPublic) {
        logger.warn(
          { documentName },
          "Hocuspocus auth failed: document is not public",
        );

        throw new Error("Unauthorized");
      }

      // If the document is public allow anonymous access with read only
      connectionConfig.readOnly = true;
      return { userId: "anonymous" };
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch (error) {
      logger.warn(
        { err: error, documentName },
        "Hocuspocus auth failed: invalid token",
      );

      throw new Error("Unauthorized");
    }

    const userId = payload.id;
    const isOwner = document.ownerId === userId;
    const collaborator = document.collaborators.find(
      (c) => c.userId === userId,
    );
    const isCollaborator = !!collaborator;

    if (!document.isPublic && !isOwner && !isCollaborator) {
      logger.warn(
        { documentName, userId },
        "Hocuspocus auth failed: access denied",
      );

      throw new Error("Access denied");
    }

    if (collaborator?.role === "VIEWER") {
      connectionConfig.readOnly = true;
    }

    return { userId, documentTitle: document.title };
  },

  async onLoadDocument({ documentName, document }: onLoadDocumentPayload) {
    try {
      const doc = await prisma.document.findUnique({
        where: { id: documentName },
      });

      if (doc?.content) {
        const update = Buffer.from(doc.content, "base64");
        Y.applyUpdate(document, update);
      }
    } catch (error) {
      logger.error(
        { err: error, documentName },
        "Failed to load document content",
      );

      throw error;
    }
  },

  async onStoreDocument({
    documentName,
    document,
    lastContext,
  }: onStoreDocumentPayload) {
    try {
      const { userId, documentTitle } = lastContext as {
        userId: string;
        documentTitle: string;
      };

      // Skip storing if the user is anonymous
      // anonymous users can only read the document
      if (userId === "anonymous") {
        return;
      }

      const update = Y.encodeStateAsUpdate(document);
      const content = Buffer.from(update).toString("base64");

      // Update the document content in the database
      await prisma.document.update({
        where: { id: documentName },
        data: { content },
      });

      // Update the latest version if no version exists
      // or if the last version is older than 2 minutes
      const lastVersion = await prisma.documentVersion.findFirst({
        where: { documentId: documentName },
        orderBy: { createdAt: "desc" },
      });

      if (
        !lastVersion ||
        lastVersion.createdAt < new Date(Date.now() - TWO_MINUTES)
      ) {
        let prevDoc: Y.Doc | null = null;

        if (lastVersion?.content) {
          prevDoc = new Y.Doc();
          const prevUpdate = Buffer.from(lastVersion.content, "base64");
          Y.applyUpdate(prevDoc, prevUpdate);
        }

        await prisma.documentVersion.create({
          data: {
            documentId: documentName,
            authorId: userId,
            title: documentTitle,
            content,
            changeSummary: getChangeSummary(prevDoc, document),
          },
        });
      }
    } catch (error) {
      logger.error({ err: error, documentName }, "Failed to store document");

      throw error;
    }
  },
});
