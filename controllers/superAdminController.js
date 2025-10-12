import Branch from "../models/branchModel.js";
import User from "../models/userModel.js";
import Ticket from "../models/ticketModel.js";
import Customer from "../models/customerModel.js";
import ERROR_MESSAGES from "../utils/errors.js";
import AppError from "../utils/AppError.js";

// ========================== DASHBOARD ==========================
export const getDashboard = async (req, res, next) => {
  try {
    const totalBranches = await Branch.countDocuments();
    const totalAdmins = await User.countDocuments({ role: "admin" });

    const bandwidthStats = await Branch.aggregate([
      {
        $group: {
          _id: null,
          totalAllocated: { $sum: "$bandwidth.allocated" },
          totalUsed: { $sum: "$bandwidth.used" },
          totalRemaining: { $sum: "$bandwidth.remaining" },
        },
      },
    ]);

    const stats = bandwidthStats[0] || {
      totalAllocated: 0,
      totalUsed: 0,
      totalRemaining: 0,
    };

    res.status(200).json({
      success: true,
      data: {
        totalBranches,
        totalAdmins,
        totalBandwidth: stats,
      },
    });
  } catch (error) {
    next(
      new AppError(
        `${ERROR_MESSAGES.SYSTEM.DATABASE_ERROR.message}: ${error.message}`,
        ERROR_MESSAGES.SYSTEM.DATABASE_ERROR.statusCode
      )
    );
  }
};

// ========================== GET BRANCHES ==========================
export const getBranches = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, city } = req.query;
    const query = city ? { "location.city": city } : {};

    const branches = await Branch.find(query)
      .populate("admin", "name email role")
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Branch.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      data: branches,
    });
  } catch (error) {
    next(
      new AppError(
        `${ERROR_MESSAGES.SYSTEM.DATABASE_ERROR.message}: ${error.message}`,
        ERROR_MESSAGES.SYSTEM.DATABASE_ERROR.statusCode
      )
    );
  }
};

// ========================== CREATE BRANCH ==========================
export const createBranch = async (req, res, next) => {
  try {
    const {
      name,
      address,
      city,
      coordinates,
      allocated,
      adminId,
      customerCount,
    } = req.body;

    const branch = await Branch.create({
      name,
      location: {
        address,
        city,
        coordinates,
        geolocation: { type: "Point", coordinates },
      },
      bandwidth: {
        allocated,
        used: 0,
        remaining: allocated,
      },
      admin: adminId || null,
      customerCount: customerCount || 0,
    });

    res.status(201).json({
      success: true,
      message: "Branch created successfully",
      data: branch,
    });
  } catch (error) {
    console.error(error); // log real error for debugging
    next(
      new AppError(
        `${ERROR_MESSAGES.BRANCH.CREATION_FAILED.message}: ${error.message}`,
        ERROR_MESSAGES.BRANCH.CREATION_FAILED.statusCode
      )
    );
  }
};

// ========================== UPDATE BRANCH ==========================
export const updateBranch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedBranch = await Branch.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedBranch)
      throw new AppError(
        ERROR_MESSAGES.BRANCH.NOT_FOUND.message,
        ERROR_MESSAGES.BRANCH.NOT_FOUND.statusCode
      );

    res.status(200).json({
      success: true,
      message: "Branch updated successfully",
      data: updatedBranch,
    });
  } catch (error) {
    if (error instanceof AppError) return next(error);
    next(
      new AppError(
        `${ERROR_MESSAGES.BRANCH.UPDATE_FAILED.message}: ${error.message}`,
        ERROR_MESSAGES.BRANCH.UPDATE_FAILED.statusCode
      )
    );
  }
};

// ========================== DELETE BRANCH ==========================
export const deleteBranch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const branch = await Branch.findByIdAndDelete(id);

    if (!branch)
      throw new AppError(
        ERROR_MESSAGES.BRANCH.NOT_FOUND.message,
        ERROR_MESSAGES.BRANCH.NOT_FOUND.statusCode
      );

    res.status(200).json({
      success: true,
      message: "Branch deleted successfully",
    });
  } catch (error) {
    if (error instanceof AppError) return next(error);
    next(
      new AppError(
        `${ERROR_MESSAGES.BRANCH.DELETION_FAILED.message}: ${error.message}`,
        ERROR_MESSAGES.BRANCH.DELETION_FAILED.statusCode
      )
    );
  }
};

// ========================== CREATE BRANCH ADMIN ==========================
export const createBranchAdmin = async (req, res, next) => {
  try {
    const { name, email, password, branchId } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      throw new AppError(
        ERROR_MESSAGES.AUTH.EMAIL_EXISTS.message,
        ERROR_MESSAGES.AUTH.EMAIL_EXISTS.statusCode
      );

    const admin = await User.create({
      name,
      email,
      password,
      role: "admin",
    });

    if (branchId) {
      await Branch.findByIdAndUpdate(branchId, { admin: admin._id });
    }

    res.status(201).json({
      success: true,
      message: "Branch admin created successfully",
      data: admin,
    });
  } catch (error) {
    if (error instanceof AppError) return next(error);
    next(
      new AppError(
        `${ERROR_MESSAGES.USER.CREATION_FAILED.message}: ${error.message}`,
        ERROR_MESSAGES.USER.CREATION_FAILED.statusCode
      )
    );
  }
};

// ========================== GET ANALYTICS ==========================
export const getAnalytics = async (req, res, next) => {
  try {
    const { branch } = req.query;
    const filter = branch ? { _id: branch } : {};

    const analytics = await Branch.aggregate([
      { $match: filter },
      {
        $project: {
          name: 1,
          "bandwidth.allocated": 1,
          "bandwidth.used": 1,
          "bandwidth.remaining": 1,
          customerCount: 1,
          usagePercent: {
            $round: [
              {
                $multiply: [
                  { $divide: ["$bandwidth.used", "$bandwidth.allocated"] },
                  100,
                ],
              },
              2,
            ],
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: analytics.length,
      data: analytics,
    });
  } catch (error) {
    next(
      new AppError(
        `${ERROR_MESSAGES.SYSTEM.DATABASE_ERROR.message}: ${error.message}`,
        ERROR_MESSAGES.SYSTEM.DATABASE_ERROR.statusCode
      )
    );
  }
};


// ============================================
// TICKET MANAGEMENT (Super Admin)
// ============================================

// Get all tickets across all branches
export const getAllTickets = async (req, res, next) => {
  try {
    const { status, priority, category, branch, page = 1, limit = 10 } = req.query;

    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (branch) query.branch = branch;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tickets, total] = await Promise.all([
      Ticket.find(query)
        .populate("createdBy", "name email")
        .populate("branch", "name location")
        .populate("customer", "personalInfo.name personalInfo.email personalInfo.phone")
        .populate("assignedTo", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Ticket.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: tickets,
    });
  } catch (error) {
    next(
      new AppError(
        `${ERROR_MESSAGES.SYSTEM.DATABASE_ERROR.message}: ${error.message}`,
        ERROR_MESSAGES.SYSTEM.DATABASE_ERROR.statusCode
      )
    );
  }
};


// Get ticket details by ID
export const getTicketDetailsById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findById(id)
      .populate("createdBy", "name email")
      .populate("branch", "name location contactNumber")
      .populate("customer", "personalInfo.name personalInfo.email personalInfo.phone personalInfo.address")
      .populate("assignedTo", "name email")
      .populate("statusHistory.updatedBy", "name email");

    if (!ticket) {
      throw new AppError("Ticket not found", 404);
    }

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    if (error instanceof AppError) return next(error);
    next(
      new AppError(
        `${ERROR_MESSAGES.SYSTEM.DATABASE_ERROR.message}: ${error.message}`,
        ERROR_MESSAGES.SYSTEM.DATABASE_ERROR.statusCode
      )
    );
  }
};


// Update ticket status
export const updateTicketStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, comment, assignedTo } = req.body;

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      throw new AppError("Ticket not found", 404);
    }

    // Update status history
    ticket.statusHistory.push({
      status,
      updatedBy: req.user._id,
      comment: comment || `Status changed to ${status}`,
    });

    ticket.status = status;

    if (assignedTo) {
      // Verify the assigned user exists
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser) {
        throw new AppError("Assigned user not found", 404);
      }
      ticket.assignedTo = assignedTo;
    }

    // Set resolved/closed dates
    if (status === "resolved" && !ticket.resolvedAt) {
      ticket.resolvedAt = new Date();
    }

    if (status === "closed" && !ticket.closedAt) {
      ticket.closedAt = new Date();
    }

    await ticket.save();

    await ticket.populate([
      { path: "createdBy", select: "name email" },
      { path: "branch", select: "name location" },
      { path: "customer", select: "personalInfo.name personalInfo.email personalInfo.phone" },
      { path: "assignedTo", select: "name email" },
      { path: "statusHistory.updatedBy", select: "name email" },
    ]);

    res.status(200).json({
      success: true,
      message: "Ticket status updated successfully",
      data: ticket,
    });
  } catch (error) {
    if (error instanceof AppError) return next(error);
    next(
      new AppError(
        `${ERROR_MESSAGES.SYSTEM.DATABASE_ERROR.message}: ${error.message}`,
        ERROR_MESSAGES.SYSTEM.DATABASE_ERROR.statusCode
      )
    );
  }
};


// Get ticket statistics
export const getTicketStats = async (req, res, next) => {
  try {
    const [statusStats, priorityStats, categoryStats] = await Promise.all([
      Ticket.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      Ticket.aggregate([
        {
          $group: {
            _id: "$priority",
            count: { $sum: 1 },
          },
        },
      ]),
      Ticket.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        byStatus: statusStats,
        byPriority: priorityStats,
        byCategory: categoryStats,
      },
    });
  } catch (error) {
    next(
      new AppError(
        `${ERROR_MESSAGES.SYSTEM.DATABASE_ERROR.message}: ${error.message}`,
        ERROR_MESSAGES.SYSTEM.DATABASE_ERROR.statusCode
      )
    );
  }
};