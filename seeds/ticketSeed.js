import Ticket from "../models/ticketModel.js";
import User from "../models/userModel.js";
import Branch from "../models/branchModel.js";
import Customer from "../models/customerModel.js";

const seedTickets = async () => {
  try {
    await Ticket.deleteMany({});
    console.log("Existing tickets cleared.");

    const superAdmin = await User.findOne({ role: "superadmin" });
    const admins = await User.find({ role: "admin" });
    const branches = await Branch.find({});
    const customers = await Customer.find({});

    if (!superAdmin) {
      console.log("❌ No Super Admin found. Please seed users first.");
      return;
    }

    if (admins.length === 0 || branches.length === 0) {
      console.log("❌ No admins or branches found. Please seed users and branches first.");
      return;
    }

    const tickets = [];
    const statuses = ["open", "in_progress", "pending", "resolved", "closed"];

    const ticketTemplates = [
      { title: "Internet connection down", description: "Complete loss of connectivity.", category: "technical", priority: "urgent" },
      { title: "Slow internet speed", description: "Experiencing slower speeds.", category: "technical", priority: "high" },
      { title: "Billing discrepancy", description: "Charged incorrect amount.", category: "billing", priority: "medium" },
      { title: "Router configuration issue", description: "Cannot configure WiFi settings.", category: "customer_support", priority: "low" },
      { title: "Fiber cable damaged", description: "Fiber optic cable damaged.", category: "infrastructure", priority: "urgent" },
      { title: "Package upgrade request", description: "Requesting upgrade to higher package.", category: "customer_support", priority: "low" },
      { title: "Intermittent connection drops", description: "Connection drops frequently.", category: "technical", priority: "high" },
      { title: "Payment not reflected", description: "Payment not showing in system.", category: "billing", priority: "medium" },
      { title: "New connection installation", description: "Request for new installation.", category: "infrastructure", priority: "medium" },
      { title: "WiFi range issue", description: "Weak WiFi signal.", category: "customer_support", priority: "low" },
    ];

    for (let i = 0; i < 100; i++) {
      const branch = branches[i % branches.length];

      // Pick random admin from the same branch
      const branchAdmins = admins.filter(
        (admin) => admin.branch && admin.branch.toString() === branch._id.toString()
      );
      const admin =
        branchAdmins.length > 0
          ? branchAdmins[Math.floor(Math.random() * branchAdmins.length)]
          : admins[Math.floor(Math.random() * admins.length)];

      // Optionally assign a customer
      const branchCustomers = customers.filter(
        (c) => c.branch && c.branch.toString() === branch._id.toString()
      );
      const associateCustomer = Math.random() < 0.7 && branchCustomers.length > 0;
      const customer = associateCustomer
        ? branchCustomers[Math.floor(Math.random() * branchCustomers.length)]
        : null;

      const template = ticketTemplates[Math.floor(Math.random() * ticketTemplates.length)];

      const statusWeights = [0.3, 0.3, 0.15, 0.15, 0.1];
      const randomStatus = () => {
        const random = Math.random();
        let cumulative = 0;
        for (let j = 0; j < statusWeights.length; j++) {
          cumulative += statusWeights[j];
          if (random < cumulative) return statuses[j];
        }
        return statuses[0];
      };

      const status = randomStatus();
      const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

      // Generate unique ticket number
      const branchCode = branch._id.toString().slice(-4).toUpperCase();
      const uniqueSuffix = `${Date.now().toString().slice(-5)}${i}`;
      const ticketNumber = `TKT-${branchCode}-${uniqueSuffix}`;

      // Construct ticket object
      const ticketData = {
        ticketNumber,
        title: `${template.title} - ${branch.name}`,
        description: template.description,
        priority: template.priority,
        category: template.category,
        status,
        createdBy: admin._id, 
        assignedTo: superAdmin._id, 
        branch: branch._id,
        customer: customer ? customer._id : null,
        createdAt,
        statusHistory: [
          {
            status: "open",
            updatedBy: admin._id,
            comment: "Ticket created by admin",
            updatedAt: createdAt,
          },
        ],
      };

      // Simulate status progression
      if (status !== "open") {
        const statusTransitions = {
          in_progress: ["open", "in_progress"],
          pending: ["open", "in_progress", "pending"],
          resolved: ["open", "in_progress", "resolved"],
          closed: ["open", "in_progress", "resolved", "closed"],
        };
        const transitions = statusTransitions[status];
        if (transitions) {
          for (let j = 1; j < transitions.length; j++) {
            ticketData.statusHistory.push({
              status: transitions[j],
              updatedBy: superAdmin._id,
              comment: `Status updated to ${transitions[j]}`,
              updatedAt: new Date(createdAt.getTime() + j * 24 * 60 * 60 * 1000),
            });
          }
        }
      }

      if (status === "resolved" || status === "closed") {
        ticketData.resolvedAt = new Date(createdAt.getTime() + 5 * 24 * 60 * 60 * 1000);
      }
      if (status === "closed") {
        ticketData.closedAt = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
      }

      tickets.push(ticketData);
    }

    await Ticket.insertMany(tickets, { ordered: false });
    console.log(`${tickets.length} tickets created successfully!`);

    const stats = await Ticket.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
    console.log("\n📊 Ticket Status Distribution:");
    stats.forEach((s) => console.log(`  ${s._id}: ${s.count}`));
  } catch (error) {
    console.error("Error seeding tickets:", error);
    throw error;
  }
};

export default seedTickets;
