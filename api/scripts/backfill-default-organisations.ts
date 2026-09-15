// One-off backfill: give every existing user who isn't a member of any
// organisation yet a personal default organisation, with themselves as an
// Admin member. New users get this at registration time instead (see
// EmailAuthService.registerWithEmail / OrganisationsService.createDefault) —
// run this once to cover accounts created before that existed.
import { PrismaClient, OrganisationRole } from 'generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string });
const prisma = new PrismaClient({ adapter });

async function generateUniqueSlug(base: string) {
  const root =
    base
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'workspace';

  let slug = root;
  let suffix = 1;
  while (await prisma.organisation.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${root}-${suffix}`;
  }
  return slug;
}

async function main() {
  const users = await prisma.user.findMany({
    where: { organisation_memberships: { none: {} } },
    select: { id: true, name: true },
  });

  console.log(`Found ${users.length} user(s) without an organisation.`);

  for (const user of users) {
    const slug = await generateUniqueSlug(user.name);

    await prisma.$transaction(async (tx) => {
      const organisation = await tx.organisation.create({
        data: {
          name: `${user.name}'s Workspace`,
          slug,
          created_by_user_id: user.id,
        },
      });

      await tx.organisationMember.create({
        data: {
          organisation_id: organisation.id,
          user_id: user.id,
          role: OrganisationRole.ADMIN,
        },
      });
    });

    console.log(`Created default organisation "${slug}" for user ${user.id}`);
  }

  console.log('Done.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
