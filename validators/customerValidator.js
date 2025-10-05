import Joi from 'joi';
const CustomerValidator = Joi.object({
name:Joi.string().min(3).max(40).required().trim(),
phone: Joi.string().pattern(/^(\+92|0)?[0-9]{10,12}$/).required(),
cnic: Joi.string().required().pattern(/^[0-9]{13}$/),
email:Joi.string().tlds({{allow:false}}).required(),
hashPassword:Joi.string().min(6).required(),










});