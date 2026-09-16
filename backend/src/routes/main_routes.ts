import { Router } from "express";
import itemroutes from "../routes/itemroutes.js";
import publicroutes from "../routes/public_routes.js";
import ReportRoutes from "../routes/reportroutes.js";
// import webhookroutes from "../routes/webhookroutes.js";
// import commentroutes from "./commentRoutes.js";
const router = Router();
// router.use("/api/post", Postroutes);
router.use("/api/items", itemroutes);
router.use("/api/submitreport", publicroutes);
router.use("/api/reports", ReportRoutes);

// router.use("/api/webhook/resend", webhookroutes);
export default router;
