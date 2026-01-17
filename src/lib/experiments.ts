import { prisma } from './db';

export const findExperimentByPublicId = async (publicId: string) => {
  return prisma.experiment.findUnique({
    where: { publicId },
    include: {
      creator: true,
      scopes: { include: { owner: true } },
      contributors: { include: { user: true } }
    }
  });
};
