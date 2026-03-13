import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const serviceTypes = [
  {
    name: "Pumping",
    slug: "pumping",
    description: "Regular septic tank pumping and cleaning",
    icon: "droplets",
  },
  {
    name: "Inspection",
    slug: "inspection",
    description: "Septic system inspection and assessment",
    icon: "search",
  },
  {
    name: "Repair",
    slug: "repair",
    description: "Septic system repair and troubleshooting",
    icon: "wrench",
  },
  {
    name: "Installation",
    slug: "installation",
    description: "New septic system installation",
    icon: "hard-hat",
  },
  {
    name: "Maintenance",
    slug: "maintenance",
    description: "Ongoing septic system maintenance",
    icon: "settings",
  },
];

async function main() {
  console.log("Seeding service types...");

  for (const st of serviceTypes) {
    await prisma.serviceType.upsert({
      where: { slug: st.slug },
      update: {},
      create: st,
    });
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
