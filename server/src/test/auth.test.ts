import { describe, it, expect, beforeAll, afterAll } from "vitest";
import supertest from "supertest";
import app from "../app.js";
import { prisma } from "../config/db.js";

const request = supertest(app);

const testUser = {
  name: "Test User",
  username: "testuser",
  email: "test@example.com",
  password: "testpassword123",
};

let authToken: string;

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email: testUser.email } });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: testUser.email } });
});

describe("Auth", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const res = await request.post("/api/auth/register").send(testUser);
      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);
    });

    it("should reject duplicate email", async () => {
      const res = await request.post("/api/auth/register").send(testUser);
      expect(res.status).toBe(409);
      expect(res.body.code).toBe("RESOURCE_CONFLICT");
    });

    it("should reject duplicate username with different email", async () => {
      const res = await request.post("/api/auth/register").send({
        ...testUser,
        email: "different@example.com",
      });

      expect(res.status).toBe(409);
    });

    it("should normalize email to lowercase on register", async () => {
      const mixedCaseUser = {
        name: "Mixed Case User",
        username: "mixedcaseuser",
        email: "MixedCase@Example.com",
        password: "password123",
      };

      await prisma.user.deleteMany({
        where: { email: mixedCaseUser.email.toLowerCase() },
      });

      const registerRes = await request
        .post("/api/auth/register")
        .send(mixedCaseUser);

      expect(registerRes.status).toBe(201);
      expect(registerRes.body.user.email).toBe("mixedcase@example.com");

      const loginRes = await request.post("/api/auth/login").send({
        identifier: "MIXEDCASE@EXAMPLE.COM",
        password: mixedCaseUser.password,
      });

      expect(loginRes.status).toBe(200);

      await prisma.user.deleteMany({
        where: { email: "mixedcase@example.com" },
      });
    });

    describe("validation", () => {
      it("should reject invalid email format", async () => {
        const res = await request.post("/api/auth/register").send({
          ...testUser,
          username: "validationuser1",
          email: "not-an-email",
        });

        expect(res.status).toBe(400);
      });

      it("should reject short password", async () => {
        const res = await request.post("/api/auth/register").send({
          ...testUser,
          username: "validationuser2",
          email: "validationuser2@example.com",
          password: "short",
        });

        expect(res.status).toBe(400);
      });

      it("should reject username with invalid characters", async () => {
        const res = await request.post("/api/auth/register").send({
          ...testUser,
          username: "bad username!",
          email: "validationuser3@example.com",
        });

        expect(res.status).toBe(400);
      });

      it("should reject missing required fields", async () => {
        const res = await request.post("/api/auth/register").send({});
        expect(res.status).toBe(400);
      });
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with email", async () => {
      const res = await request.post("/api/auth/login").send({
        identifier: testUser.email,
        password: testUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      authToken = res.body.token;
    });

    it("should login with username", async () => {
      const res = await request.post("/api/auth/login").send({
        identifier: testUser.username,
        password: testUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it("should login with uppercase email", async () => {
      const res = await request.post("/api/auth/login").send({
        identifier: testUser.email.toUpperCase(),
        password: testUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it("should login with uppercase username", async () => {
      const res = await request.post("/api/auth/login").send({
        identifier: testUser.username.toUpperCase(),
        password: testUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it("should reject invalid password", async () => {
      const res = await request.post("/api/auth/login").send({
        identifier: testUser.email,
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("UNAUTHORIZED");
    });

    it("should reject non-existent identifier", async () => {
      const res = await request.post("/api/auth/login").send({
        identifier: "nonexistent@example.com",
        password: "password123",
      });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("UNAUTHORIZED");
    });

    it("should reject missing identifier", async () => {
      const res = await request.post("/api/auth/login").send({
        password: testUser.password,
      });

      expect(res.status).toBe(400);
    });

    it("should reject missing password", async () => {
      const res = await request.post("/api/auth/login").send({
        identifier: testUser.email,
      });

      expect(res.status).toBe(400);
    });

    it("should login with identifier containing surrounding whitespace", async () => {
      const res = await request.post("/api/auth/login").send({
        identifier: `  ${testUser.email}  `,
        password: testUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it("should reject identifier shorter than 3 characters", async () => {
      const res = await request.post("/api/auth/login").send({
        identifier: "ab",
        password: testUser.password,
      });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return current user with valid token", async () => {
      const res = await request
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.email).toBe(testUser.email);
    });

    it("should reject request without token", async () => {
      const res = await request.get("/api/auth/me");
      expect(res.status).toBe(401);
    });

    it("should reject request with invalid token", async () => {
      const res = await request
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalidtoken");
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should reject logout without token", async () => {
      const res = await request.post("/api/auth/logout");
      expect(res.status).toBe(401);
    });

    it("should logout and blacklist token", async () => {
      const res = await request
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(200);
    });

    it("should reject blacklisted token after logout", async () => {
      const res = await request
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.status).toBe(401);
    });
  });
});
