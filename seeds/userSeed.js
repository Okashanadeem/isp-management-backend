import User from "../models/userModel.js";

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log("Existing users cleared.");

    // Super Admin
    const superAdmin = {
      name: "Super Admin",
      email: "superadmin@example.com",
      password: "SuperSecure123!",
      role: "superadmin",
      permissions: ["all"],
    };

    await User.create(superAdmin);
    console.log("Superadmin created.");

    // Normal Admins
    const admins = [];

    for (let i = 1; i <= 50; i++) {
      admins.push({
        name: `Admin User ${i}`,
        email: `admin${i}@example.com`,
        password: `AdminPass${i}!`,
        role: "admin",
        permissions: ["read", "write", "update"],
      });
    }

    await User.insertMany(admins);
    console.log(`${admins.length} admins created.`);

    console.log("User seed completed successfully!");
  } catch (error) {
    console.error("Error seeding users:", error);
  }
};

export default seedUsers;
