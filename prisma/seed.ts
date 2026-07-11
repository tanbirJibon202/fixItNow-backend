import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@fixitnow.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin@123";
const TECHNICIAN_EMAIL = process.env.SEED_TECHNICIAN_EMAIL || "technician@fixitnow.com";
const TECHNICIAN_PASSWORD = process.env.SEED_TECHNICIAN_PASSWORD || "Technician@123";
const CUSTOMER_EMAIL = process.env.SEED_CUSTOMER_EMAIL || "customer@fixitnow.com";
const CUSTOMER_PASSWORD = process.env.SEED_CUSTOMER_PASSWORD || "Customer@123";

async function main() {
  const hashedAdminPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    create: {
      name: "FixItNow Admin",
      email: ADMIN_EMAIL,
      password: hashedAdminPassword,
      role: "ADMIN",
    },
    update: {},
  });
  console.log(`Admin ready -> email: ${ADMIN_EMAIL} | password: ${ADMIN_PASSWORD}`);

  const categories = ["Plumbing", "Electrical", "Cleaning", "Painting"];
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      create: { name, description: `${name} services` },
      update: {},
    });
  }
  console.log(`Seeded ${categories.length} categories`);

  const technicianPassword = await bcrypt.hash(TECHNICIAN_PASSWORD, 10);
  const technicianUser = await prisma.user.upsert({
    where: { email: TECHNICIAN_EMAIL },
    create: {
      name: "Sample Technician",
      email: TECHNICIAN_EMAIL,
      password: technicianPassword,
      role: "TECHNICIAN",
    },
    update: {},
  });

  const technicianProfile = await prisma.technicianProfile.upsert({
    where: { userId: technicianUser.id },
    create: {
      userId: technicianUser.id,
      bio: "Experienced plumber and electrician",
      experienceYears: 5,
      skills: ["Plumbing", "Electrical"],
      location: "Dhaka",
    },
    update: {},
  });

  const plumbingCategory = await prisma.category.findUniqueOrThrow({
    where: { name: "Plumbing" },
  });

  const existingService = await prisma.service.findFirst({
    where: { technicianId: technicianProfile.id, title: "Pipe Leak Repair" },
  });

  if (!existingService) {
    await prisma.service.create({
      data: {
        title: "Pipe Leak Repair",
        description: "Fix leaking pipes and faucets",
        price: 35,
        durationMins: 60,
        categoryId: plumbingCategory.id,
        technicianId: technicianProfile.id,
      },
    });
  }
  console.log("Seeded sample technician with a service");

  const customerPassword = await bcrypt.hash(CUSTOMER_PASSWORD, 10);
  await prisma.user.upsert({
    where: { email: CUSTOMER_EMAIL },
    create: {
      name: "Sample Customer",
      email: CUSTOMER_EMAIL,
      password: customerPassword,
      role: "CUSTOMER",
    },
    update: {},
  });
  console.log(`Seeded sample customer -> email: ${CUSTOMER_EMAIL} | password: ${CUSTOMER_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
