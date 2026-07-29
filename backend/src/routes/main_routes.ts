import { Router } from "express";
import itemroutes from "../routes/itemroutes.js";
// import commentroutes from "./commentRoutes.js";
const router = Router();
// router.use("/api/post", Postroutes);
router.use("/api/items", itemroutes);

export default router;
