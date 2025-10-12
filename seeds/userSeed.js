import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log("Existing users cleared.");

    // --- Superadmin ---
    const superAdmin = {
      name: "Super Admin",
      email: "superadmin@example.com",
      password: "SuperSecure123!",
      role: "superadmin",
      permissions: ["all"],
    };

    await User.create(superAdmin); 
    console.log("Superadmin created.");

    // --- Normal Admins ---
    const admins = [];

    for (let i = 1; i <= 50; i++) {
      const plain = `AdminPass${i}!`;
      const hashed = await bcrypt.hash(plain, 10); 

      admins.push({
        name: `Admin User ${i}`,
        email: `admin${i}@example.com`,
        password: hashed,
        role: "admin",
        permissions: ["read", "write", "update"],
      });
    }

    await User.insertMany(admins, { ordered: false });
    console.log(`${admins.length} admin users created.`);

    console.log("User seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding users:", error.message);
  }
};

export default seedUsers;
