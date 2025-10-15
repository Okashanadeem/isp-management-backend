import Branch from "../models/branchModel.js";
import User from "../models/userModel.js";
import { faker } from "@faker-js/faker";

const seedBranches = async () => {
  try {
    // Clear existing branches
    await Branch.deleteMany({});
    console.log("Existing branches cleared.");

    // Get all admin users
    const admins = await User.find({ role: "admin" });
    if (!admins.length) {
      console.log("No admins found. Please seed users first.");
      return; // just return, don't exit
    }

    const branches = [];

    for (let i = 1; i <= 100; i++) {
      const randomAdmin = admins[Math.floor(Math.random() * admins.length)];
      const allocatedBandwidth = faker.number.int({ min: 500, max: 5000 });
      const usedBandwidth = faker.number.int({ min: 0, max: allocatedBandwidth });

      branches.push({
        name: `Branch ${i} - ${faker.location.street()}`,
        location: {
          address: faker.location.streetAddress(),
          city: faker.location.city(),
          coordinates: [
            parseFloat(faker.location.longitude()),
            parseFloat(faker.location.latitude()),
          ],
          geolocation: {
            type: "Point",
            coordinates: [
              parseFloat(faker.location.longitude()),
              parseFloat(faker.location.latitude()),
            ],
          },
        },
        bandwidth: {
          allocated: allocatedBandwidth,
          used: usedBandwidth,
        },
        admin: randomAdmin._id,
        customerCount: faker.number.int({ min: 0, max: 500 }),
        status: faker.helpers.arrayElement(["active", "inactive", "maintenance"]),
      });
    }

    const created = await Branch.insertMany(branches);
    console.log(`${created.length} branches created successfully!`);

    // Assign each branch to its admin user (one branch per admin may be overwritten)
    for (const b of created) {
      try {
        if (b.admin) {
          await User.findByIdAndUpdate(b.admin, { branch: b._id });
        }
      } catch (err) {
        console.warn(`Failed to assign branch ${b._id} to admin ${b.admin}:`, err.message);
      }
    }
  } catch (error) {
    console.error("Error seeding branches:", error);
  }
};

export default seedBranches;
