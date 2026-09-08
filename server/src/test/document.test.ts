import { describe, it, expect, beforeAll, afterAll } from "vitest";
import supertest from "supertest";
import app from "../app.js";
import { prisma } from "../config/db.js";

const request = supertest(app);

const owner = {
  name: "Owner User",
  username: "owneruser",
  email: "owner@example.com",
  password: "password123",
};

const editor = {
  name: "Editor User",
  username: "editoruser",
  email: "editor@example.com",
  password: "password123",
};

const viewer = {
  name: "Viewer User",
  username: "vieweruser",
  email: "viewer@example.com",
  password: "password123",
};

const outsider = {
  name: "Outsider User",
  username: "outsideruser",
  email: "outsider@example.com",
  password: "password123",
};

let ownerToken: string;
let editorToken: string;
let viewerToken: string;
let outsiderToken: string;
let ownerId: string;
let editorId: string;
let viewerId: string;
let outsiderId: string;
let documentId: string;

beforeAll(async () => {
  // cleanup
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [owner.email, editor.email, viewer.email, outsider.email],
      },
    },
  });

  const [ownerRes, editorRes, viewerRes, outsiderRes] = await Promise.all([
    request.post("/api/auth/register").send(owner),
    request.post("/api/auth/register").send(editor),
    request.post("/api/auth/register").send(viewer),
    request.post("/api/auth/register").send(outsider),
  ]);

  ownerToken = ownerRes.body.token;
  editorToken = editorRes.body.token;
  viewerToken = viewerRes.body.token;
  outsiderToken = outsiderRes.body.token;
  ownerId = ownerRes.body.user.id;
  editorId = editorRes.body.user.id;
  viewerId = viewerRes.body.user.id;
  outsiderId = outsiderRes.body.user.id;
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [owner.email, editor.email, viewer.email, outsider.email],
      },
    },
  });
});

describe("Documents", () => {
  describe("POST /api/document", () => {
    it("should create a document", async () => {
      const res = await request
        .post("/api/document")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ title: "Test Document" });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe("Test Document");
      expect(res.body.id).toBeDefined();
      documentId = res.body.id;
    });

    it("should create a document with no title", async () => {
      const res = await request
        .post("/api/document")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({});

      expect(res.status).toBe(201);
    });

    it("should reject unauthenticated request", async () => {
      const res = await request.post("/api/document").send({ title: "Test" });
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/document", () => {
    it("should list documents owned by the user", async () => {
      const res = await request
        .get("/api/document")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.documents)).toBe(true);
      expect(typeof res.body.total).toBe("number");
    });

    it("should filter to only owned documents with filter=mine", async () => {
      const res = await request
        .get("/api/document?filter=mine")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.documents.every((d: any) => d.ownerId === ownerId)).toBe(
        true,
      );
    });

    it("should reject unauthenticated request", async () => {
      const res = await request.get("/api/document");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/document/recent", () => {
    it("should reject unauthenticated request", async () => {
      const res = await request.get("/api/document/recent");
      expect(res.status).toBe(401);
    });

    it("should list recently viewed documents", async () => {
      const res = await request
        .get("/api/document/recent")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.documents)).toBe(true);
    });
  });

  describe("GET /api/document/:id", () => {
    it("should allow owner to get document", async () => {
      const res = await request
        .get(`/api/document/${documentId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(documentId);
    });

    it("should reject outsider on private document", async () => {
      const res = await request
        .get(`/api/document/${documentId}`)
        .set("Authorization", `Bearer ${outsiderToken}`);

      expect(res.status).toBe(403);
    });

    it("should reject unauthenticated on private document", async () => {
      const res = await request.get(`/api/document/${documentId}`);
      expect(res.status).toBe(403);
    });

    it("should return 404 for non-existent document", async () => {
      const res = await request
        .get("/api/document/nonexistentid")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/document/:id", () => {
    it("should allow owner to update document", async () => {
      const res = await request
        .put(`/api/document/${documentId}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ title: "Updated Title" });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe("Updated Title");
    });

    it("should reject outsider from updating", async () => {
      const res = await request
        .put(`/api/document/${documentId}`)
        .set("Authorization", `Bearer ${outsiderToken}`)
        .send({ title: "Hacked Title" });

      expect(res.status).toBe(403);
    });

    it("should reject unauthenticated update", async () => {
      const res = await request
        .put(`/api/document/${documentId}`)
        .send({ title: "Hacked Title" });

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/document/:id/collaborator", () => {
    it("should allow owner to add editor", async () => {
      const res = await request
        .post(`/api/document/${documentId}/collaborator`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ userId: editorId, role: "EDITOR" });

      expect(res.status).toBe(201);
    });

    it("should allow owner to add viewer", async () => {
      const res = await request
        .post(`/api/document/${documentId}/collaborator`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ userId: viewerId, role: "VIEWER" });

      expect(res.status).toBe(201);
    });

    it("should reject outsider from adding collaborator", async () => {
      const res = await request
        .post(`/api/document/${documentId}/collaborator`)
        .set("Authorization", `Bearer ${outsiderToken}`)
        .send({ userId: editorId, role: "EDITOR" });

      expect(res.status).toBe(403);
    });

    it("should reject owner adding themselves as collaborator", async () => {
      const res = await request
        .post(`/api/document/${documentId}/collaborator`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ userId: ownerId, role: "EDITOR" });

      expect(res.status).toBe(400);
    });

    it("should reject adding an already-existing collaborator", async () => {
      const res = await request
        .post(`/api/document/${documentId}/collaborator`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ userId: editorId, role: "VIEWER" });

      expect(res.status).toBe(409);
    });

    it("should return 404 when adding a non-existent user as collaborator", async () => {
      const res = await request
        .post(`/api/document/${documentId}/collaborator`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ userId: "nonexistentuserid", role: "EDITOR" });

      expect(res.status).toBe(404);
    });
  });

  describe("Access control after adding collaborators", () => {
    it("should allow editor to read document", async () => {
      const res = await request
        .get(`/api/document/${documentId}`)
        .set("Authorization", `Bearer ${editorToken}`);

      expect(res.status).toBe(200);
    });

    it("should allow editor to update document", async () => {
      const res = await request
        .put(`/api/document/${documentId}`)
        .set("Authorization", `Bearer ${editorToken}`)
        .send({ title: "Editor Updated" });

      expect(res.status).toBe(200);
    });

    it("should allow viewer to read document", async () => {
      const res = await request
        .get(`/api/document/${documentId}`)
        .set("Authorization", `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
    });

    it("should reject viewer from updating document", async () => {
      const res = await request
        .put(`/api/document/${documentId}`)
        .set("Authorization", `Bearer ${viewerToken}`)
        .send({ title: "Viewer Hacked" });

      expect(res.status).toBe(403);
    });
  });

  describe("PUT /api/document/:id/visibility", () => {
    it("should allow owner to make document public", async () => {
      const res = await request
        .put(`/api/document/${documentId}/visibility`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ isPublic: true });

      expect(res.status).toBe(200);
      expect(res.body.isPublic).toBe(true);
    });

    it("should allow unauthenticated access to public document", async () => {
      const res = await request.get(`/api/document/${documentId}`);
      expect(res.status).toBe(200);
    });

    it("should reject editor from changing visibility", async () => {
      const res = await request
        .put(`/api/document/${documentId}/visibility`)
        .set("Authorization", `Bearer ${editorToken}`)
        .send({ isPublic: false });

      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /api/document/:id/collaborator/:userId", () => {
    it("should return 404 when removing a user who isn't a collaborator", async () => {
      const res = await request
        .delete(`/api/document/${documentId}/collaborator/${outsiderId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(404);
    });

    it("should allow owner to remove collaborator", async () => {
      const res = await request
        .delete(`/api/document/${documentId}/collaborator/${editorId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
    });

    it("should reject editor from removing collaborator", async () => {
      const res = await request
        .delete(`/api/document/${documentId}/collaborator/${viewerId}`)
        .set("Authorization", `Bearer ${editorToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /api/document/:id", () => {
    it("should reject outsider from deleting", async () => {
      const res = await request
        .delete(`/api/document/${documentId}`)
        .set("Authorization", `Bearer ${outsiderToken}`);

      expect(res.status).toBe(403);
    });

    it("should allow owner to delete document", async () => {
      const res = await request
        .delete(`/api/document/${documentId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
    });

    it("should return 404 after deletion", async () => {
      const res = await request
        .get(`/api/document/${documentId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(404);
    });
  });
});
