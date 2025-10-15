import fs from "fs";
import path from "path";
import Customer from '../models/customerModel.js';
import CustomerSubscription from '../models/customerSubscriptionModel.js';
import ERROR_MESSAGES from '../utils/errors.js'; 
import { validateCustomer } from "../validators/customerValidator.js";
import Package from "../models/packageModel.js"; 

export const createCustomer = async (req, res) => {
  try {
    // Validate request body
    const { error } = validateCustomer.validate(req.body);
    if (error)
      return res
        .status(ERROR_MESSAGES.SYSTEM.UNKNOWN_ERROR.status)
        .json({
          error: ERROR_MESSAGES.SYSTEM.UNKNOWN_ERROR,
          details: error.details[0].message,
        });

    // Require uploaded document
    if (!req.files || req.files.length === 0)
      return res
        .status(ERROR_MESSAGES.SYSTEM.FILE_SYSTEM_ERROR.status)
        .json({
          error: ERROR_MESSAGES.SYSTEM.FILE_SYSTEM_ERROR,
          message: "At least one document is required.",
        });

    // Prepare uploaded documents
    const documents = req.files.map((f) => ({
      filename: f.filename,
      originalName: f.originalname,
      path: f.path,
      mimetype: f.mimetype,
      size: f.size,
    }));

    // Extract package name manually entered by branch admin
    const { packageName } = req.body;
    if (!packageName)
      return res.status(ERROR_MESSAGES.USER.CREATION_FAILED.status).json({
        error: ERROR_MESSAGES.USER.CREATION_FAILED,
        message: "Package name is required.",
      });

    // Find package by name
    const selectedPackage = await Package.findOne({
      name: { $regex: new RegExp(`^${packageName}$`, "i") },
    });
    if (!selectedPackage)
      return res.status(ERROR_MESSAGES.USER.CREATION_FAILED.status).json({
        error: ERROR_MESSAGES.USER.CREATION_FAILED,
        message: "Package not found with that name.",
      });

    // Create and save new customer
    const customer = new Customer({
      personalInfo: req.body.personalInfo,
      documents,
    });
    await customer.save();

    //  Create subscription for the customer
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + selectedPackage.durationMonths);

    const subscription = new CustomerSubscription({
      customer: customer._id,
      package: selectedPackage._id,
      startDate,
      endDate,
      status: "active",
    });

    await subscription.save();

    //  Include subscription info in response
    return res.json({
      message: "Customer and subscription created successfully",
      id: customer._id,
      subscriptionId: subscription._id,
      package: selectedPackage.name,
    });

  } catch (err) {
    // Handle duplicate key (unique field conflict)
    if (err.code === 11000)
      return res
        .status(ERROR_MESSAGES.AUTH.EMAIL_EXISTS.status)
        .json({
          error: ERROR_MESSAGES.AUTH.EMAIL_EXISTS,
          message: "Duplicate email, phone, or CNIC.",
        });

    // General failure
    return res
      .status(ERROR_MESSAGES.USER.CREATION_FAILED.status)
      .json({
        error: ERROR_MESSAGES.USER.CREATION_FAILED,
        details: err.message,
      });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate personal info before updating
    const { error } = validateCustomer.validate(req.body);
    if (error) {
      return res.status(ERROR_MESSAGES.SYSTEM.UNKNOWN_ERROR.status).json({
        error: ERROR_MESSAGES.SYSTEM.UNKNOWN_ERROR,
        details: error.details[0].message,
      });
    }

    const query =
      req.user.role === "superadmin"
        ? { _id: id }
        : { _id: id, branch: req.user.branch };

    //  Fetch customer and delete old docs 
    const existingCustomer = await Customer.findOne(query);
    if (!existingCustomer) {
      return res.status(ERROR_MESSAGES.USER.NOT_FOUND.status).json({
        error: ERROR_MESSAGES.USER.NOT_FOUND,
      });
    }

    let updatedDocuments = existingCustomer.documents;
    if (req.files && req.files.length > 0) {
      // Delete old files from disk
      existingCustomer.documents.forEach((doc) => {
        const filePath = path.resolve(doc.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      // 📎 Add new uploaded files
      updatedDocuments = req.files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
      }));
    }

    // Handle package update
    let updatedSubscription = null;
    if (req.body.packageName) {
      const packageName = req.body.packageName;
      const selectedPackage = await Package.findOne({
        name: { $regex: new RegExp(`^${packageName}$`, "i") },
      });

      if (!selectedPackage) {
        return res.status(ERROR_MESSAGES.USER.UPDATE_FAILED.status).json({
          error: ERROR_MESSAGES.USER.UPDATE_FAILED,
          message: "Package not found with that name.",
        });
      }

      //  Update subscription dates
      const startDate = req.body.startDate
        ? new Date(req.body.startDate)
        : new Date();
      const endDate = req.body.endDate
        ? new Date(req.body.endDate)
        : new Date(startDate.setMonth(startDate.getMonth() + selectedPackage.durationMonths));

      // Update  subscription
      updatedSubscription = await CustomerSubscription.findOneAndUpdate(
        { customer: id },
        {
          package: selectedPackage._id,
          startDate,
          endDate,
          status: "active",
        },
        { new: true, upsert: true }
      );
    }

    // Update customer info 
    const updatedCustomer = await Customer.findOneAndUpdate(
      query,
      {
        personalInfo: req.body.personalInfo,
        documents: updatedDocuments,
      },
      { new: true }
    );

    if (!updatedCustomer) {
      return res.status(ERROR_MESSAGES.USER.UPDATE_FAILED.status).json({
        error: ERROR_MESSAGES.USER.UPDATE_FAILED,
      });
    }

    res.json({
      message: "Customer updated successfully",
      customer: updatedCustomer,
      subscription: updatedSubscription,
    });
  } catch (error) {
    res.status(ERROR_MESSAGES.USER.UPDATE_FAILED.status).json({
      error: ERROR_MESSAGES.USER.UPDATE_FAILED,
      details: error.message,
    });
  }
};

// POST - suspend service
export const suspendService = async (req, res) => {
  try {
    const subscription = await CustomerSubscription.findOne({ customer: req.params.id });
    if (!subscription)
      return res
        .status(ERROR_MESSAGES.USER.NOT_FOUND.status)
        .json({ error: ERROR_MESSAGES.USER.NOT_FOUND });

    subscription.status = 'suspended';
    await subscription.save();

    res.json({ message: 'Customer service suspended', subscription });
  } catch (error) {
    res
      .status(ERROR_MESSAGES.SYSTEM.DATABASE_ERROR.status)
      .json({
        error: ERROR_MESSAGES.SYSTEM.DATABASE_ERROR,
        details: error.message,
      });
  }
};