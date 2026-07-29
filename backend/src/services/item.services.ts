import type { ItemStatus } from "@prisma/client";
import { prisma } from "../config/prisma.js";

type createItemInput = {
  label: string;
  category?: string | null;
  description?: string | null;
  status: ItemStatus;
  userId: string;
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
