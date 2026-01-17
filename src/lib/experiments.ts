import { prisma } from './db';

export const findExperimentByPublicId = async (
  publicId: string,
  userId?: string
) => {
  return prisma.experiment.findUnique({
    where: { publicId },
    include: {
      creator: true,
      scopes: { include: { owner: true } },
      contributors: { include: { user: true } },
      ...(userId
        ? {
            bookmarks: {
              where: { userId },
              select: { id: true }
            }
          }
        : {})
    }
  });
};
