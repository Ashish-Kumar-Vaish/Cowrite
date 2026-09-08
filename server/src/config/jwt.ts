import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "./env.js";

const JWT_SECRET = env.JWT_SECRET;
const JWT_EXPIRES_IN = (env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"];

export function signToken(payload: { id: string }) {
  const options: SignOptions = {};

  if (JWT_EXPIRES_IN) {
    options.expiresIn = JWT_EXPIRES_IN;
  }

  return jwt.sign(payload as object, JWT_SECRET, options);
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { id: string };
}
