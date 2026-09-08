import { describe, it, expect, beforeAll, afterAll } from "vitest";
import supertest from "supertest";
import app from "../app.js";
import { prisma } from "../config/db.js";

const request = supertest(app);

const owner = {
  name: "AR Owner",
  username: "arowner",
  email: "arowner@example.com",
  password: "password123",
};

const requester = {
  name: "AR Requester",
  username: "arrequester",
  email: "arrequester@example.com",
  password: "password123",
};

const outsider = {
  name: "AR Outsider",
  username: "aroutsider",
  email: "aroutsider@example.com",
  password: "password123",
};

let ownerToken: string;
let requesterToken: string;
let outsiderToken: string;
let requesterId: string;
let documentId: string;
let requestId: string;

beforeAll(async () => {
  await prisma.user.deleteMany({
    where: {
      email: { in: [owner.email, requester.email, outsider.email] },
    },
  });

  const [ownerRes, requesterRes, outsiderRes] = await Promise.all([
    request.post("/api/auth/register").send(owner),
    request.post("/api/auth/register").send(requester),
    request.post("/api/auth/register").send(outsider),
  ]);

  ownerToken = ownerRes.body.token;
  requesterToken = requesterRes.body.token;
  outsiderToken = outsiderRes.body.token;
  requesterId = requesterRes.body.user.id;

  const docRes = await request
    .post("/api/document")
    .set("Authorization", `Bearer ${ownerToken}`)
    .send({ title: "Access Request Test Doc" });

  documentId = docRes.body.id;
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      email: { in: [owner.email, requester.email, outsider.email] },
    },
  });
});

describe("Access Requests", () => {
  describe("POST /api/access-request/:documentId", () => {
    it("should allow requester to request access", async () => {
      const res = await request
        .post(`/api/access-request/${documentId}`)
        .set("Authorization", `Bearer ${requesterToken}`)
        .send({ requestedRole: "VIEWER" });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe("PENDING");
      requestId = res.body.id;
    });

    it("should reject duplicate pending request", async () => {
      const res = await request
        .post(`/api/access-request/${documentId}`)
        .set("Authorization", `Bearer ${requesterToken}`)
        .send({ requestedRole: "VIEWER" });

      expect(res.status).toBe(409);
    });

    it("should allow switching requested role while pending", async () => {
      const res = await request
        .post(`/api/access-request/${documentId}`)
        .set("Authorization", `Bearer ${requesterToken}`)
        .send({ requestedRole: "EDITOR" });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe("PENDING");
      expect(res.body.requestedRole).toBe("EDITOR");
      expect(res.body.id).toBe(requestId);
    });

    it("should reject owner requesting access to own document", async () => {
      const res = await request
        .post(`/api/access-request/${documentId}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ requestedRole: "VIEWER" });

      expect(res.status).toBe(403);
    });

    it("should reject unauthenticated request", async () => {
      const res = await request
        .post(`/api/access-request/${documentId}`)
        .send({ requestedRole: "VIEWER" });

      expect(res.status).toBe(401);
    });

    it("should return 404 for non-existent document", async () => {
      const res = await request
        .post("/api/access-request/nonexistentid")
        .set("Authorization", `Bearer ${requesterToken}`)
        .send({ requestedRole: "VIEWER" });

      expect(res.status).toBe(404);
    });

    it("should reject request with invalid role", async () => {
      const res = await request
        .post(`/api/access-request/${documentId}`)
        .set("Authorization", `Bearer ${requesterToken}`)
        .send({ requestedRole: "INVALID_ROLE" });

      expect(res.status).toBe(400);
    });

    it("should default to VIEWER role when no role is passed", async () => {
      const res = await request
        .post(`/api/access-request/${documentId}`)
        .set("Authorization", `Bearer ${outsiderToken}`)
        .send({});

      expect(res.status).toBe(201);
      expect(res.body.requestedRole).toBe("VIEWER");

      await request
        .put(`/api/access-request/${res.body.id}/deny`)
        .set("Authorization", `Bearer ${ownerToken}`);
    });
  });

  describe("GET /api/access-request/:documentId", () => {
    it("should allow owner to get pending requests", async () => {
      const res = await request
        .get(`/api/access-request/${documentId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].id).toBe(requestId);
    });

    it("should reject outsider from getting requests", async () => {
      const res = await request
        .get(`/api/access-request/${documentId}`)
        .set("Authorization", `Bearer ${outsiderToken}`);

      expect(res.status).toBe(403);
    });

    it("should reject unauthenticated request", async () => {
      const res = await request.get(`/api/access-request/${documentId}`);
      expect(res.status).toBe(401);
    });
  });

  describe("PUT /api/access-request/:id/deny", () => {
    it("should reject unauthenticated deny request", async () => {
      const res = await request.put(`/api/access-request/${requestId}/deny`);
      expect(res.status).toBe(401);
    });

    it("should return 404 for non-existent request", async () => {
      const res = await request
        .put("/api/access-request/nonexistentid/deny")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(404);
    });

    it("should reject outsider from denying request", async () => {
      const res = await request
        .put(`/api/access-request/${requestId}/deny`)
        .set("Authorization", `Bearer ${outsiderToken}`);

      expect(res.status).toBe(403);
    });

    it("should allow owner to deny request", async () => {
      const res = await request
        .put(`/api/access-request/${requestId}/deny`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
    });

    it("should reject denying already denied request", async () => {
      const res = await request
        .put(`/api/access-request/${requestId}/deny`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(409);
    });
  });

  describe("PUT /api/access-request/:id/approve", () => {
    it("should resubmit denied request", async () => {
      const res = await request
        .post(`/api/access-request/${documentId}`)
        .set("Authorization", `Bearer ${requesterToken}`)
        .send({ requestedRole: "EDITOR" });

      expect(res.status).toBe(201);
      requestId = res.body.id;
    });

    it("should reject approve with invalid role", async () => {
      const res = await request
        .put(`/api/access-request/${requestId}/approve`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ role: "INVALID_ROLE" });

      expect(res.status).toBe(400);
    });

    it("should reject approve with no role", async () => {
      const res = await request
        .put(`/api/access-request/${requestId}/approve`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it("should reject unauthenticated approve request", async () => {
      const res = await request
        .put(`/api/access-request/${requestId}/approve`)
        .send({ role: "EDITOR" });

      expect(res.status).toBe(401);
    });

    it("should return 404 for non-existent request", async () => {
      const res = await request
        .put("/api/access-request/nonexistentid/approve")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ role: "EDITOR" });

      expect(res.status).toBe(404);
    });

    it("should reject outsider from approving request", async () => {
      const res = await request
        .put(`/api/access-request/${requestId}/approve`)
        .set("Authorization", `Bearer ${outsiderToken}`)
        .send({ role: "EDITOR" });

      expect(res.status).toBe(403);
    });

    it("should allow owner to approve request", async () => {
      const res = await request
        .put(`/api/access-request/${requestId}/approve`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ role: "EDITOR" });

      expect(res.status).toBe(200);
    });

    it("should reject approving already approved request", async () => {
      const res = await request
        .put(`/api/access-request/${requestId}/approve`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ role: "EDITOR" });

      expect(res.status).toBe(409);
    });

    it("should give requester access after approval", async () => {
      const res = await request
        .get(`/api/document/${documentId}`)
        .set("Authorization", `Bearer ${requesterToken}`);

      expect(res.status).toBe(200);
    });

    it("should reject request when already a collaborator with same role", async () => {
      const res = await request
        .post(`/api/access-request/${documentId}`)
        .set("Authorization", `Bearer ${requesterToken}`)
        .send({ requestedRole: "EDITOR" });

      expect(res.status).toBe(409);
    });
  });
});
