const cors = require('cors');
const express = require('express');
require('express-async-errors');
const helmet = require('helmet');
const { ValidationError } = require('express-validation');
const routes = require('../routes');
const requestError = require('./requestError');

const app = express();

// For parsing request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// For securing app by setting various HTTP headers
app.use(helmet());

// For enabling CORS
app.use(cors());

// Register routes
app.use('/api/v1', routes);

// Error handler
app.use((req, res, next) => {
  const err = new Error(`${req.method} ${req.path} not found`);
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  if (err instanceof ValidationError) {
    err.status = err.statusCode;
  }

  if (!err.status) err.status = 500;

  const error = requestError(err.status, err.message);
  if (err.status === 400) error.errors = err.details.body.map((e) => ({ message: e.message }));
  res.status(err.status).json(error);
});

module.exports = app;
