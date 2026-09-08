import type { NextFunction, Request, Response } from "express";
import { authService } from "./auth.service.js";
import type { RegisterInput, LoginInput } from "./auth.schema.js";
import type { AuthRequest } from "../../middleware/auth.js";

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as RegisterInput;
      const result = await authService.register(data);
      
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as LoginInput;
      const result = await authService.login(data);

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.userId!);

      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Sometimes repeating token extraction flow, make it a function later
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

      await authService.logout(token);

      return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      next(error);
    }
  },
};
