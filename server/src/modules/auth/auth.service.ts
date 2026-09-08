import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/db.js";
import { signToken } from "../../config/jwt.js";
import type { RegisterInput, LoginInput } from "./auth.schema.js";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../../error.js";
import { redis } from "../../config/redis.js";
import { Prisma } from "../../../generated/prisma/client.js";

export const authService = {
  async register(data: RegisterInput) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }],
      },
    });

    if (existing) {
      throw new ConflictError("Email or username already in use");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    let user;

    try {
      user = await prisma.user.create({
        data: {
          ...data,
          password: hashedPassword,
        },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          avatar: true,
          bio: true,
        },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new ConflictError("Email or username already in use");
      }

      throw err;
    }

    const token = signToken({ id: user.id });

    return { user, token };
  },

  async login(data: LoginInput) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.identifier }, { username: data.identifier }],
      },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const isValid = await bcrypt.compare(data.password, user.password);

    if (!isValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const token = signToken({ id: user.id });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  },

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  },

  async logout(token: string) {
    const decoded = jwt.decode(token) as { exp?: number } | null;

    if (decoded?.exp) {
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);

      // Blacklist if the token has not expired yet
      if (ttl > 0) {
        await redis.set(`blacklist:${token}`, "1", "EX", ttl);
      }
    }
  },
};
