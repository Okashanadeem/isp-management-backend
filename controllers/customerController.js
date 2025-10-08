import Customer from '../models/customerModel.js';

export const createCustomer = async (req,res) => {
try {
    const {name,cnic,phone,email,hashPassword,address,landmark} = req.body;


const existingCustomer = await Customer.findone ({'personalinfo.email':email});
if (existingCustomer){

return res.status(400).json({message : 'customer already exists'});

}

 const newCustomer = new Customer({
      PersonalInfo: {
        name,
        cnic,
        phone,
        email,
        hashPassword,
        address,
        landmark,

    },
    });
 const savedCustomer = await newCustomer.save();
 res.status(201).json({message:'customer saved sucessfully' , customer: savedCustomer});

}
catch(error){
    res.status(500).json({message:'Server Error', error : error.message});

}
};

export const getAllCustomers = async (req,res) => {
try {
const Customers = await customer.find();
res.status(200).json(customers);
}
catch (error) {
    res.status(500).json({message:'Server Error', error: error.message});
}
};

export const getCustomerById = async (req,res) => {
try { 
    const customers = await Customer.findById(req.params.id);
    if (!customers) return res.status(404).json ({message:'user not found'});
res.status(200).json('customer'); 

}
catch(error) {
    res.status(500).json({message:'Server Error', error:error.message});
}

};

export const updateCustomer = async (req,res) => {

try {

const updatedCustomer = await Customer.findByIdAndUpdate(
    req.params.id,
    {'PersonalInfo': req.body },
    {new:true}
);
if (!updatedCustomer) res.status(404).json({message:'User not found'});
res.status(200).json({message:'User Updated Successfully',customer:updatedCustomer});

}
catch(error){
res.status(500).json({message:'Server Error', error:error.message});
}
};

export const deleteCustomer = async (req,res) =>{

    try {
const deletedCustomer = await Customer.findByIdAndDelete (res.query.params);
 if (!deletedCustomer) return res.status(404).json ({messsage:'user not found'});
res.status(200).json({message:'user deleted sucessfully'});
}
catch(error){
res.status(500).json({message:'Server Error', error:error.message})
}
};