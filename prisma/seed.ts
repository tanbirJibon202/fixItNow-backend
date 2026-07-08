import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

const ADMIN_EMAIL = "admin@fixitnow.com";
const ADMIN_PASSWORD = "Admin@123";

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

  const technicianPassword = await bcrypt.hash("Technician@123", 10);
  const technicianUser = await prisma.user.upsert({
    where: { email: "technician@fixitnow.com" },
    create: {
      name: "Sample Technician",
      email: "technician@fixitnow.com",
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

  await prisma.service.upsert({
    where: { id: "seed-service-pipe-repair" },
    create: {
      id: "seed-service-pipe-repair",
      title: "Pipe Leak Repair",
      description: "Fix leaking pipes and faucets",
      price: 35,
      durationMins: 60,
      categoryId: plumbingCategory.id,
      technicianId: technicianProfile.id,
    },
    update: {},
  });
  console.log("Seeded sample technician with a service");

  const customerPassword = await bcrypt.hash("Customer@123", 10);
  await prisma.user.upsert({
    where: { email: "customer@fixitnow.com" },
    create: {
      name: "Sample Customer",
      email: "customer@fixitnow.com",
      password: customerPassword,
      role: "CUSTOMER",
    },
    update: {},
  });
  console.log("Seeded sample customer -> email: customer@fixitnow.com | password: Customer@123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
