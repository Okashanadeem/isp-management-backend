import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";
import Customer from "../models/customerModel.js";
import Branch from "../models/branchModel.js";

const seedCustomers = async () => {
  try {
    await Customer.deleteMany({});
    console.log("Existing customers cleared.");

    const branches = await Branch.find({});
    if (!branches.length) {
      console.log("No branches found. Please seed branches first.");
      return;
    }

    const customers = [];

    for (let i = 1; i <= 200; i++) {
      const branch = branches[Math.floor(Math.random() * branches.length)];
      const plainPassword = "customer123"; // default password for testing
      const hashPassword = await bcrypt.hash(plainPassword, 10);

      // Generate unique CNIC and phone
      const cnic = faker.number
        .int({ min: 1000000000000, max: 9999999999999 })
        .toString();
      const phone = faker.phone.number("03#########");

      customers.push({
        personalInfo: {
          name: faker.person.fullName(),
          cnic,
          phone,
          email: faker.internet.email().toLowerCase(),
          hashPassword,
          address: faker.location.streetAddress(),
          landmark: faker.location.secondaryAddress(),
        },
        documents: [
          {
            filename: `${faker.string.uuid()}.pdf`,
            originalName: "identity-document.pdf",
            path: `/uploads/customers/${faker.string.uuid()}.pdf`,
            mimetype: "application/pdf",
            size: faker.number.int({ min: 100000, max: 500000 }),
          },
          {
            filename: `${faker.string.uuid()}.jpg`,
            originalName: "profile-picture.jpg",
            path: `/uploads/customers/${faker.string.uuid()}.jpg`,
            mimetype: "image/jpeg",
            size: faker.number.int({ min: 50000, max: 300000 }),
          },
        ],
        branch: branch._id, // optional if you decide to add branch reference later
      });
    }

    await Customer.insertMany(customers);
    console.log(`${customers.length} customers created successfully!`);
  } catch (error) {
    console.error("Error seeding customers:", error);
  } finally {
    console.log("Customer seeding process completed.");
  }
};

export default seedCustomers;
