import Joi from 'joi';

const loginValidator = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

export { loginValidator };
