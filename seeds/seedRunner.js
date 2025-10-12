import mongoose from "mongoose";
import dotenv from "dotenv";

import seedUsers from "./userSeed.js";
import seedBranches from "./branchSeed.js";
import seedPackages from "./packageSeed.js";
import seedCustomers from "./customerSeed.js";
import seedTickets from "./ticketSeed.js";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/isp_management";

const runSeeds = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected successfully.\n");

    console.log("Seeding Users...");
    await seedUsers();

    console.log("\nSeeding Branches...");
    await seedBranches();

    console.log("\nSeeding Packages...");
    await seedPackages();

    console.log("\nSeeding Customers...");
    await seedCustomers();

    console.log("\nSeeding Tickets...");
    await seedTickets();

    console.log("\nAll seed data created successfully!");
  } catch (error) {
    console.error("Error running seed scripts:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
    process.exit(0);
  }
};

runSeeds();