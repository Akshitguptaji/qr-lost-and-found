import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  handleCreateItem,
  archiveItemController,
  allUserItem,
  getspecificItem,
  updateItemcontroller,
  getqrcode,
  updateItemStatusController,
} from "../controllers/itemcontroller.js";

const itemroutes = Router();
// Create an item (POST /api/items)
itemroutes.post("/", requireAuth, handleCreateItem);
// Get all items for the logged-in user (GET /api/items)
itemroutes.get("/", requireAuth, allUserItem);
// Get a specific item by ID (GET /api/items/:id)
itemroutes.get("/:id", requireAuth, getspecificItem);
itemroutes.patch("/:id/status", requireAuth, updateItemStatusController);
// Archive a specific item (PATCH /api/items/:id/archive)
itemroutes.patch("/:id/archive", requireAuth, archiveItemController);
itemroutes.get("/:shortCode/qrcode", requireAuth, getqrcode);
itemroutes.put("/:id", requireAuth, updateItemcontroller);
export default itemroutes;
