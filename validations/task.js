const { Joi } = require('express-validation');

module.exports = {
  createTask: {
    body: Joi.object({
      description: Joi.string().trim().required(),
      status: Joi.string().trim().uppercase().valid('OPEN')
        .default('OPEN'),
    }),
  },
};
