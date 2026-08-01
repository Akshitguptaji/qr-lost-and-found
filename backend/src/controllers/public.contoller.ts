import crypto from "crypto";
import type { Request, Response } from "express";


// // export const createFoundReport = async (req: Request, res: Response) => {
// //   // 1. Get the raw IP (checking proxies just in case)
// //   const rawIp = (req.headers["x-forwarded-for"] ||
// //     req.socket.remoteAddress ||
// //     "unknown") as string;

// //   // 2. Hash it with the salt from your environment variables
// //   const salt = process.env.IP_SALT;
// //   if (!salt) throw new Error("IP_SALT is missing in .env");

// //   const ipHash = crypto
// //     .createHash("sha256")
// //     .update(rawIp + salt)
// //     .digest("hex");

// //   // 3. Grab the User Agent
// //   const userAgent = req.headers["user-agent"] || "unknown";

// //   // Now pass ipHash and userAgent to Prisma...
// // };

// // controllers/public.controller.js
// // You can import your Prisma client here

// export const submitFoundReport = async (req, res) => {
//   const { shortCode } = req.params;
//   const { latitude, longitude, accuracy, message, honeypot } = req.body;

//   // 1. Check the honeypot (if the bot filled in a hidden field, just pretend it worked)
//   if (honeypot) return res.status(200).json({ ok: true });

//   // 2. Validate coordinates (as per the blueprint)
//   if (latitude != null && (latitude < -90 || latitude > 90)) {
//     return res.status(400).json({ error: "invalid coordinates" });
//   }
//   // ... (do the same for longitude)

//   // 3. Make sure they actually sent a message
//   if (!message?.trim()) {
//     return res.status(400).json({ error: "message required" });
//   }

//   // 4. Generate the ipHash (like we discussed earlier)
//   const ipHash = getIpHash(req);

//   // 5. Finally, use Prisma to save to the database!
//   try {
//     // Find item by shortCode...
//     // Create FoundReport and ScanEvent...
//     // Send email alert (you can import an email service function here if you want)

//     return res.status(200).json({ ok: true });
//   } catch (err) {
//     return res.status(500).json({ error: "Database error" });
//   }
// };
