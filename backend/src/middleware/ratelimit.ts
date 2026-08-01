import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import type { Request, Response } from "express";
export const rateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hr window
  limit: 5,
  message: "Too many requests from this IP, please try again after an hour",
  // The keyGenerator MUST return a string

  keyGenerator: (
    req: Request,
    res: Response,
  ): 
  //By default, Express rate limit tracks people purely by their IP address. We need to override that. If a helpful person finds two different lost items you own, they should be allowed to report both. This function builds a custom "ID badge" so the limiter tracks requests based on both the user and the specific item
  //
  string => {
    const safeIp = ipKeyGenerator(
      req.ip ?? req.socket.remoteAddress ?? " ",
      56,
      //Mobile phones (which finders will use to scan the QR code) often use IPv6 addresses. Phones constantly rotate the last few digits of an IPv6 address for privacy. If you rate-limit the exact IP, a spammer's phone just rotates the digits and bypasses your 5-request limit. The 56 tells the library to chop off those rotating digits and group the mobile IP by its broader network block, making your security bulletproof against mobile IP hopping.
    );
    return `${safeIp}:${req.params.shortCode}`;
  },

  standardHeaders: "draft-8",
  // Return rate limit info in the `RateLimit-*` headers
  //  It adds headers like RateLimit-Limit, RateLimit-Remaining, and RateLimit-Reset. This is the recommended setting for new applications.
  legacyHeaders: false,
  // Disable the `X-RateLimit-*` headers
  //   this disables the older, outdated way of sending this info (X-RateLimit-Limit, X-RateLimit-Remaining, etc.).
});
