import Customer from "../models/customerModel.js";
import Ticket from "../models/ticketModel.js";
import CustomerSubscription from "../models/customerSubscriptionModel.js";  
import ERROR_MESSAGES from "../utils/errors.js";
import moment from "moment";                                                 
                                                        
import Branch from "../models/branchModel.js";
import CustomerSubscription from "../models/customerSubscriptionModel.js";
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
        .limit(5), 
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

                // List Customer
export const listCustomers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      plan,
      subscriptionDate,
      expiryDate,
    } = req.query;

    const branchId = req.user.branch; // from JWT

     // Role-based base query (superadmin vs branch admin)
    const baseQuery =
      req.user.role === "superadmin"
        ? { "personalInfo.name": { $regex: search, $options: "i" } }
        : { branch: branchId, "personalInfo.name": { $regex: search, $options: "i" } };

    //  Add ObjectId search 
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(search);
    if (search && isObjectId) {
      baseQuery.$or = [
        { "personalInfo.name": { $regex: search, $options: "i" } },
        { _id: search },
      ];
    }
        ? {
          "personalInfo.name": { $regex: search, $options: "i" },
        }
        : {
          branch: branchId,
          "personalInfo.name": { $regex: search, $options: "i" },
        };

    //Reusable lookups (to avoid repeating in total count)
    const lookups = [
      {
        $lookup: {
          from: "customersubscriptions",
          localField: "_id",
          foreignField: "customer",
          as: "subscription",
        },
      },
      { $unwind: { path: "$subscription", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "packages",
          localField: "subscription.package",
          foreignField: "_id",
          as: "package",
        },
      },
      { $unwind: { path: "$package", preserveNullAndEmptyArrays: true } },
    ];

    // Compact filter creation
    const matchConditions = [
      status && { "subscription.status": status },
      plan && { "package.name": { $regex: plan, $options: "i" } },
      subscriptionDate && { "subscription.startDate": { $gte: new Date(subscriptionDate) } },
      expiryDate && { "subscription.endDate": { $lte: new Date(expiryDate) } },
    ].filter(Boolean);

    //  Main aggregation pipeline
    const pipeline = [
      { $match: baseQuery },
      ...lookups,
      ...(matchConditions.length ? [{ $match: { $and: matchConditions } }] : []),
      { $skip: (page - 1) * Number(limit) },
      { $limit: Number(limit) },
    ];

    const customers = await Customer.aggregate(pipeline);

    // total count query 
    const totalResults = await Customer.aggregate([
      { $match: baseQuery },
      ...lookups,
      ...(matchConditions.length ? [{ $match: { $and: matchConditions } }] : []),
      { $count: "total" },
    ]);

    const total = totalResults[0]?.total || 0;

    res.status(ERROR_MESSAGES.SYSTEM.UNKNOWN_ERROR.statusCode).json({
      message: "Customers fetched successfully",
      total,
      currentPage: Number(page),
      customers,
    });

  } catch (error) {
    console.error("Error listing customers:", error);
    
    res
      .status(ERROR_MESSAGES.SYSTEM.DATABASE_ERROR.status)
      .json({
        error: ERROR_MESSAGES.SYSTEM.DATABASE_ERROR,
        details: error.message,
      });
  }
};
              // get Customer Details

export const getCustomerById = async (req, res) => {
  try {
    // only access customers from their branch
    const branchId = req.user.branch;
    const customer = await Customer.findOne({
      _id: req.params.id,
      ...(req.user.role === "branchadmin" ? { branch: branchId } : {}), 
    })
      .select("personalInfo documents createdAt updatedAt") 
      .lean();

    if (!customer)
      return res
        .status(ERROR_MESSAGES.USER.NOT_FOUND.status)
        .json({ error: ERROR_MESSAGES.USER.NOT_FOUND });

    //  Fetch subscription 
    const subscription = await CustomerSubscription.findOne({ customer: customer._id })
      .populate("package", "name speedMbps dataLimitGB durationMonths price description") 
      .lean();

    res.json({
      message: "Customer details fetched successfully",
      customer,
      subscription,
    });
  } catch (error) {
    res
      .status(ERROR_MESSAGES.SYSTEM.DATABASE_ERROR.status)
      .json({
        error: ERROR_MESSAGES.SYSTEM.DATABASE_ERROR,
        details: error.message,
      });
  }
};

export const createTicket = async (req, res) => {
  try {
    const { title, description, priority, category, customerId } = req.body;
    const branchId = req.user.branch;

    // Verify customer exists and belongs to the branch 
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

// Expiring within 2 days
export const getExpiringSubscriptions = async (req, res) => {
  try {
    const now = moment().startOf('day');
    const twoDaysFromNow = moment().add(2, 'days').endOf('day');

    const expiringSoon = await CustomerSubscription.find({
      endDate: { $gte: now.toDate(), $lte: twoDaysFromNow.toDate() },
      status: 'active',
    }).populate('customer package');

    res.status(200).json({
      success: true,
      total: expiringSoon.length,
      expiringSoon,
    });
  } catch (error) {
    console.error('Error fetching expiring subscriptions:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// expire today
export const getExpiredSubscriptions = async (req, res) => {
  try {
    const today = moment().startOf('day');

    const expired = await CustomerSubscription.find({
      endDate: { $lt: today.toDate() },
      status: 'expired',
    }).populate('customer package');

    res.status(200).json({
      success: true,
      total: expired.length,
      expired,
    });
  } catch (error) {
    console.error('Error fetching expired subscriptions:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
// ========================== BRANCH ANALYTICS FUNCTIONS ==========================

// Branch customer analytics
export const getBranchCustomerAnalytics = async (req, res) => {
  try {
    const branchId = req.user.branch;

    // Convert branchId to ObjectId if it's a string
    const branchObjectId = mongoose.Types.ObjectId.isValid(branchId) 
      ? new mongoose.Types.ObjectId(branchId) 
      : branchId;

    const result = await Customer.aggregate([
      {
        $match: { branch: branchObjectId }
      },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          customersWithDocuments: {
            $sum: {
              $cond: [{ $gt: [{ $size: { $ifNull: ["$documents", []] } }, 0] }, 1, 0]
            }
          },
          avgDocumentsPerCustomer: {
            $avg: { $size: { $ifNull: ["$documents", []] } }
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

    // Convert branchId to ObjectId if it's a string
    const branchObjectId = mongoose.Types.ObjectId.isValid(branchId) 
      ? new mongoose.Types.ObjectId(branchId) 
      : branchId;

    const matchStage = { branch: branchObjectId };
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
          _id: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" }
          },
          totalCustomers: { $sum: 1 },
          customersWithDocuments: {
            $sum: {
              $cond: [{ $gt: [{ $size: { $ifNull: ["$documents", []] } }, 0] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
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

    // Convert branchId to ObjectId if it's a string
    const branchObjectId = mongoose.Types.ObjectId.isValid(branchId) 
      ? new mongoose.Types.ObjectId(branchId) 
      : branchId;

    // First, get all customers for this branch
    const customers = await Customer.find({ branch: branchObjectId }).select('_id');
    const customerIds = customers.map(c => c._id);

    const matchStage = { 
      customer: { $in: customerIds }
    };
    
    if (status) {
      matchStage.status = status;
    }
    
    if (from || to) {
      matchStage.createdAt = {};
      if (from) matchStage.createdAt.$gte = new Date(from);
      if (to) matchStage.createdAt.$lte = new Date(to);
    }

    const result = await CustomerSubscription.aggregate([
      {
        $match: matchStage
      },
      {
        $group: {
          _id: null,
          totalSubscriptions: { $sum: 1 },
          activeSubscriptions: {
            $sum: {
              $cond: [{ $eq: ["$status", "active"] }, 1, 0]
            }
          },
          expiredSubscriptions: {
            $sum: {
              $cond: [{ $eq: ["$status", "expired"] }, 1, 0]
            }
          },
          pendingSubscriptions: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, 1, 0]
            }
          },
          suspendedSubscriptions: {
            $sum: {
              $cond: [{ $eq: ["$status", "suspended"] }, 1, 0]
            }
          }
        }
      }
    ]);

    res.json({
      message: "Subscription analytics",
      data: result[0] || {
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        expiredSubscriptions: 0,
        pendingSubscriptions: 0,
        suspendedSubscriptions: 0
      }
    });
  } catch (error) {
    res.status(ERROR_MESSAGES.SYSTEM.DATABASE_ERROR.status).json({
      error: ERROR_MESSAGES.SYSTEM.DATABASE_ERROR,
      details: error.message,
    });
  }
};

