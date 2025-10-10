import Customer from '../models/customer.model.js';

// GET /admin/dashboard
export const getDashboard = async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    res.json({
      message: 'Branch Dashboard Data',
      data: { totalCustomers }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error loading dashboard', error: error.message });
  }
};

// GET /admin/customers?page&limit&status&search
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
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customers', error: error.message });
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
  } catch (error) {
    res.status(400).json({ message: 'Error adding customer', error: error.message });
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
    if (!updated) return res.status(404).json({ message: 'Customer not found' });

    res.json({ message: 'Customer updated successfully', customer: updated });
  } catch (error) {
    res.status(400).json({ message: 'Error updating customer', error: error.message });
  }
};

// POST /admin/customers/:id/documents
export const uploadDocuments = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
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

    if (!updatedCustomer) return res.status(404).json({ message: 'Customer not found' });

    res.json({
      message: 'Documents uploaded successfully',
      documents: uploadedDocs
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading documents', error: error.message });
  }
};