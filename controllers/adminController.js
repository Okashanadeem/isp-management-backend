import Customer from "../models/customerModel.js";
import Ticket from "../models/ticketModel.js";
import Branch from "../models/branchModel.js"; // <--- added import
import ERROR_MESSAGES from "../utils/errors.js";
import mongoose from "mongoose";


export const getDashboard = async (req, res) => {
  try {
    const branchId = req.user.branch;

    // Query for superadmin vs branch admin
    const customerQuery = req.user.role === "superadmin" ? {} : { branch: branchId };
    const ticketQuery = req.user.role === "superadmin" ? {} : { branch: branchId };

    // Fetch counts and latest tickets in parallel
    const [totalCustomers, totalTickets, latestTickets] = await Promise.all([
      Customer.countDocuments(customerQuery),
      Ticket.countDocuments(ticketQuery),
      Ticket.find(ticketQuery)
        .populate("createdBy", "name email")
        .populate("customer", "personalInfo.name personalInfo.email")
        .sort({ createdAt: -1 })
        .limit(5), // Show latest 5 tickets
    ]);

    res.json({
      message: "Dashboard Data",
      data: {
        totalCustomers,
        totalTickets,
        latestTickets,
      },
    });
  } catch (error) {
    res.status(ERROR_MESSAGES.SYSTEM.DATABASE_ERROR.status).json({
      error: ERROR_MESSAGES.SYSTEM.DATABASE_ERROR,
      details: error.message,
    });
  }
};



export const listCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const branchId = req.user.branch;

    // Restrict non-superadmins to their branch only
    const query =
      req.user.role === "superadmin"
        ? {
          "personalInfo.name": { $regex: search, $options: "i" },
        }
        : {
          branch: branchId,
          "personalInfo.name": { $regex: search, $options: "i" },
        };

    const customers = await Customer.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Customer.countDocuments(query);

    res.json({
      message: "Customers fetched successfully",
      total,
      currentPage: Number(page),
      customers,
    });
  } catch (error) {
    res.status(ERROR_MESSAGES.SYSTEM.DATABASE_ERROR.status).json({
      error: ERROR_MESSAGES.SYSTEM.DATABASE_ERROR,
      details: error.message,
    });
  }
};


export const addCustomer = async (req, res) => {
  try {
    const branchId = req.user.branch;

    const newCustomer = new Customer({
      personalInfo: req.body,
      branch: branchId,
    });

    await newCustomer.save();

    res.status(201).json({
      message: "Customer added successfully",
      customer: newCustomer,
    });
  } catch (error) {
    res.status(ERROR_MESSAGES.USER.CREATION_FAILED.status).json({
      error: ERROR_MESSAGES.USER.CREATION_FAILED,
      details: error.message,
    });
  }
};


export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure admin can only update their branch's customers
    const query =
      req.user.role === "superadmin"
        ? { _id: id }
        : { _id: id, branch: req.user.branch };

    const updated = await Customer.findOneAndUpdate(
      query,
      { personalInfo: req.body },
      { new: true }
    );

    if (!updated) {
      return res.status(ERROR_MESSAGES.USER.NOT_FOUND.status).json({
        error: ERROR_MESSAGES.USER.NOT_FOUND,
      });
    }

    res.json({
      message: "Customer updated successfully",
      customer: updated,
    });
  } catch (error) {
    res.status(ERROR_MESSAGES.USER.UPDATE_FAILED.status).json({
      error: ERROR_MESSAGES.USER.UPDATE_FAILED,
      details: error.message,
    });
  }
};


export const uploadDocuments = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: ERROR_MESSAGES.SYSTEM.FILE_SYSTEM_ERROR,
        details: "No files were uploaded",
      });
    }

    const uploadedDocs = req.files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
    }));

    // Restrict non-superadmins to their branch's customers
    const query =
      req.user.role === "superadmin"
        ? { _id: id }
        : { _id: id, branch: req.user.branch };

    const updatedCustomer = await Customer.findOneAndUpdate(
      query,
      { $push: { documents: { $each: uploadedDocs } } },
      { new: true }
    );

    if (!updatedCustomer) {
      return res.status(ERROR_MESSAGES.USER.NOT_FOUND.status).json({
        error: ERROR_MESSAGES.USER.NOT_FOUND,
      });
    }

    res.json({
      message: "Documents uploaded successfully",
      documents: uploadedDocs,
    });
  } catch (error) {
    res.status(ERROR_MESSAGES.SYSTEM.FILE_SYSTEM_ERROR.status).json({
      error: ERROR_MESSAGES.SYSTEM.FILE_SYSTEM_ERROR,
      details: error.message,
    });
  }
};

export const createTicket = async (req, res) => {
  try {
    const { title, description, priority, category, customerId } = req.body;
    const branchId = req.user.branch;

    // Verify customer exists and belongs to the branch (if customerId provided)
    if (customerId) {
      const customer = await Customer.findOne({
        _id: customerId,
        branch: branchId,
      });

      if (!customer) {
        return res.status(404).json({
          error: {
            code: "CUSTOMER_NOT_FOUND",
            message: "Customer not found or does not belong to your branch",
          },
        });
      }
    }

    const ticketData = {
      title,
      description,
      priority: priority || "medium",
      category,
      createdBy: req.user._id,
      branch: branchId,
      customer: customerId || null,
      statusHistory: [
        {
          status: "open",
          updatedBy: req.user._id,
          comment: "Ticket created",
        },
      ],
    };

    const ticket = await Ticket.create(ticketData);

    // Populate ticket data
    await ticket.populate([
      { path: "createdBy", select: "name email" },
      { path: "branch", select: "name location" },
      { path: "customer", select: "personalInfo.name personalInfo.email personalInfo.phone" },
    ]);

    res.status(201).json({
      message: "Ticket created successfully",
      ticket,
    });
  } catch (error) {
    res.status(ERROR_MESSAGES.SYSTEM.DATABASE_ERROR.status).json({
      error: ERROR_MESSAGES.SYSTEM.DATABASE_ERROR,
      details: error.message,
    });
  }
};


export const getMyTickets = async (req, res) => {
  try {
    const { status, priority, category, page = 1, limit = 10 } = req.query;
    const branchId = req.user.branch;

    const query = { branch: branchId };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tickets, total] = await Promise.all([
      Ticket.find(query)
        .populate("createdBy", "name email")
        .populate("customer", "personalInfo.name personalInfo.email")
        .populate("assignedTo", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Ticket.countDocuments(query),
    ]);

    res.json({
      message: "Tickets fetched successfully",
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      tickets,
    });
  } catch (error) {
    res.status(ERROR_MESSAGES.SYSTEM.DATABASE_ERROR.status).json({
      error: ERROR_MESSAGES.SYSTEM.DATABASE_ERROR,
      details: error.message,
    });
  }
};


export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const branchId = req.user.branch;

    const ticket = await Ticket.findOne({
      _id: id,
      branch: branchId,
    })
      .populate("createdBy", "name email")
      .populate("branch", "name location")
      .populate("customer", "personalInfo.name personalInfo.email personalInfo.phone")
      .populate("assignedTo", "name email")
      .populate("statusHistory.updatedBy", "name email");

    if (!ticket) {
      return res.status(404).json({
        error: {
          code: "TICKET_NOT_FOUND",
          message: "Ticket not found or access denied",
        },
      });
    }

    res.json({
      message: "Ticket fetched successfully",
      ticket,
    });
  } catch (error) {
    res.status(ERROR_MESSAGES.SYSTEM.DATABASE_ERROR.status).json({
      error: ERROR_MESSAGES.SYSTEM.DATABASE_ERROR,
      details: error.message,
    });
  }
};

// ========================== BRANCH ANALYTICS FUNCTIONS ==========================

// Branch customer analytics
export const getBranchCustomerAnalytics = async (req, res) => {
  try {
    const branchId = req.user.branch;

    const result = await Customer.aggregate([
      {
        $match: { branch: branchId }
      },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          customersWithDocuments: {
            $sum: {
              $cond: [{ $gt: [{ $size: "$documents" }, 0] }, 1, 0]
            }
          },
          avgDocumentsPerCustomer: {
            $avg: { $size: "$documents" }
          }
        }
      }
    ]);

    res.json({
      message: "Branch customer analytics",
      data: result[0] || {
        totalCustomers: 0,
        customersWithDocuments: 0,
        avgDocumentsPerCustomer: 0
      }
    });
  } catch (error) {
    res.status(ERROR_MESSAGES.SYSTEM.DATABASE_ERROR.status).json({
      error: ERROR_MESSAGES.SYSTEM.DATABASE_ERROR,
      details: error.message,
    });
  }
};

// Branch bandwidth usage
export const getBranchBandwidthAnalytics = async (req, res) => {
  try {
    const branchId = req.user.branch;
    const { from, to } = req.query;

    // For now, we'll use branch data since bandwidth is stored in Branch model
    // Validate branchId before converting to ObjectId
    if (!branchId || !mongoose.isValidObjectId(branchId)) {
      // no branch available on the user or invalid id -> return default object
      return res.json({
        message: "Branch Bandwidth analytics",
        data: {
          _id: branchId || null,
          name: null,
          city: null,
          bandwidthAllocated: 0,
          bandwidthUsed: 0,
          bandwidthRemaining: 0,
          usagePercentage: 0,
        },
      });
    }

    const result = await Branch.aggregate([
      // Ensure we match by ObjectId; branchId may be a string
      { $match: { _id: new mongoose.Types.ObjectId(branchId) } },
      {
        $project: {
          _id: 1,
          name: 1,
          city: "$location.city",
          bandwidthAllocated: "$bandwidth.allocated",
          bandwidthUsed: "$bandwidth.used",
          bandwidthRemaining: "$bandwidth.remaining",
          usagePercentage: {
            // guard against divide-by-zero if allocated is 0
            $round: [
              {
                $multiply: [
                  {
                    $cond: [
                      { $gt: ["$bandwidth.allocated", 0] },
                      { $divide: ["$bandwidth.used", "$bandwidth.allocated"] },
                      0
                    ]
                  },
                  100
                ]
              },
              2
            ]
          }
        }
      }
    ]);
    console.log("Branch ID:", branchId);

    // Aggregate returns an array; return the single object or defaults
    const data = (result && result.length > 0) ? result[0] : {
      _id: branchId,
      name: null,
      city: null,
      bandwidthAllocated: 0,
      bandwidthUsed: 0,
      bandwidthRemaining: 0,
      usagePercentage: 0
    };

    res.json({
      message: "Branch Bandwidth analytics",
      data
    });
  } catch (error) {
    res.status(ERROR_MESSAGES.SYSTEM.DATABASE_ERROR.status).json({
      error: ERROR_MESSAGES.SYSTEM.DATABASE_ERROR,
      details: error.message,

    });
  }
};

// Branch performance metrics
export const getBranchPerformanceAnalytics = async (req, res) => {
  try {
    const branchId = req.user.branch;
    const { from, to, metric } = req.query;

    const matchStage = { branch: branchId };
    if (from || to) {
      matchStage.createdAt = {};
      if (from) matchStage.createdAt.$gte = new Date(from);
      if (to) matchStage.createdAt.$lte = new Date(to);
    }

    const result = await Customer.aggregate([
      {
        $match: matchStage
      },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          customersWithDocuments: {
            $sum: {
              $cond: [{ $gt: [{ $size: "$documents" }, 0] }, 1, 0]
            }
          },
          avgDocumentsPerCustomer: {
            $avg: { $size: "$documents" }
          }
        }
      }
    ]);

    res.json({
      message: "Branch registration trends",
      data: result
    });
  } catch (error) {
    res.status(ERROR_MESSAGES.SYSTEM.DATABASE_ERROR.status).json({
      error: ERROR_MESSAGES.SYSTEM.DATABASE_ERROR,
      details: error.message,
    });
  }
};

// Track subscriptions
export const getBranchSubscriptionAnalytics = async (req, res) => {
  try {
    const branchId = req.user.branch;
    const { from, to, status } = req.query;

    const matchStage = { branch: branchId };
    if (from || to) {
      matchStage.createdAt = {};
      if (from) matchStage.createdAt.$gte = new Date(from);
      if (to) matchStage.createdAt.$lte = new Date(to);
    }

    const result = await Customer.aggregate([
      {
        $match: matchStage
      },
      {
        $group: {
          _id: null,
          totalSubscriptions: { $sum: 1 },
          activeSubscriptions: {
            $sum: {
              $cond: [{ $ne: ["$subscription.status", "expired"] }, 1, 0]
            }
          },
          expiredSubscriptions: {
            $sum: {
              $cond: [{ $eq: ["$subscription.status", "expired"] }, 1, 0]
            }
          }
        }
      }
    ]);

    res.json({
      message: "Top customers by documents",
      data: result
    });
  } catch (error) {
    res.status(ERROR_MESSAGES.SYSTEM.DATABASE_ERROR.status).json({
      error: ERROR_MESSAGES.SYSTEM.DATABASE_ERROR,
      details: error.message,
    });
  }
};
