import { Prisma } from "../../../generated/prisma/client.js";
import { assertReadAccess } from "../../access/documentAccess.js";
import { prisma } from "../../config/db.js";
import { ForbiddenError, NotFoundError, ValidationError } from "../../error.js";
import type {
  CreateCommentInput,
  UpdateCommentInput,
} from "./comment.schema.js";

export const commentService = {
  async getComments(documentId: string, userId: string) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundError("Document not found");
    }

    await assertReadAccess(documentId, document, userId);

    return prisma.comment.findMany({
      where: { documentId, parentId: null },
      include: {
        author: {
          select: { id: true, name: true, username: true, avatar: true },
        },
        replies: {
          include: {
            author: {
              select: { id: true, name: true, username: true, avatar: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async createComment(
    documentId: string,
    userId: string,
    data: CreateCommentInput,
  ) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundError("Document not found");
    }

    // Anonymous users cannot comment, checked in authenticate middleware
    // as assertReadAccess passes if the doc is public
    await assertReadAccess(documentId, document, userId);

    if (data.parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: data.parentId },
      });

      if (!parent || parent.documentId !== documentId) {
        throw new NotFoundError("Parent comment not found");
      }

      if (parent.parentId !== null) {
        throw new ValidationError("Cannot reply to a reply");
      }
    }

    return prisma.comment.create({
      data: {
        content: data.content,
        documentId,
        authorId: userId,
        parentId: data.parentId ?? null,
        selectedText: data.selectedText ?? null,
        fromPos: data.fromPos ?? null,
        toPos: data.toPos ?? null,
      },
      include: {
        author: {
          select: { id: true, name: true, username: true, avatar: true },
        },
      },
    });
  },

  async updateComment(
    commentId: string,
    userId: string,
    data: UpdateCommentInput,
  ) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundError("Comment not found");
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenError("Access denied");
    }

    try {
      return await prisma.comment.update({
        where: { id: commentId },
        data: { content: data.content },
        include: {
          author: {
            select: { id: true, name: true, username: true, avatar: true },
          },
        },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        throw new NotFoundError("Comment not found");
      }

      throw err;
    }
  },

  async deleteComment(commentId: string, userId: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { document: true },
    });

    if (!comment) {
      throw new NotFoundError("Comment not found");
    }

    const isAuthor = comment.authorId === userId;
    const isOwner = comment.document.ownerId === userId;

    if (!isAuthor && !isOwner) {
      throw new ForbiddenError("Access denied");
    }

    try {
      await prisma.comment.delete({ where: { id: commentId } });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        throw new NotFoundError("Comment not found");
      }

      throw err;
    }

    return { success: true };
  },

  async resolveComment(commentId: string, userId: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { document: true },
    });

    if (!comment) {
      throw new NotFoundError("Comment not found");
    }

    const isOwner = comment.document.ownerId === userId;

    if (!isOwner) {
      throw new ForbiddenError("Only the owner can resolve comments");
    }

    try {
      return await prisma.comment.update({
        where: { id: commentId },
        data: { resolved: !comment.resolved },
        include: {
          author: {
            select: { id: true, name: true, username: true, avatar: true },
          },
        },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        throw new NotFoundError("Comment not found");
      }

      throw err;
    }
  },
};
