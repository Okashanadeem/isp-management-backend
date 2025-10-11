import Customer from "../models/customerModel.js";
import ERROR_MESSAGES from "../utils/errors.js";


export const getDashboard = async (req, res) => {
  try {
    const branchId = req.user.branch;
    const query = req.user.role === "superadmin" ? {} : { branch: branchId };

    const totalCustomers = await Customer.countDocuments(query);

    res.json({
      message: "Branch Dashboard Data",
      data: { totalCustomers },
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

    // Restrict non-superadmins to their branch’s customers
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
