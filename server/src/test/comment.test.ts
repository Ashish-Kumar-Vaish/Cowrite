import { describe, it, expect, beforeAll, afterAll } from "vitest";
import supertest from "supertest";
import app from "../app.js";
import { prisma } from "../config/db.js";

const request = supertest(app);

const owner = {
  name: "Comment Owner",
  username: "commentowner",
  email: "commentowner@example.com",
  password: "password123",
};

const collaborator = {
  name: "Comment Collaborator",
  username: "commentcollab",
  email: "commentcollab@example.com",
  password: "password123",
};

const outsider = {
  name: "Comment Outsider",
  username: "commentoutsider",
  email: "commentoutsider@example.com",
  password: "password123",
};

let ownerToken: string;
let collaboratorToken: string;
let outsiderToken: string;
let collaboratorId: string;
let documentId: string;
let commentId: string;
let replyId: string;

beforeAll(async () => {
  await prisma.user.deleteMany({
    where: {
      email: { in: [owner.email, collaborator.email, outsider.email] },
    },
  });

  const [ownerRes, collabRes, outsiderRes] = await Promise.all([
    request.post("/api/auth/register").send(owner),
    request.post("/api/auth/register").send(collaborator),
    request.post("/api/auth/register").send(outsider),
  ]);

  ownerToken = ownerRes.body.token;
  collaboratorToken = collabRes.body.token;
  outsiderToken = outsiderRes.body.token;
  collaboratorId = collabRes.body.user.id;

  const docRes = await request
    .post("/api/document")
    .set("Authorization", `Bearer ${ownerToken}`)
    .send({ title: "Comment Test Doc" });

  documentId = docRes.body.id;

  await request
    .post(`/api/document/${documentId}/collaborator`)
    .set("Authorization", `Bearer ${ownerToken}`)
    .send({ userId: collaboratorId, role: "EDITOR" });
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      email: { in: [owner.email, collaborator.email, outsider.email] },
    },
  });
});

describe("Comments", () => {
  describe("POST /api/comment/:documentId", () => {
    it("should allow owner to create a comment", async () => {
      const res = await request
        .post(`/api/comment/${documentId}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ content: "Owner comment" });

      expect(res.status).toBe(201);
      expect(res.body.content).toBe("Owner comment");
      commentId = res.body.id;
    });

    it("should allow collaborator to create a comment", async () => {
      const res = await request
        .post(`/api/comment/${documentId}`)
        .set("Authorization", `Bearer ${collaboratorToken}`)
        .send({ content: "Collaborator comment" });

      expect(res.status).toBe(201);
    });

    it("should allow creating a reply", async () => {
      const res = await request
        .post(`/api/comment/${documentId}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ content: "Reply comment", parentId: commentId });

      expect(res.status).toBe(201);
      expect(res.body.parentId).toBe(commentId);
      replyId = res.body.id;
    });

    it("should reject replying to a reply", async () => {
      const res = await request
        .post(`/api/comment/${documentId}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ content: "Reply to a reply", parentId: replyId });

      expect(res.status).toBe(400);
    });

    it("should reject outsider from creating comment on private doc", async () => {
      const res = await request
        .post(`/api/comment/${documentId}`)
        .set("Authorization", `Bearer ${outsiderToken}`)
        .send({ content: "Outsider comment" });

      expect(res.status).toBe(403);
    });

    it("should reject unauthenticated comment", async () => {
      const res = await request
        .post(`/api/comment/${documentId}`)
        .send({ content: "Anonymous comment" });

      expect(res.status).toBe(401);
    });

    it("should reject comment with invalid parentId", async () => {
      const res = await request
        .post(`/api/comment/${documentId}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ content: "Reply", parentId: "nonexistentid" });

      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/comment/:documentId", () => {
    it("should allow owner to get comments", async () => {
      const res = await request
        .get(`/api/comment/${documentId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should allow collaborator to get comments", async () => {
      const res = await request
        .get(`/api/comment/${documentId}`)
        .set("Authorization", `Bearer ${collaboratorToken}`);

      expect(res.status).toBe(200);
    });

    it("should reject outsider from getting comments on private doc", async () => {
      const res = await request
        .get(`/api/comment/${documentId}`)
        .set("Authorization", `Bearer ${outsiderToken}`);

      expect(res.status).toBe(403);
    });

    it("should reject unauthenticated get", async () => {
      const res = await request.get(`/api/comment/${documentId}`);
      expect(res.status).toBe(401);
    });
  });

  describe("PUT /api/comment/:id", () => {
    it("should allow author to update their comment", async () => {
      const res = await request
        .put(`/api/comment/${commentId}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ content: "Updated comment" });

      expect(res.status).toBe(200);
      expect(res.body.content).toBe("Updated comment");
    });

    it("should reject non-author from updating comment", async () => {
      const res = await request
        .put(`/api/comment/${commentId}`)
        .set("Authorization", `Bearer ${collaboratorToken}`)
        .send({ content: "Hacked comment" });

      expect(res.status).toBe(403);
    });

    it("should reject unauthenticated update", async () => {
      const res = await request
        .put(`/api/comment/${commentId}`)
        .send({ content: "Hacked" });

      expect(res.status).toBe(401);
    });

    it("should return 404 when updating non-existent comment", async () => {
      const res = await request
        .put("/api/comment/nonexistentid")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ content: "..." });

      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/comment/:id/resolve", () => {
    it("should reject unauthenticated resolve", async () => {
      const res = await request.put(`/api/comment/${commentId}/resolve`);
      expect(res.status).toBe(401);
    });

    it("should return 404 when resolving non-existent comment", async () => {
      const res = await request
        .put("/api/comment/nonexistentid/resolve")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(404);
    });

    it("should allow owner to resolve a comment", async () => {
      const res = await request
        .put(`/api/comment/${commentId}/resolve`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.resolved).toBe(true);
    });

    it("should allow owner to unresolve a comment", async () => {
      const res = await request
        .put(`/api/comment/${commentId}/resolve`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.resolved).toBe(false);
    });

    it("should reject collaborator from resolving comment", async () => {
      const res = await request
        .put(`/api/comment/${commentId}/resolve`)
        .set("Authorization", `Bearer ${collaboratorToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /api/comment/:id", () => {
    it("should reject unauthenticated delete", async () => {
      const res = await request.delete(`/api/comment/${commentId}`);
      expect(res.status).toBe(401);
    });

    it("should return 404 when deleting non-existent comment", async () => {
      const res = await request
        .delete("/api/comment/nonexistentid")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(404);
    });

    it("should allow author to delete their reply", async () => {
      const res = await request
        .delete(`/api/comment/${replyId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
    });

    it("should reject non-author from deleting comment", async () => {
      const res = await request
        .delete(`/api/comment/${commentId}`)
        .set("Authorization", `Bearer ${collaboratorToken}`);

      expect(res.status).toBe(403);
    });

    it("should allow owner to delete any comment on their document", async () => {
      const collabCommentRes = await request
        .post(`/api/comment/${documentId}`)
        .set("Authorization", `Bearer ${collaboratorToken}`)
        .send({ content: "To be deleted by owner" });

      const collabCommentId = collabCommentRes.body.id;

      const res = await request
        .delete(`/api/comment/${collabCommentId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
    });

    it("should allow author to delete their own comment", async () => {
      const res = await request
        .delete(`/api/comment/${commentId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe("Comments on a public document", () => {
    let publicDocId: string;

    beforeAll(async () => {
      const res = await request
        .post("/api/document")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ title: "Public Comment Doc" });

      publicDocId = res.body.id;

      await request
        .put(`/api/document/${publicDocId}/visibility`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ isPublic: true });
    });

    it("should allow outsider to comment on a public document", async () => {
      const res = await request
        .post(`/api/comment/${publicDocId}`)
        .set("Authorization", `Bearer ${outsiderToken}`)
        .send({ content: "Outsider comment on public doc" });

      expect(res.status).toBe(201);
    });

    it("should allow outsider to view comments on a public document", async () => {
      const res = await request
        .get(`/api/comment/${publicDocId}`)
        .set("Authorization", `Bearer ${outsiderToken}`);

      expect(res.status).toBe(200);
    });
  });
});
