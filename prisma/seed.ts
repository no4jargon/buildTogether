import { PrismaClient, maturity_stage, privacy, action_status } from '@prisma/client';

const prisma = new PrismaClient();

const createPublicId = (index: number) => `exp${index}${Math.random().toString(36).slice(2, 6)}`;

const run = async () => {
  await prisma.interestRequest.deleteMany();
  await prisma.contributorJournal.deleteMany();
  await prisma.reusableAsset.deleteMany();
  await prisma.actionItem.deleteMany();
  await prisma.experimentContributor.deleteMany();
  await prisma.experimentStatusLog.deleteMany();
  await prisma.experimentScope.deleteMany();
  await prisma.experiment.deleteMany();
  await prisma.user.deleteMany();

  const [alice, ben, claire] = await prisma.user.createMany({
    data: [
      { email: 'alice@example.com', name: 'Alice Carter', bio: 'Research lead' },
      { email: 'ben@example.com', name: 'Ben Lee', bio: 'Product builder' },
      { email: 'claire@example.com', name: 'Claire Young', bio: 'Ops & finance' }
    ]
  }).then(async () => {
    const users = await prisma.user.findMany({ orderBy: { email: 'asc' } });
    return users;
  });

  const experiments = await prisma.experiment.createMany({
    data: [
      {
        publicId: createPublicId(1),
        title: 'Community Solar Co-op',
        problemStatement: 'Neighborhoods lack affordable shared solar access.',
        solutionDirection: 'Pilot a community-owned solar subscription.',
        hypothesis: '10 households will pre-commit within 6 weeks.',
        falsificationCriteria: 'Fewer than 3 households commit.',
        maturityStage: maturity_stage.active,
        privacy: privacy.public,
        createdByUserId: alice.id,
        currentStatus: 'Interviewing early adopters.'
      },
      {
        publicId: createPublicId(2),
        title: 'Remote Work Pod',
        problemStatement: 'Remote workers feel isolated and unfocused.',
        solutionDirection: 'Create co-working pods in suburban neighborhoods.',
        maturityStage: maturity_stage.validation,
        privacy: privacy.public,
        createdByUserId: ben.id,
        currentStatus: 'Running first pod trial.'
      },
      {
        publicId: createPublicId(3),
        title: 'Zero Waste Grocery',
        problemStatement: 'Packaging waste is rising in dense cities.',
        solutionDirection: 'Offer refill stations with reusable packaging.',
        maturityStage: maturity_stage.idea,
        privacy: privacy.public,
        createdByUserId: claire.id,
        currentStatus: 'Exploring partnerships.'
      },
      {
        publicId: createPublicId(4),
        title: 'Mentorship Exchange',
        problemStatement: 'New founders lack access to peer mentors.',
        solutionDirection: 'Create structured mentor swaps.',
        maturityStage: maturity_stage.paused,
        privacy: privacy.public,
        createdByUserId: alice.id,
        currentStatus: 'Paused while refining matching criteria.'
      },
      {
        publicId: createPublicId(5),
        title: 'Civic Data Lab',
        problemStatement: 'Community leaders struggle to access local data.',
        solutionDirection: 'Build an open data workshop series.',
        maturityStage: maturity_stage.archived,
        privacy: privacy.public,
        createdByUserId: ben.id,
        currentStatus: 'Archived after pilot season.'
      }
    ]
  });

  const seededExperiments = await prisma.experiment.findMany({
    orderBy: { createdAt: 'asc' }
  });

  const [exp1, exp2, exp3, exp4, exp5] = seededExperiments;

  await prisma.experimentScope.createMany({
    data: [
      {
        experimentId: exp1.id,
        scopeKey: 'product',
        scopeLabel: 'Product direction',
        ownerUserId: alice.id
      },
      {
        experimentId: exp1.id,
        scopeKey: 'finance',
        scopeLabel: 'Financial model',
        ownerUserId: claire.id
      }
    ]
  });

  await prisma.experimentContributor.createMany({
    data: [
      {
        experimentId: exp1.id,
        userId: alice.id,
        role: 'Lead',
        weeklyHours: 12.5,
        personalRisk: 'Time'
      },
      {
        experimentId: exp1.id,
        userId: ben.id,
        role: 'Field researcher',
        weeklyHours: 6.5,
        personalRisk: 'Travel'
      }
    ]
  });

  await prisma.experimentStatusLog.createMany({
    data: [
      {
        experimentId: exp1.id,
        authorUserId: alice.id,
        entry: 'Interviewed three potential subscribers. Strong interest in summer launch.'
      },
      {
        experimentId: exp1.id,
        authorUserId: ben.id,
        entry: 'Reached out to local installers for cost estimates.'
      }
    ]
  });

  await prisma.actionItem.createMany({
    data: [
      {
        experimentId: exp2.id,
        description: 'Draft pod schedule for September pilot.',
        ownerUserId: ben.id,
        status: action_status.in_progress,
        createdByUserId: ben.id
      },
      {
        experimentId: exp2.id,
        description: 'Secure two local host venues.',
        ownerUserId: claire.id,
        status: action_status.open,
        createdByUserId: ben.id
      }
    ]
  });

  await prisma.interestRequest.create({
    data: {
      experimentId: exp3.id,
      userId: ben.id,
      why: 'I want to test local demand for refill stations.',
      weekOnePlan: 'Run surveys with two grocery partners.',
      weeklyHours: 4.5
    }
  });

  await prisma.reusableAsset.createMany({
    data: [
      {
        experimentId: exp1.id,
        createdByUserId: alice.id,
        assetType: 'Document',
        title: 'Solar co-op outreach script',
        url: 'https://example.com/outreach',
        notes: 'Draft script for household interviews.'
      },
      {
        experimentId: exp1.id,
        createdByUserId: ben.id,
        assetType: 'Spreadsheet',
        title: 'Cost model v1',
        notes: 'Initial unit economics worksheet.'
      }
    ]
  });

  const monday = new Date();
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));

  await prisma.contributorJournal.create({
    data: {
      experimentId: exp1.id,
      userId: alice.id,
      weekStartDate: monday,
      workedOn: 'Customer interviews and stakeholder outreach.',
      learned: 'Residents are excited about shared ownership.',
      blockers: 'Need updated pricing from installers.',
      assetsCreated: 'Interview script.'
    }
  });

  await prisma.experiment.updateMany({
    data: { lastActivityAt: new Date() }
  });

  await prisma.experiment.update({
    where: { id: exp1.id },
    data: { lastActivityAt: new Date() }
  });

  await prisma.experiment.update({
    where: { id: exp2.id },
    data: { lastActivityAt: new Date() }
  });

  await prisma.experiment.update({
    where: { id: exp3.id },
    data: { lastActivityAt: new Date() }
  });

  console.log('Seed complete');
};

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
