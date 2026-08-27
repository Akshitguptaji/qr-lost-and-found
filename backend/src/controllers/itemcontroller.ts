// import express from "express";
import type { Request, Response } from "express";
// import { auth } from "../middleware/auth.js";
import {
  createItem,
  archiveItem,
  allUserItems,
  specificItem,
  updateItem,
  Qrcodegenerate,
  udpateItemStatus,
} from "../services/item.services.js";
// import { success } from "better-auth";
// import { userAc } from "better-auth/plugins/admin/access";
// import { ItemStatus } from "@prisma/client";
export const updateItemStatusController = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.userId as string;
    if (!userId) {
      res.status(401).json({
        error: "Unauthorized",
      });
      return;
    }
    const itemId = req.params.id as string;
    const { status } = req.body;

    if (!itemId) {
      res.status(400).json({
        error: "Item ID is required",
      });
      return;
    }
    if (!status) {
      res.status(400).json({
        error: "Status is required",
      });
      return;
    }
    await udpateItemStatus(itemId, userId, status);

    return res.json({
      success: true,
      message: "item Status Updated successfully",
    });
  } catch (error: any) {
    console.error("Error in updateItemStatusController:", error);
  }
};

export const handleCreateItem = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    console.log("req.userId is:", req.userId);
    // console.log("req.user is:", req.user);
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({
        error: "Unauthorized",
      });
      return;
    }

    const { label, category, description, status } = req.body;

    // if (status !== ItemStatus.ACTIVE && status !== ItemStatus.ARCHIVED) {
    //   res.status(400).json({
    //     error: "Invalid Status",
    //   });
    // }
    const inputData = {
      label,
      category,
      description,
      status,
      userId,
    };

    const newItem = await createItem(inputData);

    const qrcodebase64 = await Qrcodegenerate(
      newItem.shortCode,
      newItem.userId,
    );

    res.status(201).json({
      success: true,
      data: newItem,
      qrcode: qrcodebase64,
    });
  } catch (error) {
    console.error("[Create Item Error]:", error);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

export const archiveItemController = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;
    const itemId = req.params.id as string;
    // console.log("Incoming Item ID:", itemId);
    // console.log("Logged-in User ID:", req.userId);
    if (!userId) {
      return res.status(400).json({
        message: "UN_AUTH.",
      });
    }
    if (!itemId) {
      return res
        .status(400)
        .json({ success: false, message: "Item ID is required" });
    }
    await archiveItem(itemId, userId);

    return res.json({
      success: true,
      message: "item archived successfully",
    });
  } catch (error: any) {
    console.error("Error in archiveItemController:", error);

    if (error.message === "NOT_FOUND_OR_UNAUTHORIZED") {
      return res.status(404).json({
        success: false,
        message: "Item not found or you do not have permission to modify it",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const allUserItem = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;
    if (!userId) {
      return res.status(400).json({
        messgae: "UN_AUTH_USER",
      });
    }
    const resultitem = await allUserItems(userId);
    return res.status(200).json({
      success: true,
      message: resultitem,
    });
  } catch (error: any) {
    console.error("Error in getting Items:", error);
    if (error === "NOT_FOUND") {
      res.json({
        message: "NO-ITEM-EXIST",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getspecificItem = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;
    const itemId = req.params.id as string;
    if (!userId) {
      return res.status(400).json({
        message: "UN_AUTH.",
      });
    }
    if (!itemId) {
      return res
        .status(400)
        .json({ success: false, message: "Item ID is required" });
    }
    const useritem = await specificItem(userId, itemId);
    return res.status(200).json({
      success: true,
      item: useritem,
    });
  } catch (error: any) {
    if (error === "NOT_FOUND") {
      return res.json({
        message: "NO-ITEM-EXIST",
      });
    }
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const updateItemcontroller = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;
    const itemId = req.params.id as string;
    if (!userId) {
      return res.status(400).json({
        message: "UN_AUTH.",
      });
    }
    if (!itemId) {
      return res
        .status(400)
        .json({ success: false, message: "Item ID is required" });
    }
    const { label, category, description, status } = req.body;

    const VALID_STATUSES = ["ACTIVE", "LOST"] as const;
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status provided. Status must be either ACTIVE or LOST.",
      });
    }

    const data = {
      label,
      category,
      description,
      status,
    };
    const updateddata = await updateItem(data, itemId, userId);
    return res.status(200).json({
      success: true,
      message: "Item updated successfully",
      data: updateddata,
    });
  } catch (error: unknown) {
    console.error("Error in updateItemController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getqrcode = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;
    const shortCode = req.params.shortCode as string;

    if (!userId) {
      return res.status(400).json({
        message: "UN_AUTH.",
      });
    }
    if (!shortCode) {
      return res
        .status(400)
        .json({ success: false, message: "ShortCode is required" });
    }
    const genqr64 = await Qrcodegenerate(shortCode, userId);

    return res.status(200).json({
      success: true,
      qrCode: genqr64,
    });
  } catch (error: any) {
    if (error.message === "ITEM DOES NOT EXIST") {
      return res.status(404).json({ message: "Item not found" });
    }
    if (error.message === "UNAUTHORIZED") {
      return res
        .status(403)
        .json({ message: "Unauthorized. This is not your item." });
    }

    return res
      .status(500)
      .json({ success: false, message: "Failed to generate QR" });
  }
};
