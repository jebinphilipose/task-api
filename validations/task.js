const { Joi } = require('express-validation');

module.exports = {
  createTask: {
    body: Joi.object({
      description: Joi.string().trim().required(),
      status: Joi.string().trim().uppercase().valid('OPEN')
        .default('OPEN'),
    }),
  },
  updateTask: {
    body: Joi.object({
      description: Joi.string().trim(),
      status: Joi.string().trim().uppercase().valid('OPEN', 'IN_PROGRESS', 'COMPLETED'),
    }),
    params: Joi.object({
      id: Joi.string().trim(),
    }),
  },
};
