import crypto from "crypto";
import type { Request } from "express";
export const getIpHash = (req: Request): string => {
  const rawIp = (req.headers[
    "cf-connecting-ip"
    //here the real of the user is hidden
  ] ||
    req.ip ||
    "unknown") as string;
  const salt = process.env.IP_SALT as string;
  if (!salt) {
    throw new Error("CRITICAL: IP_SALT is missing in .env");
  }
  return crypto.createHmac("sha256", salt).update(rawIp).digest("hex");
};
