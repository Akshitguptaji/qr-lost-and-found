import type { Request, Response, NextFunction } from "express";
import { auth } from "../config/auth.js";
import { error } from "node:console";

// export interface AuthRequest extends Request {
//   userId: String;
// }
//An interface allows you to write a custom contract or blueprint.
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  //asynv return promise and use await inside async function
  //use webheaders cause the data type is diiferentin express headers and better auth headers

  try {
    const webHeaders = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
      // this converts the headers object itno key value pairs
      if (typeof value === "string") {
        webHeaders.set(key, value);
        // In HTTP protocol, it is perfectly legal to send multiple headers with the exact same name (like multiple Accept-Encoding values). When this happens, Node.js groups them into an array. The modern Headers object requires these to be a single comma-separated string. This else if block intercepts any arrays and flattens them with .join(", ") so Better Auth doesn't choke on them.
        // (Note: Better Auth actually provides a utility called fromNodeHeaders to do this automatically, but doing it manually like you have here is perfectly valid and helps you understand the data transformation).
      } else if (Array.isArray(value)) {
        webHeaders.set(key, value.join(", "));
        //value.join(", ") takes the array and glues it together into the string: "session=123, theme=dark".
      }
    });
    const session = await auth.api.getSession({
      headers: webHeaders,
      //scan for cookie headers
    });
    if (!session || !session.user) {
      res.status(401).json({
        error: "Unauthorized :Please log in.",
      });
      return;
    }
    req.userId = session.user.id;
    //req.userId = session.user.id;, you are loading the user's ID into the back of the req truck. When the request finally hits your route (e.g., router.get('/dashboard', ...)), that route can instantly read req.userId to fetch their items from the database, without ever having to call the auth database a second time.
    next();
  } catch (error) {
    console.error("Auth Middleware Error: ", error);
    res.status(500).json({
      error: "Authentication server error",
    });
    return;
  }
};
