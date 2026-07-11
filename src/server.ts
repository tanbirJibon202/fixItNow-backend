import "dotenv/config";
import app from "./app.js";
import config from "./config/index.js";
import { prisma } from "./lib/prisma.js";

const PORT = config.port || 5000;

async function main() {
  try {
    await prisma.$connect();
    console.log("Connected to the database");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
