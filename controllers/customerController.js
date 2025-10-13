import Customer from '../models/customerModel.js';
import CustomerSubscription from '../models/packageModel.js';
import ERROR_MESSAGES from '../utils/errors.js'; 

// GET - list customers 
export const listCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status, branch } = req.query;

    const query = {};
    if (search) query['personalInfo.name'] = { $regex: search, $options: 'i' };
    if (status) query['status'] = status; 
    if (branch) query['branch'] = branch; 

    const customers = await Customer.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Customer.countDocuments(query);

    res.json({
      message: 'Customers fetched successfully',
      total,
      currentPage: Number(page),
      customers,
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

// POST - create new customer
export const createCustomer = async (req, res) => {
  try {
    const newCustomer = new Customer({ personalInfo: req.body });
    await newCustomer.save();

    // subscription entry 
    const newSubscription = new CustomerSubscription({
      customer: newCustomer._id,
      package: req.body.package || null,
      startDate: new Date(),
      endDate: new Date(Date.now()), 
      status: 'pending'
    });
    await newSubscription.save();

    res.status(201).json({ message: 'Customer created successfully', customer: newCustomer });
  } catch (error) {
    res
      .status(ERROR_MESSAGES.USER.CREATION_FAILED.status)
      .json({
        error: ERROR_MESSAGES.USER.CREATION_FAILED,
        details: error.message,
      });
  }
};

// GET /customers/:id - get customer details
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer)
      return res
        .status(ERROR_MESSAGES.USER.NOT_FOUND.status)
        .json({ error: ERROR_MESSAGES.USER.NOT_FOUND });

    const subscription = await CustomerSubscription.findOne({ customer: customer._id });
    res.json({ customer, subscription });
  } catch (error) {
    res
      .status(ERROR_MESSAGES.SYSTEM.DATABASE_ERROR.status)
      .json({
        error: ERROR_MESSAGES.SYSTEM.DATABASE_ERROR,
        details: error.message,
      });
  }
};

// PUT - update customer
export const updateCustomer = async (req, res) => {
  try {
    const updated = await Customer.findByIdAndUpdate(
      req.params.id,
      { personalInfo: req.body },
      { new: true }
    );
    if (!updated)
      return res
        .status(ERROR_MESSAGES.USER.NOT_FOUND.status)
        .json({ error: ERROR_MESSAGES.USER.NOT_FOUND });

    res.json({ message: 'Customer updated successfully', customer: updated });
  } catch (error) {
    res
      .status(ERROR_MESSAGES.USER.UPDATE_FAILED.status)
      .json({
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

// POST - activate service
export const activateService = async (req, res) => {
  try {
    const subscription = await CustomerSubscription.findOne({ customer: req.params.id });
    if (!subscription)
      return res
        .status(ERROR_MESSAGES.USER.NOT_FOUND.status)
        .json({ error: ERROR_MESSAGES.USER.NOT_FOUND });

    subscription.status = 'active';
    await subscription.save();

    res.json({ message: 'Customer service activated', subscription });
  } catch (error) {
    res
      .status(ERROR_MESSAGES.SYSTEM.DATABASE_ERROR.status)
      .json({
        error: ERROR_MESSAGES.SYSTEM.DATABASE_ERROR,
        details: error.message,
      });
  }
};
