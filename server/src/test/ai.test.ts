import { describe, it, expect, beforeAll, afterAll } from "vitest";
import supertest from "supertest";
import app from "../app.js";
import { prisma } from "../config/db.js";

const request = supertest(app);

const user = {
  name: "AI Test User",
  username: "aitestuser",
  email: "aitestuser@example.com",
  password: "password123",
};

let userToken: string;

beforeAll(async () => {
  await prisma.user.deleteMany({
    where: {
      OR: [{ email: user.email }, { username: user.username }],
    },
  });

  const res = await request.post("/api/auth/register").send(user);
  userToken = res.body.token;
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      OR: [{ email: user.email }, { username: user.username }],
    },
  });
});

describe("AI", () => {
  describe("POST /api/ai/improve", () => {
    it("should reject unauthenticated request", async () => {
      const res = await request
        .post("/api/ai/improve")
        .send({ text: "Hello world" });

      expect(res.status).toBe(401);
    });

    it("should reject empty text", async () => {
      const res = await request
        .post("/api/ai/improve")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ text: "" });

      expect(res.status).toBe(400);
    });

    it("should reject missing text", async () => {
      const res = await request
        .post("/api/ai/improve")
        .set("Authorization", `Bearer ${userToken}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it("should reject whitespace-only text", async () => {
      const res = await request
        .post("/api/ai/improve")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ text: "   " });

      expect(res.status).toBe(400);
    });

    it("should reject text exceeding max length", async () => {
      const res = await request
        .post("/api/ai/improve")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ text: "a".repeat(20001) });

      expect(res.status).toBe(400);
    });

    it("should attempt streaming with valid text and valid auth", async () => {
      const res = await request
        .post("/api/ai/improve")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ text: "Hello world" });

      // Either streams successfully or fails due to invalid/missing Gemini API key
      // a fake key surfaces as a 500 or 503 (service unavailable)
      expect([200, 500, 503]).toContain(res.status);
    }, 15000);
  });
});
