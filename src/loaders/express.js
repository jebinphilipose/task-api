const cors = require('cors');
const express = require('express');
require('express-async-errors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
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

// For gzip compression of response body
app.use(compression());

// For logging requests
app.use(morgan('combined'));

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

  if (err.meta && err.meta.cause === 'Record to update not found.') {
    return res.status(400).json(requestError(400, 'Record to update not found'));
  }

  if (!err.status) err.status = 500;

  const error = requestError(err.status, err.message);
  if (err.status === 400 && err.details && err.details.body) error.errors = err.details.body.map((e) => ({ message: e.message }));
  if (err.status === 400 && err.details && err.details.params) error.errors = err.details.params.map((e) => ({ message: e.message }));
  if (err.status === 400 && err.details && err.details.query) error.errors = err.details.query.map((e) => ({ message: e.message }));
  res.status(err.status).json(error);
});

module.exports = app;
