import type { Request, Response } from "express";
import { FetchReport } from "../services/report.services.js";
export const getReportById = async (req: Request, res: Response) => {
  // Implementation for fetching a report by ID
  try {
    const userId = req.userId as string;
    if (!userId) {
      return res.status(400).json({
        message: "UN_AUTH.",
      });
    }
    const reportId = req.params.id as string;
    if (!reportId) {
      return res.status(400).json({ error: "Report ID is required" });
    }
    if (typeof reportId !== "string") {
      return res.status(400).json({ error: "Invalid Report ID" });
    }

    const Report = await FetchReport(reportId, userId);
    return res.status(200).json({
      success: true,
      Report: Report,
    });
  } catch (error) {
    return res.status(500).json({
      message: "INTERNAL_SERVER_ERROR",
    });
  }
};
