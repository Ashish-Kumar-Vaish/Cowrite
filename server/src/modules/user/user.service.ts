import bcrypt from "bcrypt";
import { prisma } from "../../config/db.js";
import type {
  UpdateProfileInput,
  UpdateEmailInput,
  UpdatePasswordInput,
} from "./user.schema.js";
import { cloudinary } from "../../config/cloudinary.js";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../error.js";
import { Prisma } from "../../../generated/prisma/client.js";
import jwt from "jsonwebtoken";
import { redis } from "../../config/redis.js";

export const userService = {
  async getPublicProfile(username: string) {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        bio: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  },

  async searchByEmail(email: string, requesterId: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.id === requesterId) {
      throw new ValidationError("You cannot add yourself");
    }

    return user;
  },

  async updateProfile(userId: string, data: UpdateProfileInput) {
    if (data.username) {
      const existing = await prisma.user.findUnique({
        where: { username: data.username },
      });

      if (existing && existing.id !== userId) {
        throw new ConflictError("Username already in use");
      }
    }

    const updateData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined),
    );

    try {
      return await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          avatar: true,
          bio: true,
          createdAt: true,
        },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new ConflictError("Username already in use");
      }

      throw err;
    }
  },

  async updateAvatar(userId: string, buffer: Buffer) {
    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    if (!existing) {
      throw new NotFoundError("User not found");
    }

    if (existing?.avatar?.includes("cloudinary")) {
      // TODO: breaks if URL format changes
      // instead of extracting public id store the public id in db
      // and construct the url here
      const publicId = existing.avatar
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0];

      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    const url = await new Promise<string>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "avatars", public_id: userId, overwrite: true },
        (error, result) => {
          if (error || !result) {
            return reject(error);
          }

          resolve(result.secure_url);
        },
      );

      stream.end(buffer);
    });

    return prisma.user.update({
      where: { id: userId },
      data: { avatar: url },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        createdAt: true,
      },
    });
  },

  async updateEmail(userId: string, data: UpdateEmailInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const isValid = await bcrypt.compare(data.password, user.password);

    if (!isValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new ConflictError("Email already in use");
    }

    try {
      return await prisma.user.update({
        where: { id: userId },
        data: { email: data.email },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          avatar: true,
          bio: true,
          createdAt: true,
        },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new ConflictError("Email already in use");
      }

      throw err;
    }
  },

  async updatePassword(userId: string, data: UpdatePasswordInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const isValid = await bcrypt.compare(data.currentPassword, user.password);

    if (!isValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const hashed = await bcrypt.hash(data.newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });
  },

  async deleteAccount(userId: string, token: string) {
    try {
      await prisma.user.delete({ where: { id: userId } });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        throw new NotFoundError("User not found");
      }

      throw err;
    }

    const decoded = jwt.decode(token) as { exp?: number } | null;

    if (decoded?.exp) {
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);

      if (ttl > 0) {
        await redis.set(`blacklist:${token}`, "1", "EX", ttl);
      }
    }

    return { success: true };
  },

  async updateGeminiApiKey(userId: string, apiKey: string | null) {
    const hint =
      apiKey && apiKey.length > 4
        ? apiKey.slice(0, Math.min(8, apiKey.length - 4)) +
          "..." +
          apiKey.slice(-4)
        : apiKey;

    return prisma.user.update({
      where: { id: userId },
      data: {
        geminiApiKey: apiKey,
        geminiKeyHint: hint,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        geminiKeyHint: true,
        createdAt: true,
      },
    });
  },
};
