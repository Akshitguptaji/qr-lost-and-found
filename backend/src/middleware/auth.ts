import type { Request, Response, NextFunction } from "express";
import { auth } from "../config/auth.js";
import { error } from "node:console";

export interface AuthRequest extends Request {
  userId: String;
}
//An interface allows you to write a custom contract or blueprint.
export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const webHeaders = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
      if (typeof value === "string") {
        webHeaders.set(key, value);
      } else if (Array.isArray(value)) {
        webHeaders.set(key, value.join(", "));
      }
    });
    const session = await auth.api.getSession({
      headers: webHeaders,
    });
    if (!session || !session.user) {
      res.status(401).json({
        error: "Unauthorized :Please log in.",
      });
      return;
    }
    req.userId = session.user.id;
    next();
  } catch (error) {
    console.error("Auth Middleware Error: ", error);
    res.status(500).json({
      error: "Authentication server error",
    });
    return;
  }
};
