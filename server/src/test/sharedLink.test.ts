import { describe, it, expect, beforeAll, afterAll } from "vitest";
import supertest from "supertest";
import app from "../app.js";
import { prisma } from "../config/db.js";

const request = supertest(app);

const owner = {
  name: "SL Owner",
  username: "slowner",
  email: "slowner@example.com",
  password: "password123",
};

const joiner = {
  name: "SL Joiner",
  username: "sljoiner",
  email: "sljoiner@example.com",
  password: "password123",
};

const outsider = {
  name: "SL Outsider",
  username: "sloutsider",
  email: "sloutsider@example.com",
  password: "password123",
};

let ownerToken: string;
let joinerToken: string;
let outsiderToken: string;
let documentId: string;
let linkId: string;
let linkToken: string;
let editorLinkToken: string;

beforeAll(async () => {
  await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { in: [owner.email, joiner.email, outsider.email] } },
        {
          username: {
            in: [owner.username, joiner.username, outsider.username],
          },
        },
      ],
    },
  });

  const [ownerRes, joinerRes, outsiderRes] = await Promise.all([
    request.post("/api/auth/register").send(owner),
    request.post("/api/auth/register").send(joiner),
    request.post("/api/auth/register").send(outsider),
  ]);

  ownerToken = ownerRes.body.token;
  joinerToken = joinerRes.body.token;
  outsiderToken = outsiderRes.body.token;

  const docRes = await request
    .post("/api/document")
    .set("Authorization", `Bearer ${ownerToken}`)
    .send({ title: "Shared Link Test Doc" });

  documentId = docRes.body.id;
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { in: [owner.email, joiner.email, outsider.email] } },
        {
          username: {
            in: [owner.username, joiner.username, outsider.username],
          },
        },
      ],
    },
  });
});

describe("Shared Links", () => {
  describe("POST /api/shared-link/:documentId", () => {
    it("should allow owner to create a shared link", async () => {
      const res = await request
        .post(`/api/shared-link/${documentId}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ role: "VIEWER" });

      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.role).toBe("VIEWER");
      linkId = res.body.id;
      linkToken = res.body.token;
    });

    it("should default to VIEWER role when role is omitted", async () => {
      const res = await request
        .post(`/api/shared-link/${documentId}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({});

      expect(res.status).toBe(201);
      expect(res.body.role).toBe("VIEWER");
    });

    it("should allow creating link with expiry", async () => {
      const expiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      ).toISOString();
      const res = await request
        .post(`/api/shared-link/${documentId}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ role: "EDITOR", expiresAt });

      expect(res.status).toBe(201);
      expect(res.body.expiresAt).toBeDefined();
      editorLinkToken = res.body.token;
    });

    it("should reject expiresAt in the past", async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const res = await request
        .post(`/api/shared-link/${documentId}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ role: "VIEWER", expiresAt: pastDate });

      expect(res.status).toBe(400);
    });

    it("should reject outsider from creating shared link", async () => {
      const res = await request
        .post(`/api/shared-link/${documentId}`)
        .set("Authorization", `Bearer ${outsiderToken}`)
        .send({ role: "VIEWER" });

      expect(res.status).toBe(403);
    });

    it("should reject unauthenticated request", async () => {
      const res = await request
        .post(`/api/shared-link/${documentId}`)
        .send({ role: "VIEWER" });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/shared-link/:documentId", () => {
    it("should allow owner to get shared links", async () => {
      const res = await request
        .get(`/api/shared-link/${documentId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("should reject outsider from getting shared links", async () => {
      const res = await request
        .get(`/api/shared-link/${documentId}`)
        .set("Authorization", `Bearer ${outsiderToken}`);

      expect(res.status).toBe(403);
    });

    it("should reject unauthenticated request", async () => {
      const res = await request.get(`/api/shared-link/${documentId}`);
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/shared-link/join/:token", () => {
    it("should return link info for valid token", async () => {
      const res = await request
        .get(`/api/shared-link/join/${linkToken}`)
        .set("Authorization", `Bearer ${joinerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.token).toBe(linkToken);
      expect(res.body.document).toBeDefined();
    });

    it("should return 404 for invalid token", async () => {
      const res = await request
        .get("/api/shared-link/join/invalidtoken")
        .set("Authorization", `Bearer ${joinerToken}`);

      expect(res.status).toBe(404);
    });

    it("should reject unauthenticated request", async () => {
      const res = await request.get(`/api/shared-link/join/${linkToken}`);
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/shared-link/join/:token", () => {
    it("should allow joiner to join via shared link", async () => {
      const res = await request
        .post(`/api/shared-link/join/${linkToken}`)
        .set("Authorization", `Bearer ${joinerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.documentId).toBe(documentId);
    });

    it("should allow joining again (idempotent)", async () => {
      const res = await request
        .post(`/api/shared-link/join/${linkToken}`)
        .set("Authorization", `Bearer ${joinerToken}`);

      expect(res.status).toBe(200);
    });

    it("should allow owner to join their own document", async () => {
      const res = await request
        .post(`/api/shared-link/join/${linkToken}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.documentId).toBe(documentId);
    });

    it("should give joiner access to the document after joining", async () => {
      const res = await request
        .get(`/api/document/${documentId}`)
        .set("Authorization", `Bearer ${joinerToken}`);

      expect(res.status).toBe(200);
    });

    it("should upgrade joiner's role when joining via a higher-access link", async () => {
      const joinRes = await request
        .post(`/api/shared-link/join/${editorLinkToken}`)
        .set("Authorization", `Bearer ${joinerToken}`);

      expect(joinRes.status).toBe(200);

      const editRes = await request
        .put(`/api/document/${documentId}`)
        .set("Authorization", `Bearer ${joinerToken}`)
        .send({ title: "Joiner can now edit" });

      expect(editRes.status).toBe(200);
    });

    it("should reject unauthenticated join", async () => {
      const res = await request.post(`/api/shared-link/join/${linkToken}`);
      expect(res.status).toBe(401);
    });

    it("should return 404 for invalid token", async () => {
      const res = await request
        .post("/api/shared-link/join/invalidtoken")
        .set("Authorization", `Bearer ${joinerToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("Expired shared links", () => {
    let expiredToken: string;

    beforeAll(async () => {
      const res = await request
        .post(`/api/shared-link/${documentId}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ role: "VIEWER" });

      expiredToken = res.body.token;

      await prisma.sharedLink.update({
        where: { id: res.body.id },
        data: { expiresAt: new Date(Date.now() - 1000) },
      });
    });

    it("should return 404 for GET on an expired link", async () => {
      const res = await request
        .get(`/api/shared-link/join/${expiredToken}`)
        .set("Authorization", `Bearer ${joinerToken}`);

      expect(res.status).toBe(404);
    });

    it("should return 404 for POST join on an expired link", async () => {
      const res = await request
        .post(`/api/shared-link/join/${expiredToken}`)
        .set("Authorization", `Bearer ${outsiderToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/shared-link/:id", () => {
    it("should reject unauthenticated revoke", async () => {
      const res = await request.delete(`/api/shared-link/${linkId}`);
      expect(res.status).toBe(401);
    });

    it("should return 404 when revoking a non-existent link", async () => {
      const res = await request
        .delete("/api/shared-link/nonexistentid")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(404);
    });

    it("should reject outsider from revoking link", async () => {
      const res = await request
        .delete(`/api/shared-link/${linkId}`)
        .set("Authorization", `Bearer ${outsiderToken}`);

      expect(res.status).toBe(403);
    });

    it("should allow owner to revoke shared link", async () => {
      const res = await request
        .delete(`/api/shared-link/${linkId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
    });

    it("should return 404 after revocation", async () => {
      const res = await request
        .get(`/api/shared-link/join/${linkToken}`)
        .set("Authorization", `Bearer ${joinerToken}`);

      expect(res.status).toBe(404);
    });
  });
});
