import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import Package from "../models/packageModel.js"; 
import CustomerSubscription from "../models/customerSubscriptionModel.js";
import Customer from "../models/customerModel.js";

const seedPackages = async () => {
  try {
    // Clear existing packages and subscriptions
    await Package.deleteMany({});
    await CustomerSubscription.deleteMany({});
    console.log("Existing packages and subscriptions cleared.");

    // Define package tiers
    const packageTiers = [
      {
        name: "Basic Internet Plan",
        speedMbps: 10,
        dataLimitGB: 200,
        durationMonths: 1,
        price: 1000,
        description: "Ideal for light browsing and emails.",
      },
      {
        name: "Standard Internet Plan",
        speedMbps: 30,
        dataLimitGB: 500,
        durationMonths: 3,
        price: 2500,
        description: "Great for families and moderate streaming.",
      },
      {
        name: "Premium Internet Plan",
        speedMbps: 100,
        dataLimitGB: 2000,
        durationMonths: 6,
        price: 5000,
        description: "Perfect for heavy use and 4K streaming.",
      },
    ];

    // Insert packages
    const createdPackages = await Package.insertMany(packageTiers);
    console.log(`${createdPackages.length} packages created successfully.`);

    // Fetch customers to assign subscriptions
    const customers = await Customer.find({});
    if (!customers.length) {
      console.log("No customers found. Please seed customers first.");
      return;
    }

    // Create subscriptions for testing cron job
    const subscriptions = [];

    for (let i = 0; i < 100; i++) {
      const randomCustomer =
        customers[Math.floor(Math.random() * customers.length)];
      const randomPackage =
        createdPackages[Math.floor(Math.random() * createdPackages.length)];

      const now = new Date();

      // Create a mix of subscription states
      let startDate, endDate, status;

      const rand = Math.random();

      if (rand < 0.3) {
        // 🔴 Expired yesterday
        startDate = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000);
        endDate = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
        status = "active"; // cron will mark as expired
      } else if (rand < 0.6) {
        // 🟠 Expiring in next 2 days
        startDate = new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000);
        endDate = new Date(now.getTime() + Math.floor(Math.random() * 2 + 1) * 24 * 60 * 60 * 1000);
        status = "active";
      } else {
        // 🟢 Active long term (won’t expire soon)
        startDate = now;
        endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        status = faker.helpers.arrayElement(["active", "pending"]);
      }

      subscriptions.push({
        customer: randomCustomer._id,
        package: randomPackage._id,
        startDate,
        endDate,
        status,
        autoRenewal: faker.datatype.boolean(),
      });
    }

    await CustomerSubscription.insertMany(subscriptions);
    console.log(`${subscriptions.length} subscriptions created successfully!`);
    console.log("Some will expire soon and some are already expired — ready for cron testing.");
  } catch (error) {
    console.error("Error seeding packages:", error);
  } finally {
    console.log("Package seeding process completed.");
  }
};

export default seedPackages;
