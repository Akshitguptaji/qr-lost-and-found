// //this will handle the HTTP request to Cloudflare's servers to verify the token.
// import crypto from "crypto";
// import { Request } from "express";

// export const createFoundReport = async (req: Request, res: Response) => {
//   // 1. Get the raw IP (checking proxies just in case)
//   const rawIp = (req.headers["x-forwarded-for"] ||
//     req.socket.remoteAddress ||
//     "unknown") as string;

//   // 2. Hash it with the salt from your environment variables
//   const salt = process.env.IP_SALT;
//   if (!salt) throw new Error("IP_SALT is missing in .env");

//   const ipHash = crypto
//     .createHash("sha256")
//     .update(rawIp + salt)
//     .digest("hex");

//   // 3. Grab the User Agent
//   const userAgent = req.headers["user-agent"] || "unknown";

//   // Now pass ipHash and userAgent to Prisma...
// };
