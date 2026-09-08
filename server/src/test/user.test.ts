import { describe, it, expect, beforeAll, afterAll } from "vitest";
import supertest from "supertest";
import app from "../app.js";
import { prisma } from "../config/db.js";

const request = supertest(app);

const user = {
  name: "User Test",
  username: "usertest",
  email: "usertest@example.com",
  password: "password123",
};

const otherUser = {
  name: "Other User",
  username: "otherusertest",
  email: "otherusertest@example.com",
  password: "password123",
};

let userToken: string;
let otherUserToken: string;

beforeAll(async () => {
  await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { in: [user.email, otherUser.email] } },
        { username: { in: [user.username, otherUser.username] } },
      ],
    },
  });

  const [userRes, otherRes] = await Promise.all([
    request.post("/api/auth/register").send(user),
    request.post("/api/auth/register").send(otherUser),
  ]);

  userToken = userRes.body.token;
  otherUserToken = otherRes.body.token;
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      OR: [
        {
          email: {
            in: [user.email, otherUser.email, "updateduser@example.com"],
          },
        },
        { username: { in: [user.username, otherUser.username] } },
      ],
    },
  });
});

describe("User", () => {
  describe("GET /api/user/:username", () => {
    it("should return public profile", async () => {
      const res = await request.get(`/api/user/${user.username}`);
      expect(res.status).toBe(200);
      expect(res.body.username).toBe(user.username);
      expect(res.body.password).toBeUndefined();
      expect(res.body.email).toBeUndefined();
    });

    it("should return 404 for non-existent user", async () => {
      const res = await request.get("/api/user/nonexistentuser");
      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/user/search", () => {
    it("should find user by email", async () => {
      const res = await request
        .get(`/api/user/search?email=${otherUser.email}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.username).toBe(otherUser.username);
      expect(res.body.password).toBeUndefined();
    });

    it("should find user by email regardless of case", async () => {
      const res = await request
        .get(`/api/user/search?email=${otherUser.email.toUpperCase()}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.username).toBe(otherUser.username);
    });

    it("should reject searching for yourself", async () => {
      const res = await request
        .get(`/api/user/search?email=${user.email}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(400);
    });

    it("should return 404 for non-existent email", async () => {
      const res = await request
        .get("/api/user/search?email=nonexistent@example.com")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });

    it("should reject unauthenticated search", async () => {
      const res = await request.get(
        `/api/user/search?email=${otherUser.email}`,
      );
      expect(res.status).toBe(401);
    });
  });

  describe("PUT /api/user/me", () => {
    it("should update profile", async () => {
      const res = await request
        .put("/api/user/me")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ name: "Updated Name", bio: "Updated bio" });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Updated Name");
      expect(res.body.bio).toBe("Updated bio");
    });

    it("should reject duplicate username", async () => {
      const res = await request
        .put("/api/user/me")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ username: otherUser.username });

      expect(res.status).toBe(409);
    });

    it("should reject duplicate username regardless of case", async () => {
      const res = await request
        .put("/api/user/me")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ username: otherUser.username.toUpperCase() });

      expect(res.status).toBe(409);
    });

    it("should store updated username as lowercase", async () => {
      const res = await request
        .put("/api/user/me")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ username: "MixedCaseUsername" });

      expect(res.status).toBe(200);
      expect(res.body.username).toBe("mixedcaseusername");

      await request
        .put("/api/user/me")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ username: user.username });
    });

    it("should reject unauthenticated update", async () => {
      const res = await request.put("/api/user/me").send({ name: "Hacked" });
      expect(res.status).toBe(401);
    });
  });

  describe("PUT /api/user/me/email", () => {
    it("should reject duplicate email regardless of case", async () => {
      const res = await request
        .put("/api/user/me/email")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          email: otherUser.email.toUpperCase(),
          password: user.password,
        });

      expect(res.status).toBe(409);
    });

    it("should update email with correct password", async () => {
      const res = await request
        .put("/api/user/me/email")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ email: "updateduser@example.com", password: user.password });

      expect(res.status).toBe(200);
      expect(res.body.email).toBe("updateduser@example.com");
    });

    it("should reject with wrong password", async () => {
      const res = await request
        .put("/api/user/me/email")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ email: "another@example.com", password: "wrongpassword" });

      expect(res.status).toBe(401);
    });

    it("should reject duplicate email", async () => {
      const res = await request
        .put("/api/user/me/email")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ email: otherUser.email, password: user.password });

      expect(res.status).toBe(409);
    });
  });

  describe("PUT /api/user/me/password", () => {
    it("should reject unauthenticated password update", async () => {
      const res = await request
        .put("/api/user/me/password")
        .send({ currentPassword: "x", newPassword: "newpassword123" });

      expect(res.status).toBe(401);
    });

    it("should update password with correct current password", async () => {
      const res = await request
        .put("/api/user/me/password")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          currentPassword: user.password,
          newPassword: "newpassword123",
        });

      expect(res.status).toBe(200);
    });

    it("should reject with wrong current password", async () => {
      const res = await request
        .put("/api/user/me/password")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          currentPassword: "wrongpassword",
          newPassword: "newpassword123",
        });

      expect(res.status).toBe(401);
    });
  });

  describe("PUT /api/user/gemini-key", () => {
    it("should update gemini api key", async () => {
      const res = await request
        .put("/api/user/gemini-key")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ apiKey: "AIzaSyTestKey1234567890abcdef" });

      expect(res.status).toBe(200);
      expect(res.body.geminiKeyHint).toBeDefined();
    });

    it("should reject empty string api key", async () => {
      const res = await request
        .put("/api/user/gemini-key")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ apiKey: "" });

      expect(res.status).toBe(400);
    });

    it("should reject api key exceeding max length", async () => {
      const res = await request
        .put("/api/user/gemini-key")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ apiKey: "a".repeat(201) });

      expect(res.status).toBe(400);
    });

    it("should clear gemini api key", async () => {
      const res = await request
        .put("/api/user/gemini-key")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ apiKey: null });

      expect(res.status).toBe(200);
      expect(res.body.geminiKeyHint).toBeNull();
    });

    it("should reject unauthenticated request", async () => {
      const res = await request
        .put("/api/user/gemini-key")
        .send({ apiKey: "somekey" });
      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /api/user/me", () => {
    it("should reject unauthenticated account deletion", async () => {
      const res = await request.delete("/api/user/me");
      expect(res.status).toBe(401);
    });

    it("should delete account", async () => {
      const res = await request
        .delete("/api/user/me")
        .set("Authorization", `Bearer ${otherUserToken}`);

      expect(res.status).toBe(200);
    });

    it("should reject token after account deletion", async () => {
      const res = await request
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${otherUserToken}`);

      expect(res.status).toBe(401);
    });
  });
});
