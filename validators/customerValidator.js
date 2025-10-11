import Joi from 'joi';
export const validateCustomer = Joi.object({
  personalInfo: Joi.object({
    name: Joi.string().min(3).max(40).required().trim(),
    phone: Joi.string().pattern(/^(\+92|0)?[0-9]{10,12}$/).required(),
    cnic: Joi.string().pattern(/^[0-9]{13}$/).required(),
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    hashPassword: Joi.string().min(6).required(),
    address: Joi.string().required().trim(),
    landmark: Joi.string().required().trim(),
  }).required()
});
