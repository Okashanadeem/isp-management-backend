export default (schema) => async (req, res, next) => {
  try {
    await schema.validateAsync(req.body, { abortEarly: false, stripUnknown: true });
    return next();
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.details || err.message,
      data: null,
      timestamp: new Date().toISOString()
    });
  }
};
