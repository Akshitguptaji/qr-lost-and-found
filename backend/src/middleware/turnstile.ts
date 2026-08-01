// This function simply asks Cloudflare, "Is this a bot?" If Cloudflare says yes, it blocks the request.
import { type Request, type Response, type NextFunction } from "express";

export const verifyTurnstile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.body.turnstileToken;
  if (!token) {
    return res.status(400).json({ error: "Missing CAPTCHA token." });
  }
  const secretkey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretkey) {
    throw new Error("CRITICAL: TURNSTILE_SECRET_KEY is missing.");
  }
  const rawIp = (req.headers["cf-connecting-ip"] as string) || req.ip;
  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          secret: secretkey,
          // The left side (secret) is the name Cloudflare demands. The right side (secretkey) is the variable you created earlier that holds your .env password. You are assigning your password to Cloudflare's required slot.

          response: token,
          // The left side (response) is the name Cloudflare demands for the user's proof-of-humanity string. The right side (token) is the variable you created at the top of your function (const token = req.body.turnstileToken). You are slotting the user's token into Cloudflare's required response field.
          remoteip: rawIp,
          //Pass the IP back to Cloudflare for better bot detection
        }),
      },
    );
    const data = await response.json();
    if (!data.success) {
      return res.status(400).json({ error: "Failed CAPTCHA verification." });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: "CAPTCHA verification error." });
  }
};
