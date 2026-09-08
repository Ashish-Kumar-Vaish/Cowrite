import { describe, it, expect, beforeAll, afterAll } from "vitest";
import supertest from "supertest";
import app from "../app.js";
import { prisma } from "../config/db.js";

const request = supertest(app);

const owner = {
  name: "Version Owner",
  username: "versionowner",
  email: "versionowner@example.com",
  password: "password123",
};

const editor = {
  name: "Version Editor",
  username: "versioneditor",
  email: "versioneditor@example.com",
  password: "password123",
};

const viewer = {
  name: "Version Viewer",
  username: "versionviewer",
  email: "versionviewer@example.com",
  password: "password123",
};

const outsider = {
  name: "Version Outsider",
  username: "versionoutsider",
  email: "versionoutsider@example.com",
  password: "password123",
};

let ownerToken: string;
let editorToken: string;
let viewerToken: string;
let outsiderToken: string;
let ownerId: string;
let editorId: string;
let viewerId: string;
let documentId: string;
let versionId: string;

const fakeContent = Buffer.from("fake yjs content").toString("base64");

beforeAll(async () => {
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

  const docRes = await request
    .post("/api/document")
    .set("Authorization", `Bearer ${ownerToken}`)
    .send({ title: "Version Test Doc" });

  documentId = docRes.body.id;

  await Promise.all([
    request
      .post(`/api/document/${documentId}/collaborator`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ userId: editorId, role: "EDITOR" }),
    request
      .post(`/api/document/${documentId}/collaborator`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ userId: viewerId, role: "VIEWER" }),
  ]);
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

describe("Versions", () => {
  describe("GET /api/version/:documentId", () => {
    beforeAll(async () => {
      const version = await prisma.documentVersion.create({
        data: {
          documentId,
          authorId: ownerId,
          title: "Version 1",
          content: fakeContent,
        },
      });

      versionId = version.id;
    });

    it("should allow owner to get versions", async () => {
      const res = await request
        .get(`/api/version/${documentId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("should allow editor to get versions", async () => {
      const res = await request
        .get(`/api/version/${documentId}`)
        .set("Authorization", `Bearer ${editorToken}`);

      expect(res.status).toBe(200);
    });

    it("should allow viewer to get versions", async () => {
      const res = await request
        .get(`/api/version/${documentId}`)
        .set("Authorization", `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
    });

    it("should reject outsider from getting versions", async () => {
      const res = await request
        .get(`/api/version/${documentId}`)
        .set("Authorization", `Bearer ${outsiderToken}`);

      expect(res.status).toBe(403);
    });

    it("should reject unauthenticated request", async () => {
      const res = await request.get(`/api/version/${documentId}`);
      expect(res.status).toBe(401);
    });
  });

  describe("PUT /api/version/:id/restore", () => {
    it("should reject unauthenticated request", async () => {
      const res = await request.put(`/api/version/${versionId}/restore`);
      expect(res.status).toBe(401);
    });

    it("should allow owner to restore a version", async () => {
      const res = await request
        .put(`/api/version/${versionId}/restore`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
    });

    it("should allow editor to restore a version", async () => {
      const res = await request
        .put(`/api/version/${versionId}/restore`)
        .set("Authorization", `Bearer ${editorToken}`);

      expect(res.status).toBe(200);
    });

    it("should reject viewer from restoring a version", async () => {
      const res = await request
        .put(`/api/version/${versionId}/restore`)
        .set("Authorization", `Bearer ${viewerToken}`);

      expect(res.status).toBe(403);
    });

    it("should reject outsider from restoring a version", async () => {
      const res = await request
        .put(`/api/version/${versionId}/restore`)
        .set("Authorization", `Bearer ${outsiderToken}`);

      expect(res.status).toBe(403);
    });

    it("should return 404 for non-existent version", async () => {
      const res = await request
        .put("/api/version/nonexistentid/restore")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/version/:id", () => {
    it("should reject unauthenticated request", async () => {
      const res = await request.delete(`/api/version/${versionId}`);
      expect(res.status).toBe(401);
    });

    it("should reject editor from deleting a version", async () => {
      const res = await request
        .delete(`/api/version/${versionId}`)
        .set("Authorization", `Bearer ${editorToken}`);

      expect(res.status).toBe(403);
    });

    it("should reject outsider from deleting a version", async () => {
      const res = await request
        .delete(`/api/version/${versionId}`)
        .set("Authorization", `Bearer ${outsiderToken}`);

      expect(res.status).toBe(403);
    });

    it("should allow owner to delete a version", async () => {
      const res = await request
        .delete(`/api/version/${versionId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
    });

    it("should return 404 after deletion", async () => {
      const res = await request
        .delete(`/api/version/${versionId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(404);
    });
  });
});
