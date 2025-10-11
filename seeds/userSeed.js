import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log("Existing users cleared.");

    // --- Super Admin ---
    const superAdminPassword = await bcrypt.hash("SuperSecure123!", 10);
    const superAdmin = {
      name: "Super Admin",
      email: "superadmin@example.com",
      password: superAdminPassword,
      role: "superadmin",
      permissions: ["all"],
    };

    await User.create(superAdmin);
    console.log("Superadmin created.");

    // --- Normal Admins ---
    const admins = [];

    for (let i = 1; i <= 50; i++) {
      const hashedPassword = await bcrypt.hash(`AdminPass${i}!`, 10);

      admins.push({
        name: `Admin User ${i}`,
        email: `admin${i}@example.com`,
        password: hashedPassword,
        role: "admin",
        permissions: ["read", "write", "update"],
      });
    }

    await User.insertMany(admins);
    console.log(`${admins.length} admin users created.`);

    console.log("User seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding users:", error.message);
  }
};

export default seedUsers;
