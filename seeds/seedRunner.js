import mongoose from "mongoose";
import dotenv from "dotenv";
import seedUsers from "./userSeed.js";
import seedBranches from "./branchSeed.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/isp_management";

const runSeeds = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected...");

    console.log("Seeding Users...");
    await seedUsers();

    console.log("Seeding Branches...");
    await seedBranches();

    console.log("All seed data created successfully!");
    process.exit();
  } catch (error) {
    console.error("Error running seed scripts:", error);
    process.exit(1);
  }
};

runSeeds();
