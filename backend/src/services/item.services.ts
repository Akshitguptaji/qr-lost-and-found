import type { ItemStatus } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import QRcode from "qrcode";
// import { string } from "better-auth";
type createItemInput = {
  label: string;
  category?: string | null;
  description?: string | null;
  status: ItemStatus;
  userId: string;
};

export const udpateItemStatus = async (
  itemId: string,
  userId: string,
  status: ItemStatus,
) => {
  const updateItemst = await prisma.item.updateMany({
    data: {
      status: status,
    },
    where: {
      id: itemId,
      userId: userId,
    },
  });
  if (updateItemst.count === 0) {
    throw new Error("NOT_FOUND_OR_UNAUTHORIZED");
  }
  return true;
};

export const createItem = async (data: createItemInput) => {
  return prisma.item.create({
    data: data,
  });
};

export const archiveItem = async (itemId: string, userId: string) => {
  //   console.log("--- DEBUGGING UPDATE ---");
  //   console.log("itemId type:", typeof itemId, "value:", JSON.stringify(itemId));
  //   console.log("userId type:", typeof userId, "value:", JSON.stringify(userId));
  const updateItem = await prisma.item.updateMany({
    data: {
      status: "ARCHIVED",
    },
    where: {
      id: itemId,
      userId: userId,
    },
  });
  if (updateItem.count === 0) {
    throw new Error("NOT_FOUND_OR_UNAUTHORIZED");
  }
  return true;
};

export const allUserItems = async (userId: string) => {
  const items = await prisma.item.findMany({
    where: { userId: userId },
    orderBy: { createdAt: "desc" },
  });
  if (!items) {
    throw new Error("NOT_FOUND");
  }
  return items;
};

export const specificItem = async (userId: string, itemId: string) => {
  const items = await prisma.item.findFirst({
    where: { userId: userId, id: itemId },
  });

  if (!items) {
    throw new Error("NOT_FOUND");
  }
  return items;
};

type updateitem = {
  label?: string;
  category?: string | null;
  description?: string | null;
  status?: ItemStatus;
};
export const updateItem = async (
  data: updateitem,
  itemId: string,
  userId: string,
) => {
  const existingItem = await prisma.item.findFirst({
    where: {
      id: itemId,
      userId: userId,
    },
  });
  if (!existingItem) {
    throw new Error("NOT_FOUND_OR_UNAUTHORIZED");
  }
  const updated = prisma.item.update({
    where: {
      id: itemId,
    },
    data: data,
  });
  return updated;
};

export const Qrcodegenerate = async (shortCode: string, userId: string) => {
  const item = await prisma.item.findUnique({
    where: {
      shortCode: shortCode,
    },
  });
  if (!item) {
    throw new Error("ITEM DOES NOT EXIST");
  }

  if (item.userId !== userId) {
    throw new Error("UNAUTHORIZED");
  }
  //qr code is  a literally just a text string (a URL) physically printed as black and white squares.
  const baseurl = process.env.FRONTEND_URL || "http://localhost:5173";
  const trackingurl = `${baseurl}/report/${shortCode}`;
  const qrDataurl = await QRcode.toDataURL(trackingurl, {
    // bts:-translate url to binary than maps those 0and 1 to a 2d grid , and than instead of saving it in apng it converts the file into base 64 text string
    errorCorrectionLevel: "H",
    //: QR codes use a mathematical algorithm called Reed-Solomon error correction
    //By setting it to "H", the library intentionally injects redundant backup data into the QR code. It makes the QR code visually denser (more dots), but it means up to 30% of the QR code can be destroyed, scratched, or covered by a sticker, and a phone camera can still read the original URL perfectly.
    margin: 2,
    //Phone cameras look for the three massive squares in the corners (called Finder Patterns) to orient the image. If other text or colors touch those squares, the camera's algorithm fails to recognize it as a QR code. Setting a margin of 2 guarantees enough empty pixels around the code so scanners can lock on instantly.
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });
  return qrDataurl;
};
//we use qrcode package cause it has built in base 64 data  url support
