import express from "express";
import type { Request, Response } from "express";
import { toNodeHandler } from "better-auth/node";
import "dotenv/config";
import { auth } from "../src/config/auth.js";
import router from "../src/routes/main_routes.js";
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 7000;
app.use(router);
app.all("/api/auth/*path", toNodeHandler(auth));
//tonodehandler act as a translater .

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "hi",
  });
});

app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
