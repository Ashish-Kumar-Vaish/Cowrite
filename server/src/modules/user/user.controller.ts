import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../../middleware/auth.js";
import { userService } from "./user.service.js";
import type {
  UpdateProfileInput,
  UpdateEmailInput,
  UpdatePasswordInput,
  UpdateGeminiApiKeyInput,
} from "./user.schema.js";

export const userController = {
  async getPublicProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const username = req.params.username as string;

      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }

      const user = await userService.getPublicProfile(username);

      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },

  async searchByEmail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const email = (req.query.email as string)?.toLowerCase();

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await userService.searchByEmail(email, req.userId!);

      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = req.body as UpdateProfileInput;

      const user = await userService.updateProfile(req.userId!, data);

      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },

  async updateAvatar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const user = await userService.updateAvatar(req.userId!, req.file.buffer);

      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },

  async updateEmail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = req.body as UpdateEmailInput;

      const user = await userService.updateEmail(req.userId!, data);

      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },

  async updatePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = req.body as UpdatePasswordInput;

      await userService.updatePassword(req.userId!, data);

      return res.status(200).json({ message: "Password updated" });
    } catch (error) {
      next(error);
    }
  },

  async deleteAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ message: "Invalid authorization header" });
      }

      const token = authHeader.split(" ")[1];

      if (!token) {
        return res.status(401).json({ message: "Invalid token" });
      }

      await userService.deleteAccount(req.userId!, token);

      return res.status(200).json({ message: "Account deleted" });
    } catch (error) {
      next(error);
    }
  },

  async updateGeminiApiKey(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { apiKey } = req.body as UpdateGeminiApiKeyInput;

      const user = await userService.updateGeminiApiKey(
        req.userId!,
        apiKey ?? null,
      );

      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },
};
