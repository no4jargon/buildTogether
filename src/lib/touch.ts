import { prisma } from './db';

export const touchExperiment = async (experimentId: string): Promise<void> => {
  await prisma.experiment.update({
    where: { id: experimentId },
    data: { lastActivityAt: new Date(), updatedAt: new Date() }
  });
};
