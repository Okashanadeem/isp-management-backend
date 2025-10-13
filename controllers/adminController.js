import Customer from '../models/customerModel.js';
import ERROR_MESSAGES from '../utils/errors.js';  
import moment from 'moment';
import CustomerSubscription from '../models/packageModel.js'; 

// GET /admin/dashboard
export const getDashboard = async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    res.json({
      message: 'Branch Dashboard Data',
      data: { totalCustomers }
    });
  } 
  catch (error) {
    res.status(ERROR_MESSAGES.SYSTEM.DATABASE_ERROR.status).json({
      error: ERROR_MESSAGES.SYSTEM.DATABASE_ERROR,
      details: error.message
    });
  }
};

// GET /admin/customers
export const listCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const query = {
      'PersonalInfo.name': { $regex: search, $options: 'i' }
    };

    const customers = await Customer.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Customer.countDocuments(query);

    res.json({
      message: 'Customers list fetched successfully',
      total,
      currentPage: Number(page),
      customers
    });
  } 
  catch (error) {
    res.status(ERROR_MESSAGES.SYSTEM.DATABASE_ERROR.status).json({
      error: ERROR_MESSAGES.SYSTEM.DATABASE_ERROR,
      details: error.message
    });
  }
};

// POST /admin/customers
export const addCustomer = async (req, res) => {
  try {
    const newCustomer = new Customer({
      PersonalInfo: req.body
    });
    await newCustomer.save();
    res.status(201).json({ message: 'Customer added successfully', customer: newCustomer });
  } 
  catch (error) {
    res.status(ERROR_MESSAGES.USER.CREATION_FAILED.status).json({
      error: ERROR_MESSAGES.USER.CREATION_FAILED,
      details: error.message
    });
  }
};

// PUT /admin/customers/:id
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Customer.findByIdAndUpdate(
      id,
      { PersonalInfo: req.body },
      { new: true }
    );
    if (!updated)
      return res.status(ERROR_MESSAGES.USER.NOT_FOUND.status).json({
        error: ERROR_MESSAGES.USER.NOT_FOUND
      });

    res.json({ message: 'Customer updated successfully', customer: updated });
  } 
  catch (error) {
    res.status(ERROR_MESSAGES.USER.UPDATE_FAILED.status).json({
      error: ERROR_MESSAGES.USER.UPDATE_FAILED,
      details: error.message
    });
  }
};

// POST /admin/customers/:id/documents
export const uploadDocuments = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: ERROR_MESSAGES.SYSTEM.FILE_SYSTEM_ERROR,
        details: "No files were uploaded"
      });
    }

    const uploadedDocs = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
    }));

    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      { $push: { documents: { $each: uploadedDocs } } },
      { new: true }
    );

    if (!updatedCustomer)
      return res.status(ERROR_MESSAGES.USER.NOT_FOUND.status).json({
        error: ERROR_MESSAGES.USER.NOT_FOUND
      });

    res.json({
      message: 'Documents uploaded successfully',
      documents: uploadedDocs
    });
  } 
  catch (error) {
    res.status(ERROR_MESSAGES.SYSTEM.FILE_SYSTEM_ERROR.status).json({
      error: ERROR_MESSAGES.SYSTEM.FILE_SYSTEM_ERROR,
      details: error.message
    });
  }
};


//  1) Expiring within 2 days
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

// 2) expired today
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




