import 'dotenv/config';
import { PrismaClient, MetadataVisibility, ProjectType } from '@prisma/client';

const prisma = new PrismaClient();

const eventId = process.env.SEED_EVENT_ID || 'event-test-2025';
const programId = process.env.SEED_PROGRAM_ID || 'codeday';
const eventGroupId = process.env.SEED_EVENT_GROUP_ID || 'spring-2025';
const regionId = process.env.SEED_REGION_ID || 'seattle';

async function run(): Promise<void> {
  await prisma.project.deleteMany({ where: { eventId } });

  await prisma.project.create({
    data: {
      name: 'Mentor Match Demo',
      description: 'Dummy project for local GraphQL testing.',
      eventId,
      programId,
      eventGroupId,
      regionId,
      type: ProjectType.APP,
      members: {
        create: [
          { username: 'alice-mentor' },
          { username: 'bob-mentor' },
          { username: 'ava-student' },
          { username: 'ben-student' },
        ],
      },
      metadata: {
        create: [
          { key: 'eventName', value: 'Local Test Event 2025', visibility: MetadataVisibility.PUBLIC },
          { key: 'mentorCount', value: '2', visibility: MetadataVisibility.PUBLIC },
          { key: 'studentCount', value: '2', visibility: MetadataVisibility.PUBLIC },
          { key: 'internalNote', value: 'admin-only test metadata', visibility: MetadataVisibility.ADMIN },
        ],
      },
    },
  });

  console.log('Dummy seed complete.');
  console.log(`Event: ${eventId}`);
  console.log('Mentors: alice-mentor, bob-mentor');
  console.log('Students: ava-student, ben-student');
}

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
