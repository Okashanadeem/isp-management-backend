import Joi from "joi";

export const createBranchSchema = Joi.object({
  name: Joi.string().trim().required(),
  address: Joi.string().trim().required(),
  city: Joi.string().trim().required(),
  coordinates: Joi.array()
    .items(Joi.number())
    .length(2)
    .required()
    .messages({
      "array.length": "Coordinates must have [longitude, latitude]",
    }),
  allocated: Joi.number().positive().required(),
  adminId: Joi.string().optional(),
  customerCount: Joi.number().min(0).optional(),
  status: Joi.string()
    .valid("active", "inactive", "maintenance")
    .optional(),
});

export const updateBranchSchema = Joi.object({
  name: Joi.string().trim().optional(),
  address: Joi.string().trim().optional(),
  city: Joi.string().trim().optional(),
  coordinates: Joi.array().items(Joi.number()).length(2).optional(),
  allocated: Joi.number().positive().optional(),
  used: Joi.number().min(0).optional(),
  adminId: Joi.string().optional(),
  customerCount: Joi.number().min(0).optional(),
  status: Joi.string()
    .valid("active", "inactive", "maintenance")
    .optional(),
});
