import { prisma } from "../config/prisma.js";
export const FetchReport = async (reportId: string, userId: string) => {
  const report = await prisma.foundReport.findFirst({
    where: {
      id: reportId,
      item: {
        userId: userId,
      },
    },
    include: {
      item: true,
    },
  });
  return report;
};
