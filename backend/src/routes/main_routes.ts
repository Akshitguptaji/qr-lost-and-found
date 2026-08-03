import { Router } from "express";
import itemroutes from "../routes/itemroutes.js";
import publicroutes from "../routes/public_routes.js";
// import commentroutes from "./commentRoutes.js";
const router = Router();
// router.use("/api/post", Postroutes);
router.use("/api/items", itemroutes);
router.use("api/submitreport", publicroutes);
export default router;
