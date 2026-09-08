import { prisma } from "../../config/db.js";
import { ConflictError, NotFoundError, ValidationError } from "../../error.js";
import type {
  CreateDocumentInput,
  UpdateDocumentTitleInput,
  UpdateVisibilityInput,
  AddCollaboratorInput,
} from "./document.schema.js";
import * as Y from "yjs";
import { yXmlFragmentToProseMirrorRootNode } from "y-prosemirror";
import { generateHTML } from "@tiptap/html";
import { Document as DocxDocument, Packer } from "docx";
import { getBrowser } from "../../lib/browser.js";
import { proseMirrorJsonToDocxChildren } from "../../utils/prosemirrorToDocx.js";
import { logger } from "../../config/logger.js";
import {
  EXPORT_EXTENSIONS,
  exportSchema,
  EXPORT_CSS,
} from "../../utils/exportConfig.js";
import {
  assertEditAccess,
  assertOwnerAccess,
  assertReadAccess,
} from "../../access/documentAccess.js";
import { Prisma } from "../../../generated/prisma/client.js";

export const documentService = {
  async getAllDocuments(
    userId: string,
    page: number = 1,
    limit: number = 20,
    filter: "all" | "mine" | "shared" = "all",
  ) {
    const skip = (page - 1) * limit;

    const where =
      filter === "mine"
        ? { ownerId: userId }
        : filter === "shared"
          ? { collaborators: { some: { userId } } }
          : {
              OR: [
                { ownerId: userId },
                { collaborators: { some: { userId } } },
              ],
            };

    const [documents, total] = await prisma.$transaction([
      prisma.document.findMany({
        where,
        select: {
          id: true,
          title: true,
          isPublic: true,
          ownerId: true,
          createdAt: true,
          updatedAt: true,
          owner: {
            select: { id: true, name: true, username: true, avatar: true },
          },
          collaborators: {
            select: {
              role: true,
              user: {
                select: { id: true, name: true, username: true, avatar: true },
              },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.document.count({ where }),
    ]);

    return {
      documents,
      total,
      hasMore: skip + limit < total,
    };
  },

  async getRecentDocuments(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const [total, views] = await prisma.$transaction([
      prisma.documentView.count({
        where: { userId },
      }),
      prisma.documentView.findMany({
        where: { userId },
        orderBy: { viewedAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    const documentIds = views.map((view) => view.documentId);

    const documents = await prisma.document.findMany({
      where: { id: { in: documentIds } },
      include: {
        owner: {
          select: { id: true, name: true, username: true, avatar: true },
        },
        collaborators: {
          select: {
            role: true,
            user: {
              select: { id: true, name: true, username: true, avatar: true },
            },
          },
        },
      },
    });

    const documentMap = new Map(
      documents.map((document) => [document.id, document]),
    );

    const orderedDocuments = documentIds
      .map((id) => documentMap.get(id))
      .filter((doc): doc is NonNullable<typeof doc> => doc !== undefined);

    return {
      documents: orderedDocuments,
      total,
      hasMore: skip + limit < total,
    };
  },

  async getDocument(documentId: string, userId?: string) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        owner: {
          select: { id: true, name: true, username: true, avatar: true },
        },
        collaborators: {
          include: {
            user: {
              select: { id: true, name: true, username: true, avatar: true },
            },
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundError("Document not found");
    }

    await assertReadAccess(documentId, document, userId);

    if (userId) {
      // Allows only one view per user per document
      await prisma.documentView.upsert({
        where: { documentId_userId: { documentId, userId } },
        update: { viewedAt: new Date() },
        create: { documentId, userId },
      });
    }

    return document;
  },

  async createDocument(userId: string, data: CreateDocumentInput) {
    return prisma.$transaction(async (tx) => {
      const document = await tx.document.create({
        data: {
          title: data.title ?? "Untitled",
          ownerId: userId,
        },
      });

      await tx.documentView.create({
        data: { documentId: document.id, userId },
      });

      return document;
    });
  },

  async UpdateDocumentTitle(
    documentId: string,
    userId: string,
    data: UpdateDocumentTitleInput,
  ) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundError("Document not found");
    }

    await assertEditAccess(documentId, document, userId);

    return prisma.document.update({
      where: { id: documentId },
      data: { title: data.title ?? document.title },
    });
  },

  async deleteDocument(documentId: string, userId: string) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundError("Document not found");
    }

    assertOwnerAccess(document, userId);

    await prisma.document.delete({ where: { id: documentId } });
  },

  async updateVisibility(
    documentId: string,
    userId: string,
    data: UpdateVisibilityInput,
  ) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundError("Document not found");
    }

    assertOwnerAccess(document, userId);

    return prisma.document.update({
      where: { id: documentId },
      data: { isPublic: data.isPublic },
    });
  },

  async addCollaborator(
    documentId: string,
    ownerId: string,
    data: AddCollaboratorInput,
  ) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundError("Document not found");
    }

    assertOwnerAccess(document, ownerId);

    if (data.userId === ownerId) {
      throw new ValidationError("Owner cannot be a collaborator");
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { id: true },
    });

    if (!targetUser) {
      throw new NotFoundError("User not found");
    }

    try {
      return await prisma.collaborator.create({
        data: { documentId, userId: data.userId, role: data.role },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new ConflictError("User is already a collaborator");
      }

      throw err;
    }
  },

  async removeCollaborator(
    documentId: string,
    ownerId: string,
    collaboratorUserId: string,
  ) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundError("Document not found");
    }

    assertOwnerAccess(document, ownerId);

    const collaborator = await prisma.collaborator.findUnique({
      where: { documentId_userId: { documentId, userId: collaboratorUserId } },
    });

    if (!collaborator) {
      throw new NotFoundError("Collaborator not found");
    }

    return prisma.$transaction(async (tx) => {
      await tx.collaborator.delete({
        where: {
          documentId_userId: { documentId, userId: collaboratorUserId },
        },
      });

      await tx.accessRequest.deleteMany({
        where: { documentId, userId: collaboratorUserId },
      });

      return { success: true };
    });
  },

  async exportAsPdf(documentId: string, userId?: string): Promise<Buffer> {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundError("Document not found");
    }

    await assertReadAccess(documentId, document, userId);

    const ydoc = new Y.Doc();

    Y.applyUpdate(ydoc, Buffer.from(document.content, "base64"));

    const node = yXmlFragmentToProseMirrorRootNode(
      ydoc.getXmlFragment("default"),
      exportSchema,
    );

    const bodyHtml = generateHTML(node.toJSON(), EXPORT_EXTENSIONS);

    const browser = await getBrowser();
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();

    await page.route("**/*", (route) => route.abort());

    try {
      await page.setContent(
        `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>${EXPORT_CSS}</style>
          </head>
          <body>${bodyHtml}</body>
        </html>`,
        { waitUntil: "load" },
      );

      return await page.pdf({
        format: "Letter",
        printBackground: true,
        margin: { top: "1in", bottom: "1in", left: "1in", right: "1in" },
      });
    } catch (err) {
      logger.error({ err }, "Error exporting PDF");

      throw err;
    } finally {
      await context.close();
    }
  },

  async exportAsDocx(documentId: string, userId?: string): Promise<Buffer> {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundError("Document not found");
    }

    await assertReadAccess(documentId, document, userId);

    const ydoc = new Y.Doc();

    Y.applyUpdate(ydoc, Buffer.from(document.content, "base64"));

    const node = yXmlFragmentToProseMirrorRootNode(
      ydoc.getXmlFragment("default"),
      exportSchema,
    );

    const doc = new DocxDocument({
      numbering: {
        config: [
          {
            reference: "default-numbering",
            levels: [
              { level: 0, format: "decimal", text: "%1.", alignment: "start" },
            ],
          },
        ],
      },
      sections: [{ children: proseMirrorJsonToDocxChildren(node.toJSON()) }],
    });

    return Packer.toBuffer(doc);
  },
};
