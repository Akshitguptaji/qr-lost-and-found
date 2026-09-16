import { Router } from "express";
import { getReportById } from "../controllers/reportController.js";
import { requireAuth } from "../middleware/auth.js";

const ReportRoutes = Router();
ReportRoutes.get("/:id", requireAuth, getReportById);
export default ReportRoutes;
