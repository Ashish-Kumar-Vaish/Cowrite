import { prisma } from "../config/db.js";
import { ForbiddenError } from "../error.js";

type AccessDocument = {
  ownerId: string;
  isPublic?: boolean;
};

async function getCollaboratorRole(
  documentId: string,
  userId: string,
): Promise<string | null> {
  const collaborator = await prisma.collaborator.findUnique({
    where: { documentId_userId: { documentId, userId } },
    select: { role: true },
  });

  return collaborator?.role ?? null;
}

export async function assertReadAccess(
  documentId: string,
  document: AccessDocument,
  userId?: string,
): Promise<void> {
  const isOwner = document.ownerId === userId;

  if (document.isPublic || isOwner) {
    return;
  }

  if (!userId) {
    throw new ForbiddenError("Access denied for this document");
  }

  const role = await getCollaboratorRole(documentId, userId);

  if (!role) {
    throw new ForbiddenError("Access denied for this document");
  }
}

export async function assertEditAccess(
  documentId: string,
  document: AccessDocument,
  userId: string,
): Promise<void> {
  const isOwner = document.ownerId === userId;

  if (isOwner) {
    return;
  }

  const role = await getCollaboratorRole(documentId, userId);

  if (role !== "EDITOR") {
    throw new ForbiddenError("Access denied");
  }
}

export function assertOwnerAccess(
  document: AccessDocument,
  userId: string,
): void {
  if (document.ownerId !== userId) {
    throw new ForbiddenError("Access denied");
  }
}
